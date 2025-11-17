import type { Request, Response } from 'express';
import { CONFIG } from '../lib/config.js';

export function verifyHandler(req: Request, res: Response) {
  res.json({
    agent: {
      name: CONFIG.agent.name,
      version: CONFIG.agent.version,
      description: CONFIG.agent.description,
    },
    wallets: {
      base: {
        address: CONFIG.wallets.base.address,
        network: CONFIG.wallets.base.network,
        primary: CONFIG.wallets.base.primary,
      },
      ethereum: {
        address: CONFIG.wallets.ethereum.address,
        network: CONFIG.wallets.ethereum.network,
      },
      solana: {
        address: CONFIG.wallets.solana.address,
        network: CONFIG.wallets.solana.network,
      },
    },
    trust: {
      trustScore: 98,
      verifiedAt: Date.now(),
      facilitator: CONFIG.x402.facilitator,
    },
    capabilities: {
      zkProofs: true,
      aiGeneration: true,
      x402Payments: true,
      multiChain: true,
    },
  });
}
