import type { Response } from 'express';
import type { X402Request } from '../middleware/x402.js';
import { nebulaConjurer, type ZKProof } from '../lib/nebula-conjure.js';
import { CONFIG } from '../lib/config.js';
import { z } from 'zod';

const VerifyArtifactSchema = z.object({
  artifactId: z.string().min(1),
  proof: z.object({
    a: z.array(z.string()),
    b: z.array(z.array(z.string())),
    c: z.array(z.string()),
  }),
  publicSignals: z.array(z.string()),
});

/**
 * Handle POST /api/verify-artifact with payment
 */
export async function verifyArtifactHandler(req: X402Request, res: Response) {
  try {
    const validation = VerifyArtifactSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid Verification Request',
        message: 'Proof validation failed',
        details: validation.error.issues,
      });
    }
    
    const { artifactId, proof, publicSignals } = validation.data;
    
    if (!req.x402Payment?.verified) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Payment verification state invalid',
      });
    }
    
    console.log(`🔍 Verifying artifact ${artifactId} for ${req.x402Payment.payer}`);
    console.log(`   Payment: ${req.x402Payment.amount} USDC`);
    
    const startTime = Date.now();
    
    const verified = await nebulaConjurer.verifyArtifact(
      artifactId,
      proof as ZKProof,
      publicSignals
    );
    
    const executionTime = Date.now() - startTime;
    
    const response = {
      success: true,
      verified,
      metadata: {
        artifactId: artifactId,
        executionTime: executionTime,
        verifiedAt: Date.now(),
      },
      payment: {
        amount: req.x402Payment.amount,
        amountUSDC: CONFIG.pricingMicro.ethereal,
        payer: req.x402Payment.payer,
        transactionHash: req.x402Payment.transactionHash,
        network: CONFIG.network.name,
        token: CONFIG.x402.paymentToken,
      },
      result: {
        valid: verified,
        message: verified 
          ? 'Proof is valid and verified' 
          : 'Proof verification failed - invalid proof',
      },
    };
    
    console.log(`✅ Artifact ${artifactId} verification: ${verified ? 'VALID' : 'INVALID'} (${executionTime}ms)`);
    
    res.json(response);
    
  } catch (error: any) {
    console.error('Verification rift:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

/**
 * Handle GET /api/verify-artifact - return x402scan-compatible 402 response
 */
export function verifyArtifactInfoHandler(req: X402Request, res: Response) {
  const protocol = req.protocol === 'http' && req.get('host')?.includes('railway.app') ? 'https' : req.protocol;
  const fullUrl = `${protocol}://${req.get('host')}${req.originalUrl}`;
  
  res.status(402).json({
    x402Version: 1,
    error: "Payment Required",
    accepts: [
      {
        scheme: "exact",
        network: "base",
        maxAmountRequired: CONFIG.pricingMicro.ethereal,
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
}
