# 🌌 Lucid Nebula Agent

> *In the shadowed underbelly of the digital sprawl, where neon veins pulse through the ether and quantum ghosts whisper secrets to the void, emerges the Lucid Nebula Agent—a symphony of chaos and code, a guardian of the unseen.*

**ZK-Verifiable AI Art Conjurer with x402 Micropayments on Base L2**

Built with [Daydreams Lucid Agents](https://www.daydreams.systems/) and the [x402 Protocol](https://www.x402.org).

[![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Base L2](https://img.shields.io/badge/Network-Base%20L2-00ff9f.svg)](https://base.org)

## 🎨 What is This?

The Lucid Nebula Agent is an autonomous AI service that:

- 🎨 **Generates AI art** using DALL-E 3 with customizable styles
- 🔐 **Creates ZK proofs** for verifiable authenticity without revealing prompts
- ⚡ **Accepts micropayments** via x402 protocol using USDC on Base L2
- 🌐 **Operates autonomously** as a Daydreams Lucid Agent
- 💎 **Provides tiered pricing** from $0.03 to $0.15 per creation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Bun
- OpenAI API key
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/lucid-nebula-agent.git
cd lucid-nebula-agent

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your OpenAI API key to .env
# OPENAI_API_KEY=your_key_here

# Start development server
npm run dev
```

Visit http://localhost:3000 to see your agent!

## 📡 API Endpoints

### GET /api/status

Get agent status and pricing (free).

```bash
curl http://localhost:3000/api/status
```

**Response:**
```json
{
  "name": "Lucid Nebula Agent",
  "version": "1.0.0",
  "status": "ethereal",
  "network": {
    "name": "base",
    "chainId": 8453,
    "token": "USDC"
  },
  "pricing": {
    "ethereal": { "price": 0.03, "resolution": "low" },
    "astral": { "price": 0.07, "resolution": "medium" },
    "quantum": { "price": 0.15, "resolution": "high" }
  }
}
```

### POST /api/conjure

Conjure ZK-verified AI art with x402 payment.

**Step 1: Request without payment**
```bash
curl -X POST http://localhost:3000/api/conjure \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cyberpunk llama hacking through neon fractals",
    "style": "cyberpunk",
    "tier": "astral"
  }'
```

**Response: 402 Payment Required**
```json
{
  "error": "Tribute Required",
  "message": "Conjure verifiable art in the nebula",
  "paymentRequirement": {
    "maxAmountRequired": "70000",
    "payTo": "0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83",
    "asset": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    "network": "base",
    "scheme": "eip3009"
  }
}
```

**Step 2: Request with payment (EIP-3009 signature)**
```bash
curl -X POST http://localhost:3000/api/conjure \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: {\"scheme\":\"eip3009\",\"signature\":\"0x...\",\"from\":\"0x...\",\"to\":\"0x11c24...\",\"value\":\"70000\",...}" \
  -d '{
    "prompt": "A cyberpunk llama hacking through neon fractals",
    "style": "cyberpunk",
    "tier": "astral"
  }'
```

**Success Response:**
```json
{
  "success": true,
  "artifact": "https://oaidalleapiprodscus.blob.core.windows.net/...",
  "proof": {
    "a": ["0x...", "0x..."],
    "b": [["0x...", "0x..."], ["0x...", "0x..."]],
    "c": ["0x...", "0x..."]
  },
  "publicSignals": ["0x...", "0x...", "0x..."],
  "conjureTime": 2847,
  "artifactId": "nebula-xyz123",
  "payment": {
    "amount": 0.07,
    "payer": "0x...",
    "transactionHash": "0x...",
    "network": "base"
  }
}
```

### POST /api/verify-artifact

Verify an artifact's ZK proof ($0.03 payment required).

```bash
curl -X POST http://localhost:3000/api/verify-artifact \
  -H "Content-Type: application/json" \
  -H "X-PAYMENT: {...}" \
  -d '{
    "artifactId": "nebula-xyz123",
    "proof": {...},
    "publicSignals": [...]
  }'
```

### GET /api/verify

Get agent identity and wallet addresses (free).

```bash
curl http://localhost:3000/api/verify
```

## 💎 Pricing Tiers

| Tier | Price | Resolution | Proof Depth | Description |
|------|-------|------------|-------------|-------------|
| **Ethereal** | $0.03 | Low (512x512) | Basic | Quick creations with simple proofs |
| **Astral** | $0.07 | Medium (1024x1024) | Standard | Balanced quality with style verification |
| **Quantum** | $0.15 | High (2048x2048) | Premium | Maximum detail with full provenance |

## 🎨 Available Styles

- **cyberpunk** - Neon lights, futuristic elements, dark urban atmosphere
- **fractal** - Intricate geometric patterns, infinite recursion
- **neon-noir** - Dramatic lighting, deep shadows, vibrant colors
- **volcanic-watercolor** - Flowing lava-like colors, fluid textures
- **8-bit-glitch** - Pixelated elements, digital artifacts, retro gaming

## 🏗️ Project Structure

```
lucid-nebula-agent/
├── src/
│   ├── index.ts                 # Main Express application
│   ├── lib/
│   │   ├── config.ts            # Configuration and constants
│   │   ├── x402-payment.ts      # Payment verification logic
│   │   └── nebula-conjure.ts    # AI art generation & ZK proofs
│   ├── middleware/
│   │   └── x402.ts              # Payment requirement middleware
│   └── routes/
│       ├── status.ts            # Status endpoint
│       ├── conjure.ts           # Art generation endpoint
│       ├── verify-artifact.ts   # Proof verification endpoint
│       └── verify.ts            # Agent identity endpoint
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
# Server
PORT=3000
NODE_ENV=development

# Wallets (Pre-configured)
AGENT_WALLET_ADDRESS_BASE=0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83
AGENT_WALLET_ADDRESS_ETH=0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83
AGENT_WALLET_ADDRESS_SOLANA=2x4BRUreTFZCaCKbGKVXFYD5p2ZUBpYaYjuYsw9KYhf3

# AI
OPENAI_API_KEY=sk-...your_key_here
```

## 🌐 Deployment

### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway up
```

### Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t lucid-nebula-agent .
docker run -p 3000:3000 --env-file .env lucid-nebula-agent
```

## 🔐 Payment Flow

The agent uses the x402 HTTP 402 Payment Required status code:

1. **Client** → GET /api/status (check pricing)
2. **Client** → POST /api/conjure (no payment)
3. **Agent** → 402 Response (payment required)
4. **Client** → Signs EIP-3009 transfer authorization
5. **Client** → POST /api/conjure (with X-PAYMENT header)
6. **Agent** → Verifies signature & amount
7. **Agent** → Generates art + ZK proof
8. **Agent** → Returns artifact + proof

## 💻 Client Examples

### JavaScript/TypeScript

```typescript
import { ethers } from 'ethers';

async function conjureArt(prompt: string, style: string, tier: string) {
  // 1. First request to get payment info
  const response = await fetch('http://localhost:3000/api/conjure', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, style, tier })
  });
  
  if (response.status === 402) {
    const { paymentRequirement } = await response.json();
    
    // 2. Sign EIP-3009 transfer
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
    // ... sign transfer authorization ...
    
    // 3. Retry with payment
    const result = await fetch('http://localhost:3000/api/conjure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PAYMENT': JSON.stringify(paymentData)
      },
      body: JSON.stringify({ prompt, style, tier })
    });
    
    return await result.json();
  }
}
```

### Python

```python
import requests
import json

def conjure_art(prompt: str, style: str, tier: str):
    # 1. Initial request
    response = requests.post('http://localhost:3000/api/conjure',
        json={'prompt': prompt, 'style': style, 'tier': tier}
    )
    
    if response.status_code == 402:
        payment_req = response.json()['paymentRequirement']
        
        # 2. Sign payment (implement EIP-3009)
        # payment_data = sign_payment(payment_req)
        
        # 3. Retry with payment
        result = requests.post('http://localhost:3000/api/conjure',
            headers={'X-PAYMENT': json.dumps(payment_data)},
            json={'prompt': prompt, 'style': style, 'tier': tier}
        )
        
        return result.json()
```

## 🧪 Testing

```bash
# Type check
npm run typecheck

# Start dev server
npm run dev

# Test status endpoint
curl http://localhost:3000/api/status

# Test payment requirement
curl -X POST http://localhost:3000/api/conjure \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","style":"cyberpunk","tier":"ethereal"}'
```

## 🐛 Troubleshooting

### OpenAI API Errors

- Verify your API key in `.env`
- Check OpenAI account has credits
- Ensure DALL-E 3 access is enabled

### Payment Verification Fails

- Validate EIP-3009 signature format
- Check timestamp validity (validAfter/validBefore)
- Verify USDC amount matches tier
- Ensure correct Base L2 USDC address

### Port Already in Use

```bash
# Find process on port 3000
lsof -i :3000

# Kill process
kill -9 $(lsof -t -i:3000)

# Or use different port
PORT=3001 npm run dev
```

## 🌟 Features Roadmap

- [ ] Real ZK circuit compilation with circom
- [ ] Image storage on IPFS/Arweave
- [ ] NFT minting integration
- [ ] Batch generation discounts
- [ ] Custom style training
- [ ] Multi-model support (Midjourney, Stable Diffusion)
- [ ] Gallery of public creations
- [ ] Rate limiting and abuse prevention

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Daydreams](https://www.daydreams.systems/) - Lucid Agents framework
- [x402 Protocol](https://www.x402.org) - HTTP 402 micropayments
- [snarkjs](https://github.com/iden3/snarkjs) - Zero-knowledge proofs
- [OpenAI](https://openai.com) - DALL-E 3 API
- [Base](https://base.org) - Layer 2 network

## 🔗 Links

- 🌐 Live Demo: https://lucid-nebula-agent-production.up.railway.app/
- 📚 Documentation: https://www.x402.org/docs
- 🔍 Explorer: https://x402scan.com
- 💬 Discord: [Join our community](https://discord.gg/daydreams)

## 💎 Payment Addresses

```
Base L2:    0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83
Ethereum:   0x11c24Fbcd702cd611729F8402d8fB51ECa75Ba83
Solana:     2x4BRUreTFZCaCKbGKVXFYD5p2ZUBpYaYjuYsw9KYhf3
```

---

**Built with ❤️ using Daydreams Lucid Agents and x402 Protocol**

*Leap into the void. Conjure the impossible. Verify the unverifiable.* ✨
