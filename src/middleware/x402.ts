import type { Request, Response, NextFunction } from 'express';
import { paymentVerifier, type PaymentData, type VerifiedPayment } from '../lib/x402-payment.js';
import { CONFIG } from '../lib/config.js';

export interface X402Request extends Request {
  x402Payment?: VerifiedPayment;
}

export interface PaymentRequirementOptions {
  amount: number;
  description: string;
  tier?: 'ethereal' | 'astral' | 'quantum';
}

/**
 * Middleware to require x402 payment for an endpoint
 */
export function requirePayment(options: PaymentRequirementOptions) {
  return async (req: X402Request, res: Response, next: NextFunction) => {
    try {
      // Check for X-PAYMENT header
      const paymentHeader = req.headers['x-payment'];
      
      if (!paymentHeader) {
        // No payment provided, return 402 Payment Required with FULL schema
        return send402ResponseWithFullSchema(res, options, req);
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
        });
      }
      
      // Validate amount
      if (!paymentVerifier.validateAmount(verificationResult.amount, options.amount)) {
        return res.status(402).json({
          error: 'Insufficient Payment',
          message: `Required: $${options.amount}, Received: $${verificationResult.amount}`,
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
 * Send 402 Payment Required response with FULL x402 schema for x402scan
 */
function send402ResponseWithFullSchema(res: Response, options: PaymentRequirementOptions, req: X402Request) {
  const protocol = req.protocol === 'http' && req.get('host')?.includes('railway.app') ? 'https' : req.protocol;
  const fullUrl = `${protocol}://${req.get('host')}${req.originalUrl}`;
  
  // Determine which endpoint this is for
  const isConjure = req.originalUrl.includes('/conjure');
  const isVerifyArtifact = req.originalUrl.includes('/verify-artifact');
  
  // Get the appropriate micro amount
  const microAmount = Math.floor(options.amount * 1_000_000).toString();
  
  // Build the response based on endpoint
  if (isConjure) {
    res.status(402).json({
      x402Version: 1,
      error: "Payment Required",
      accepts: [
        {
          scheme: "exact",
          network: "base",
          maxAmountRequired: microAmount,
          resource: fullUrl,
          description: "Conjure ZK-verifiable AI art with DALL-E 3",
          mimeType: "application/json",
          payTo: CONFIG.wallets.base.address,
          maxTimeoutSeconds: 120,
          asset: CONFIG.x402.usdcAddress,
          outputSchema: {
            input: {
              type: "http",
              method: "POST",
              bodyType: "json",
              bodyFields: {
                prompt: {
                  type: "string",
                  required: true,
                  description: "Your art prompt (1-2000 characters)",
                },
                style: {
                  type: "string",
                  required: true,
                  description: "Artistic style to apply",
                  enum: ["cyberpunk", "fractal", "neon-noir", "volcanic-watercolor", "8-bit-glitch"],
                },
                tier: {
                  type: "string",
                  required: true,
                  description: "Quality tier (ethereal=$0.03, astral=$0.07, quantum=$0.15)",
                  enum: ["ethereal", "astral", "quantum"],
                },
              },
            },
            output: {
              success: { type: "boolean" },
              artifact: { type: "string", description: "Generated image URL" },
              metadata: {
                type: "object",
                properties: {
                  artifactId: { type: "string" },
                  tier: { type: "string" },
                  style: { type: "string" },
                  executionTime: { type: "number" },
                  conjuredAt: { type: "number" },
                },
              },
              proof: {
                type: "object",
                properties: {
                  zkProof: { type: "object" },
                  publicSignals: { type: "array" },
                },
              },
            },
          },
        },
      ],
    });
  } else if (isVerifyArtifact) {
    res.status(402).json({
      x402Version: 1,
      error: "Payment Required",
      accepts: [
        {
          scheme: "exact",
          network: "base",
          maxAmountRequired: microAmount,
          resource: fullUrl,
          description: "Verify artifact zero-knowledge proof",
          mimeType: "application/json",
          payTo: CONFIG.wallets.base.address,
          maxTimeoutSeconds: 60,
          asset: CONFIG.x402.usdcAddress,
          outputSchema: {
            input: {
              type: "http",
              method: "POST",
              bodyType: "json",
              bodyFields: {
                artifactId: {
                  type: "string",
                  required: true,
                  description: "Unique artifact identifier",
                },
                proof: {
                  type: "object",
                  required: true,
                  description: "ZK proof to verify",
                },
                publicSignals: {
                  type: "array",
                  required: true,
                  description: "Public signals for verification",
                },
              },
            },
            output: {
              success: { type: "boolean" },
              verified: { type: "boolean", description: "Whether the proof is valid" },
              metadata: {
                type: "object",
                properties: {
                  artifactId: { type: "string" },
                  executionTime: { type: "number" },
                  verifiedAt: { type: "number" },
                },
              },
            },
          },
        },
      ],
    });
  } else {
    // Generic 402 response for other endpoints
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
        },
      ],
    });
  }
}
