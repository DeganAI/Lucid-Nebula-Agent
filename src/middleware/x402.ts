import type { Request, Response, NextFunction } from 'express';
import { paymentVerifier, type PaymentData, type VerifiedPayment } from '../lib/x402-payment.js';
import { CONFIG } from '../lib/config.js';

export interface X402Request extends Request {
  x402Payment?: VerifiedPayment;
}

export interface PaymentRequirementOptions {
  amount: number;
  description: string;
}

/**
 * Middleware to require x402 payment for an endpoint
 * IMPORTANT: This should ONLY be applied to POST routes
 * GET routes should handle 402 responses themselves
 */
export function requirePayment(options: PaymentRequirementOptions) {
  return async (req: X402Request, res: Response, next: NextFunction) => {
    try {
      // Check for X-PAYMENT header
      const paymentHeader = req.headers['x-payment'];
      
      if (!paymentHeader) {
        // No payment provided, return 402 Payment Required
        return send402Response(res, options, req.originalUrl);
      }
      
      // Parse payment data
      let paymentData: PaymentData;
      try {
        paymentData = typeof paymentHeader === 'string' 
          ? JSON.parse(paymentHeader)
          : paymentHeader;
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid Payment',
          message: 'Could not parse X-PAYMENT header',
        });
      }
      
      // Verify the payment
      const verificationResult = await paymentVerifier.verifyPayment(paymentData);
      
      if (!verificationResult.verified) {
        return res.status(402).json({
          error: 'Payment Verification Failed',
          message: verificationResult.error || 'Payment could not be verified',
          paymentRequirement: buildPaymentRequirement(options, req.originalUrl),
        });
      }
      
      // Validate amount
      if (!paymentVerifier.validateAmount(verificationResult.amount, options.amount)) {
        return res.status(402).json({
          error: 'Insufficient Payment',
          message: `Required: $${options.amount}, Received: $${verificationResult.amount}`,
          paymentRequirement: buildPaymentRequirement(options, req.originalUrl),
        });
      }
      
      // Payment verified! Attach to request and continue
      req.x402Payment = verificationResult;
      
      console.log(`✅ Payment verified: $${verificationResult.amount} from ${verificationResult.payer}`);
      
      next();
      
    } catch (error: any) {
      console.error('Payment middleware error:', error);
      res.status(500).json({
        error: 'Payment Processing Error',
        message: error.message || 'Could not process payment',
      });
    }
  };
}

/**
 * Send 402 Payment Required response with x402 details
 */
function send402Response(res: Response, options: PaymentRequirementOptions, resource: string) {
  const microAmount = Math.floor(options.amount * 1_000_000).toString();
  const protocol = 'https';
  const fullUrl = resource.includes('://') ? resource : `${protocol}://lucid-nebula-agent-production.up.railway.app${resource}`;
  
  res.status(402).json({
    x402Version: 1,
    error: "Payment Required",
    accepts: [
      {
        scheme: "exact",
        network: "base",
        maxAmountRequired: microAmount,
        resource: fullUrl,
        description: options.description,
        mimeType: "application/json",
        payTo: CONFIG.wallets.base.address,
        maxTimeoutSeconds: 120,
        asset: CONFIG.x402.usdcAddress,
      }
    ]
  });
}

/**
 * Build payment requirement object for 402 responses
 */
function buildPaymentRequirement(options: PaymentRequirementOptions, resource: string) {
  const microAmount = Math.floor(options.amount * 1_000_000).toString();
  const protocol = 'https';
  const fullUrl = resource.includes('://') ? resource : `${protocol}://lucid-nebula-agent-production.up.railway.app${resource}`;
  
  return {
    x402Version: 1,
    error: "Payment Required",
    accepts: [
      {
        scheme: "exact",
        network: "base",
        maxAmountRequired: microAmount,
        resource: fullUrl,
        description: options.description,
        mimeType: "application/json",
        payTo: CONFIG.wallets.base.address,
        maxTimeoutSeconds: 120,
        asset: CONFIG.x402.usdcAddress,
      }
    ]
  };
}
