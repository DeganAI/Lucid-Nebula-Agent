import * as dotenv from 'dotenv';

dotenv.config();

export const CONFIG = {
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    env: process.env.NODE_ENV || 'development',
  },
  
  network: {
    name: 'base',
    chainId: 8453,
    rpcUrl: 'https://mainnet.base.org',
  },
  
  wallets: {
    base: {
      address: process.env.AGENT_WALLET_ADDRESS_BASE || '0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83',
      network: 'Base L2',
      primary: true,
    },
    ethereum: {
      address: process.env.AGENT_WALLET_ADDRESS_ETH || '0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83',
      network: 'Ethereum Mainnet',
    },
    solana: {
      address: process.env.AGENT_WALLET_ADDRESS_SOLANA || '2x4BRUreTFZCaCKbGKVXFYD5p2ZUBpYaYjuYsw9KYhf3',
      network: 'Solana Mainnet',
    },
  },
  
  x402: {
    facilitator: 'Daydreams',
    facilitatorUrl: process.env.DAYDREAMS_FACILITATOR_URL || 'https://facilitator.daydreams.systems',
    paymentToken: 'USDC',
    usdcAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base USDC
  },
  
  pricing: {
    ethereal: 0.03,   // $0.03 - 30,000 USDC (6 decimals)
    astral: 0.07,     // $0.07 - 70,000 USDC
    quantum: 0.15,    // $0.15 - 150,000 USDC
  },
  
  pricingMicro: {
    ethereal: '30000',
    astral: '70000',
    quantum: '150000',
  },
  
  tiers: {
    ethereal: {
      price: 0.03,
      resolution: 'low',
      proofDepth: 'basic',
      description: 'Fleeting visions, simple proofs for swift summons.',
      size: '512x512',
    },
    astral: {
      price: 0.07,
      resolution: 'medium',
      proofDepth: 'standard',
      description: 'Deeper dives, verifying artistic lineage.',
      size: '1024x1024',
    },
    quantum: {
      price: 0.15,
      resolution: 'high',
      proofDepth: 'premium',
      description: 'Epic tapestries, proving non-plagiarism and quantum origins.',
      size: '2048x2048',
    },
  },
  
  styles: [
    'cyberpunk',
    'fractal',
    'neon-noir',
    'volcanic-watercolor',
    '8-bit-glitch',
  ],
  
  ai: {
    openaiKey: process.env.OPENAI_API_KEY || '',
    model: 'dall-e-3',
    timeout: 120000, // 2 minutes
  },
  
  circuits: {
    path: process.env.CIRCUIT_PATH || './circuits',
  },
  
  agent: {
    name: 'Lucid Nebula Agent',
    version: '1.0.0',
    description: 'ZK-verifiable AI art conjurer with x402 micropayments',
  },
};

export const STYLE_PROMPTS: Record<string, string> = {
  cyberpunk: 'in a cyberpunk style with neon lights, futuristic elements, and dark urban atmosphere',
  fractal: 'in a fractal art style with intricate geometric patterns, infinite recursion, and mathematical beauty',
  'neon-noir': 'in a neon noir style with dramatic lighting, deep shadows, and vibrant neon colors',
  'volcanic-watercolor': 'in a volcanic watercolor style with flowing lava-like colors, fluid textures, and ethereal blending',
  '8-bit-glitch': 'in an 8-bit glitch art style with pixelated elements, digital artifacts, and retro gaming aesthetics',
};
