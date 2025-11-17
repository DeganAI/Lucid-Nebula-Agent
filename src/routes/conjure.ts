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

/**
 * Handle POST /api/conjure with payment
 */
export async function conjureHandler(req: X402Request, res: Response) {
  try {
    // Validate request body
    const validation = ConjureRequestSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({
        error: 'Invalid Incantation',
        message: 'Whisper validation failed',
        details: validation.error.issues,
      });
    }
    
    const { prompt, style, tier } = validation.data;
    
    // Verify payment exists (middleware should have set this)
    if (!req.x402Payment?.verified) {
      return res.status(500).json({
        error: 'Void Anomaly',
        message: 'Tribute state shattered',
      });
    }
    
    console.log(`🌌 Conjuring for ${req.x402Payment.payer} (style: ${style}, tier: ${tier})`);
    
    // Create conjure request
    const conjureRequest: ConjureRequest = {
      prompt,
      style,
      tier,
    };
    
    // Generate the artifact
    const result = await nebulaConjurer.conjure(conjureRequest);
    
    // Build response
    const response = {
      success: result.success,
      artifact: result.artifact,
      proof: result.proof,
      publicSignals: result.publicSignals,
      conjureTime: result.conjureTime,
      artifactId: result.artifactId,
      tier: result.tier,
      payment: {
        amount: req.x402Payment.amount,
        payer: req.x402Payment.payer,
        transactionHash: req.x402Payment.transactionHash,
        network: CONFIG.network.name,
        token: CONFIG.x402.paymentToken,
      },
      timestamp: Date.now(),
    };
    
    console.log(`✅ Artifact ${result.artifactId} born in ${result.conjureTime}ms`);
    
    res.json(response);
    
  } catch (error: any) {
    console.error('Conjure rift:', error);
    res.status(500).json({
      error: 'Conjure Failed',
      message: error.message || 'Chaos in creation',
    });
  }
}

/**
 * Handle GET /api/conjure - return x402scan-compatible 402 response
 */
export function conjureInfoHandler(req: X402Request, res: Response) {
  res.status(402).json({
    x402Version: 1,
    accepts: [
      {
        scheme: "exact",
        network: "base",
        maxAmountRequired: CONFIG.pricingMicro.astral,
        resource: `${req.protocol}://${req.get('host')}/api/conjure`,
        description: "Conjure verifiable art in the nebula",
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
                description: "Vision whisper - the prompt for your art (1-2000 characters)",
              },
              style: {
                type: "string",
                required: true,
                description: "Artistic veil to apply",
                enum: CONFIG.styles,
              },
              tier: {
                type: "string",
                required: true,
                description: "Essence depth - determines quality and proof complexity",
                enum: ["ethereal", "astral", "quantum"],
              },
            },
          },
          output: {
            type: "object",
            properties: {
              success: {
                type: "boolean",
                description: "Creation status",
              },
              artifact: {
                type: "string",
                description: "Image URL",
              },
              proof: {
                type: "object",
                description: "ZK seal for verification",
              },
              publicSignals: {
                type: "array",
                description: "Visible echoes for proof validation",
              },
              conjureTime: {
                type: "number",
                description: "Birth duration in milliseconds",
              },
              artifactId: {
                type: "string",
                description: "Unique artifact identifier",
              },
              payment: {
                type: "object",
                description: "Payment confirmation details",
              },
            },
          },
        },
      },
    ],
  });
}
