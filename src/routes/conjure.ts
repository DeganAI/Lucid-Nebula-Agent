import type { Response } from 'express';
import type { X402Request } from '../middleware/x402.js';
import { nebulaConjurer, type ConjureRequest } from '../lib/nebula-conjure.js';
import { CONFIG } from '../lib/config.js';
import { z } from 'zod';

const ConjureRequestSchema = z.object({
  prompt: z.string().min(1, 'Prompt void').max(2000, 'Prompt overflows'),
  style: z.enum(['cyberpunk', 'fractal', 'neon-noir', 'volcanic-watercolor', '8-bit-glitch']),
  tier: z.enum(['ethereal', 'astral', 'quantum']),
});

export async function conjureHandler(req: X402Request, res: Response) {
  try {
    const validation = ConjureRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid Incantation',
        message: 'Whisper validation failed',
        details: validation.error.issues,
      });
    }
    
    const { prompt, style, tier } = validation.data;
    
    if (!req.x402Payment?.verified) {
      return res.status(500).json({
        error: 'Internal Server Error',
        message: 'Payment verification state invalid',
      });
    }
    
    console.log(`🌌 Conjuring for ${req.x402Payment.payer}`);
    console.log(`   Style: ${style}`);
    console.log(`   Tier: ${tier}`);
    console.log(`   Payment: ${req.x402Payment.amount} USDC`);
    
    const conjureRequest: ConjureRequest = {
      prompt,
      style,
      tier,
    };
    
    const result = await nebulaConjurer.conjure(conjureRequest);
    
    if (!result.success) {
      return res.status(500).json({
        error: 'Conjure Failed',
        message: 'Failed to generate artifact',
        executionTime: result.conjureTime,
      });
    }
    
    const response = {
      success: true,
      artifact: result.artifact,
      metadata: {
        artifactId: result.artifactId,
        tier: result.tier,
        style: style,
        executionTime: result.conjureTime,
        conjuredAt: Date.now(),
      },
      proof: {
        zkProof: result.proof,
        publicSignals: result.publicSignals,
      },
      payment: {
        amount: req.x402Payment.amount,
        amountUSDC: CONFIG.pricingMicro[tier],
        payer: req.x402Payment.payer,
        transactionHash: req.x402Payment.transactionHash,
        network: CONFIG.network.name,
        token: CONFIG.x402.paymentToken,
      },
      result: {
        message: 'Artifact conjured successfully',
        imageUrl: result.artifact,
      },
    };
    
    console.log(`✅ Artifact ${result.artifactId} conjured in ${result.conjureTime}ms`);
    
    res.json(response);
  } catch (error: any) {
    console.error('Conjure endpoint error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  }
}

export function conjureInfoHandler(req: X402Request, res: Response) {
  const protocol = req.protocol === 'http' && req.get('host')?.includes('railway.app') ? 'https' : req.protocol;
  const fullUrl = `${protocol}://${req.get('host')}${req.originalUrl}`;
  
  res.status(402).json({
    x402Version: 1,
    error: "Payment Required",
    accepts: [
      {
        scheme: "exact",
        network: "base",
        maxAmountRequired: CONFIG.pricingMicro.astral,
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
}
