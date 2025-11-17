import type { Request, Response } from 'express';
import { CONFIG } from '../lib/config.js';

export function statusHandler(req: Request, res: Response) {
  res.json({
    name: CONFIG.agent.name,
    version: CONFIG.agent.version,
    status: 'ethereal',
    network: {
      name: CONFIG.network.name,
      chainId: CONFIG.network.chainId,
      token: CONFIG.x402.paymentToken,
    },
    payment: {
      facilitator: CONFIG.x402.facilitator,
      walletAddress: CONFIG.wallets.base.address,
    },
    pricing: {
      ethereal: {
        price: CONFIG.pricing.ethereal,
        resolution: CONFIG.tiers.ethereal.resolution,
        proofDepth: CONFIG.tiers.ethereal.proofDepth,
        description: CONFIG.tiers.ethereal.description,
      },
      astral: {
        price: CONFIG.pricing.astral,
        resolution: CONFIG.tiers.astral.resolution,
        proofDepth: CONFIG.tiers.astral.proofDepth,
        description: CONFIG.tiers.astral.description,
      },
      quantum: {
        price: CONFIG.pricing.quantum,
        resolution: CONFIG.tiers.quantum.resolution,
        proofDepth: CONFIG.tiers.quantum.proofDepth,
        description: CONFIG.tiers.quantum.description,
      },
    },
    styles: CONFIG.styles,
    capabilities: {
      zkProofs: true,
      aiGeneration: true,
      multiChain: true,
    },
  });
}
