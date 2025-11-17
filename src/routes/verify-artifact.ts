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
    // Validate request body
    const validation = VerifyArtifactSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid Verification Request',
        message: 'Proof validation failed',
        details: validation.error.issues,
      });
    }
    
    const { artifactId, proof, publicSignals } = validation.data;
    
    // Verify payment exists (middleware should have set this)
    if (!req.x402Payment?.verified) {
      return res.status(500).json({
        error: 'Void Anomaly',
        message: 'Tribute state shattered',
      });
    }
    
    console.log(`🔍 Verifying artifact ${artifactId} for ${req.x402Payment.payer}`);
    
    const startTime = Date.now();
    
    // Verify the artifact's proof
    const verified = await nebulaConjurer.verifyArtifact(
      artifactId,
      proof as ZKProof,
      publicSignals
    );
    
    const conjureTime = Date.now() - startTime;
    
    const response = {
      success: true,
      verified,
      conjureTime,
      artifactId,
      payment: {
        amount: req.x402Payment.amount,
        payer: req.x402Payment.payer,
        transactionHash: req.x402Payment.transactionHash,
        network: CONFIG.network.name,
        token: CONFIG.x402.paymentToken,
      },
      timestamp: Date.now(),
    };
    
    console.log(`✅ Artifact ${artifactId} verification: ${verified} (${conjureTime}ms)`);
    
    res.json(response);
    
  } catch (error: any) {
    console.error('Verification rift:', error);
    res.status(500).json({
      error: 'Verification Failed',
      message: error.message || 'Chaos in verification',
    });
  }
}

/**
 * Handle GET /api/verify-artifact - return x402 payment info
 */
export function verifyArtifactInfoHandler(req: X402Request, res: Response) {
  res.status(402).json({
    x402Version: 1,
    accepts: [
      {
        scheme: 'eip3009',
        network: CONFIG.network.name,
        maxAmountRequired: CONFIG.pricingMicro.ethereal,
        resource: 'https://lucid-nebula-agent-production.up.railway.app/api/verify-artifact',
        description: 'Verify artifact truth',
        mimeType: 'application/json',
        payTo: CONFIG.wallets.base.address,
        maxTimeoutSeconds: 60,
        asset: CONFIG.x402.usdcAddress,
        outputSchema: {
          input: {
            type: 'http',
            method: 'POST',
            bodyType: 'json',
            bodyFields: {
              artifactId: {
                type: 'string',
                required: true,
                description: 'Unique artifact identifier',
              },
              proof: {
                type: 'object',
                required: true,
                description: 'ZK proof to verify',
              },
              publicSignals: {
                type: 'array',
                required: true,
                description: 'Public signals for verification',
              },
            },
          },
          output: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                description: 'Verification request status',
              },
              verified: {
                type: 'boolean',
                description: 'Whether the proof is valid',
              },
              conjureTime: {
                type: 'number',
                description: 'Verification duration in milliseconds',
              },
              artifactId: {
                type: 'string',
                description: 'Verified artifact identifier',
              },
            },
          },
        },
      },
    ],
  });
}
