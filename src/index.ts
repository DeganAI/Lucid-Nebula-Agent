import express from 'express';
import cors from 'cors';
import { CONFIG } from './lib/config.js';
import { requirePayment } from './middleware/x402.js';
import { statusHandler } from './routes/status.js';
import { conjureHandler, conjureInfoHandler } from './routes/conjure.js';
import { verifyArtifactHandler, verifyArtifactInfoHandler } from './routes/verify-artifact.js';
import { verifyHandler } from './routes/verify.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Root endpoint - cyberpunk landing page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${CONFIG.agent.name}</title>
  <meta name="description" content="ZK-verifiable AI art conjurer with x402 micropayments">
  <meta property="og:title" content="${CONFIG.agent.name}">
  <meta property="og:description" content="Conjure verifiable digital dreams on Base L2">
  <meta property="og:image" content="/og-image.png">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16213e 100%);
      color: #00ff9f;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    body::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        repeating-linear-gradient(
          0deg,
          transparent,
          transparent 2px,
          rgba(0, 255, 159, 0.03) 2px,
          rgba(0, 255, 159, 0.03) 4px
        );
      pointer-events: none;
      animation: scanlines 8s linear infinite;
    }
    
    @keyframes scanlines {
      0% { transform: translateY(0); }
      100% { transform: translateY(50px); }
    }
    
    .container {
      max-width: 1000px;
      background: rgba(10, 10, 10, 0.8);
      border: 2px solid #00ff9f;
      border-radius: 10px;
      padding: 40px;
      box-shadow: 0 0 50px rgba(0, 255, 159, 0.3), inset 0 0 30px rgba(0, 255, 159, 0.1);
      position: relative;
      z-index: 1;
    }
    
    h1 {
      font-size: 2.5em;
      margin-bottom: 20px;
      text-shadow: 0 0 20px #00ff9f, 0 0 40px #00ff9f;
      animation: glow 2s ease-in-out infinite alternate;
    }
    
    @keyframes glow {
      from { text-shadow: 0 0 20px #00ff9f, 0 0 40px #00ff9f; }
      to { text-shadow: 0 0 30px #00ff9f, 0 0 60px #00ff9f, 0 0 80px #00ff9f; }
    }
    
    .ascii-art {
      color: #ff006e;
      font-size: 0.6em;
      line-height: 1.2;
      margin: 20px 0;
      text-shadow: 0 0 10px #ff006e;
    }
    
    .tagline {
      font-size: 1.2em;
      margin-bottom: 30px;
      color: #9d4edd;
      text-shadow: 0 0 10px #9d4edd;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .feature {
      background: rgba(0, 255, 159, 0.1);
      border: 1px solid #00ff9f;
      padding: 20px;
      border-radius: 5px;
      transition: all 0.3s ease;
    }
    
    .feature:hover {
      background: rgba(0, 255, 159, 0.2);
      box-shadow: 0 0 20px rgba(0, 255, 159, 0.4);
      transform: translateY(-5px);
    }
    
    .feature h3 {
      color: #ff006e;
      margin-bottom: 10px;
    }
    
    .endpoints {
      margin: 30px 0;
    }
    
    .endpoint {
      background: rgba(157, 78, 221, 0.1);
      border-left: 3px solid #9d4edd;
      padding: 15px;
      margin: 10px 0;
      font-family: monospace;
    }
    
    .endpoint .method {
      color: #ff006e;
      font-weight: bold;
      margin-right: 10px;
    }
    
    .endpoint .path {
      color: #00ff9f;
    }
    
    .wallets {
      margin: 30px 0;
      padding: 20px;
      background: rgba(255, 0, 110, 0.1);
      border: 1px solid #ff006e;
      border-radius: 5px;
    }
    
    .wallet {
      margin: 10px 0;
      word-break: break-all;
    }
    
    .wallet .label {
      color: #9d4edd;
      font-weight: bold;
    }
    
    footer {
      margin-top: 40px;
      text-align: center;
      color: #9d4edd;
      font-size: 0.9em;
    }
    
    a {
      color: #00ff9f;
      text-decoration: none;
      transition: all 0.3s ease;
    }
    
    a:hover {
      color: #ff006e;
      text-shadow: 0 0 10px #ff006e;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🌌 ${CONFIG.agent.name}</h1>
    
    <pre class="ascii-art">
    /\\___/\\
   (  o.o  )
    > ^ <    NEBULA
   /|     |\\   AGENT
  (_|     |_)
    </pre>
    
    <p class="tagline">
      ${CONFIG.agent.description}
    </p>
    
    <div class="features">
      <div class="feature">
        <h3>⚡ x402 Micropayments</h3>
        <p>Ephemeral USDC transfers on Base L2</p>
      </div>
      
      <div class="feature">
        <h3>🔮 ZK Proofs</h3>
        <p>Verifiable authenticity without revealing secrets</p>
      </div>
      
      <div class="feature">
        <h3>🎨 AI Art Generation</h3>
        <p>DALL-E 3 powered creation with style modifiers</p>
      </div>
      
      <div class="feature">
        <h3>🌐 Multi-Chain</h3>
        <p>Base, Ethereum, and Solana support</p>
      </div>
    </div>
    
    <div class="endpoints">
      <h2>📡 API Endpoints</h2>
      
      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/api/status</span>
        <p>View agent status and pricing (free)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">POST</span>
        <span class="path">/api/conjure</span>
        <p>Conjure ZK-verified AI art ($0.03 - $0.15)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">POST</span>
        <span class="path">/api/verify-artifact</span>
        <p>Verify artifact proofs ($0.03)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/api/verify</span>
        <p>Verify agent identity and wallets (free)</p>
      </div>
    </div>
    
    <div class="wallets">
      <h2>💎 Payment Addresses</h2>
      <div class="wallet">
        <span class="label">Base L2:</span> ${CONFIG.wallets.base.address}
      </div>
      <div class="wallet">
        <span class="label">Ethereum:</span> ${CONFIG.wallets.ethereum.address}
      </div>
      <div class="wallet">
        <span class="label">Solana:</span> ${CONFIG.wallets.solana.address}
      </div>
    </div>
    
    <footer>
      <p>⚡ Powered by Daydreams Lucid Agents & x402 Protocol</p>
      <p>
        <a href="https://www.daydreams.systems" target="_blank">Daydreams</a> |
        <a href="https://www.x402.org" target="_blank">x402</a> |
        <a href="https://x402scan.com" target="_blank">x402scan</a>
      </p>
      <p style="margin-top: 20px;">v${CONFIG.agent.version} | Status: Ethereal ✨</p>
    </footer>
  </div>
</body>
</html>
  `);
});

// Favicon
app.get('/favicon.ico', (req, res) => {
  // Simple purple square favicon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#9d4edd"/>
    <text x="50" y="70" font-size="60" text-anchor="middle" fill="#00ff9f">N</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// OG Image
app.get('/og-image.png', (req, res) => {
  // Return a simple gradient for OG preview
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1a0a2e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#grad)"/>
    <text x="600" y="315" font-family="monospace" font-size="60" text-anchor="middle" fill="#00ff9f">Lucid Nebula Agent</text>
    <text x="600" y="380" font-family="monospace" font-size="30" text-anchor="middle" fill="#9d4edd">ZK-Verifiable AI Art on Base L2</text>
  </svg>`;
  res.setHeader('Content-Type', 'image/svg+xml');
  res.send(svg);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ethereal',
    timestamp: Date.now(),
    uptime: process.uptime(),
    version: CONFIG.agent.version,
  });
});

// API Routes
app.get('/api/status', statusHandler);
app.get('/api/verify', verifyHandler);

// Conjure endpoint with payment requirement
app.get('/api/conjure', conjureInfoHandler);
app.post(
  '/api/conjure',
  requirePayment({
    amount: CONFIG.pricing.astral,
    description: 'Conjure verifiable art in the nebula',
  }),
  conjureHandler
);

// Verify artifact endpoint with payment requirement
app.get('/api/verify-artifact', verifyArtifactInfoHandler);
app.post(
  '/api/verify-artifact',
  requirePayment({
    amount: CONFIG.pricing.ethereal,
    description: 'Verify artifact truth',
  }),
  verifyArtifactHandler
);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Void Echo',
    message: `Path ${req.method} ${req.path} lost in nebula`,
    availablePaths: {
      status: 'GET /api/status',
      conjure: 'POST /api/conjure',
      verifyArtifact: 'POST /api/verify-artifact',
      verify: 'GET /api/verify',
    },
  });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Nebula rift:', err);
  res.status(500).json({
    error: 'Cosmic Anomaly',
    message: err.message || 'Chaos in the void',
  });
});

// Start server
const PORT = CONFIG.server.port;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🌌 LUCID NEBULA AGENT AWAKENED 🌌               ║
║                                                               ║
║  ✨ ZK-Verifiable AI Art Conjurer                            ║
║  ⚡ x402 Micropayments on Base L2                            ║
║  🎨 Powered by DALL-E 3 & snarkjs                            ║
║                                                               ║
║  🌐 Portal: http://localhost:${PORT}                         ║
║  📡 Status: http://localhost:${PORT}/api/status              ║
║                                                               ║
║  💎 Base Wallet: ${CONFIG.wallets.base.address.substring(0, 20)}...  ║
║                                                               ║
║  🔮 Ready to conjure verifiable dreams...                    ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🌙 SIGTERM received, fading into the void...');
  server.close(() => {
    console.log('💫 Nebula portal closed gracefully');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🌙 SIGINT received, returning to the ether...');
  server.close(() => {
    console.log('💫 Nebula dispersed gracefully');
    process.exit(0);
  });
});

export default app;
