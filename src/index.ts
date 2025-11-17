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

// Root endpoint - ENHANCED cyberpunk llama landing page WITH SCROLLING FIXED
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
  <link rel="icon" type="image/svg+xml" href="/favicon.ico">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html {
      scroll-behavior: smooth;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    
    body {
      font-family: 'Courier New', monospace;
      background: linear-gradient(135deg, #0a0a0a 0%, #1a0a2e 50%, #16213e 100%);
      background-attachment: fixed;
      color: #00ff9f;
      min-height: 100vh;
      padding: 20px 20px 60px 20px;
      position: relative;
      overflow-x: hidden;
    }
    
    body::before {
      content: '';
      position: fixed;
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
      z-index: 0;
    }
    
    @keyframes scanlines {
      0% { transform: translateY(0); }
      100% { transform: translateY(50px); }
    }
    
    .llama-float {
      position: fixed;
      top: 20px;
      right: 20px;
      font-size: 3em;
      animation: float 3s ease-in-out infinite;
      filter: drop-shadow(0 0 20px #ff006e);
      z-index: 100;
    }
    
    .container {
      max-width: 1200px;
      width: 100%;
      margin: 40px auto;
      background: rgba(10, 10, 10, 0.9);
      border: 3px solid #00ff9f;
      border-radius: 15px;
      padding: 50px;
      box-shadow: 
        0 0 50px rgba(0, 255, 159, 0.4),
        0 0 100px rgba(255, 0, 110, 0.2),
        inset 0 0 30px rgba(0, 255, 159, 0.1);
      position: relative;
      z-index: 1;
      animation: slideIn 1s ease-out;
    }
    
    h1 {
      font-size: 3em;
      margin-bottom: 20px;
      text-shadow: 
        0 0 20px #00ff9f,
        0 0 40px #00ff9f,
        0 0 60px #ff006e;
      animation: glow 2s ease-in-out infinite alternate;
      text-align: center;
    }
    
    @keyframes glow {
      from { 
        text-shadow: 
          0 0 20px #00ff9f,
          0 0 40px #00ff9f,
          0 0 60px #ff006e;
      }
      to { 
        text-shadow: 
          0 0 30px #00ff9f,
          0 0 60px #00ff9f,
          0 0 90px #ff006e,
          0 0 120px #9d4edd;
      }
    }
    
    .ascii-art {
      color: #ff006e;
      font-size: 0.7em;
      line-height: 1.1;
      margin: 30px 0;
      text-shadow: 0 0 10px #ff006e;
      text-align: center;
      white-space: pre;
      font-family: monospace;
      animation: pulse 2s ease-in-out infinite;
    }
    
    .tagline {
      font-size: 1.3em;
      margin-bottom: 30px;
      color: #9d4edd;
      text-shadow: 0 0 15px #9d4edd;
      text-align: center;
      animation: slideIn 1.5s ease-out;
    }
    
    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin: 40px 0;
    }
    
    .feature {
      background: linear-gradient(135deg, rgba(0, 255, 159, 0.1), rgba(255, 0, 110, 0.1));
      border: 2px solid #00ff9f;
      padding: 25px;
      border-radius: 10px;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }
    
    .feature::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: linear-gradient(
        45deg,
        transparent,
        rgba(0, 255, 159, 0.1),
        transparent
      );
      transform: rotate(45deg);
      transition: all 0.5s ease;
    }
    
    .feature:hover::before {
      left: 100%;
    }
    
    .feature:hover {
      background: linear-gradient(135deg, rgba(0, 255, 159, 0.2), rgba(255, 0, 110, 0.2));
      box-shadow: 
        0 0 30px rgba(0, 255, 159, 0.5),
        0 0 60px rgba(255, 0, 110, 0.3);
      transform: translateY(-10px) scale(1.02);
      border-color: #ff006e;
    }
    
    .feature h3 {
      color: #ff006e;
      margin-bottom: 15px;
      font-size: 1.3em;
    }
    
    .feature p {
      color: #9d4edd;
      line-height: 1.6;
    }
    
    .endpoints {
      margin: 40px 0;
    }
    
    .endpoints h2 {
      color: #ff006e;
      margin-bottom: 25px;
      font-size: 2em;
      text-shadow: 0 0 20px #ff006e;
    }
    
    .endpoint {
      background: rgba(157, 78, 221, 0.15);
      border-left: 4px solid #9d4edd;
      padding: 20px;
      margin: 15px 0;
      font-family: monospace;
      border-radius: 5px;
      transition: all 0.3s ease;
    }
    
    .endpoint:hover {
      background: rgba(157, 78, 221, 0.25);
      border-left-width: 8px;
      transform: translateX(10px);
      box-shadow: 0 0 20px rgba(157, 78, 221, 0.4);
    }
    
    .endpoint .method {
      color: #ff006e;
      font-weight: bold;
      margin-right: 15px;
      font-size: 1.1em;
    }
    
    .endpoint .path {
      color: #00ff9f;
      font-size: 1.1em;
    }
    
    .endpoint p {
      margin-top: 10px;
      color: #9d4edd;
    }
    
    .wallets {
      margin: 40px 0;
      padding: 30px;
      background: linear-gradient(135deg, rgba(255, 0, 110, 0.1), rgba(157, 78, 221, 0.1));
      border: 2px solid #ff006e;
      border-radius: 10px;
      box-shadow: 0 0 30px rgba(255, 0, 110, 0.3);
    }
    
    .wallets h2 {
      color: #ff006e;
      margin-bottom: 20px;
      text-shadow: 0 0 15px #ff006e;
    }
    
    .wallet {
      margin: 15px 0;
      word-break: break-all;
      font-size: 0.95em;
      padding: 10px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 5px;
    }
    
    .wallet .label {
      color: #9d4edd;
      font-weight: bold;
      display: inline-block;
      min-width: 100px;
    }
    
    .pricing {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin: 40px 0;
    }
    
    .price-card {
      background: linear-gradient(135deg, rgba(0, 255, 159, 0.1), rgba(157, 78, 221, 0.1));
      border: 2px solid #00ff9f;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
      transition: all 0.3s ease;
    }
    
    .price-card:hover {
      transform: scale(1.05);
      box-shadow: 0 0 40px rgba(0, 255, 159, 0.5);
      border-color: #ff006e;
    }
    
    .price-card h3 {
      color: #ff006e;
      font-size: 1.8em;
      margin-bottom: 10px;
    }
    
    .price-card .amount {
      color: #00ff9f;
      font-size: 2.5em;
      margin: 15px 0;
      text-shadow: 0 0 20px #00ff9f;
    }
    
    .price-card .desc {
      color: #9d4edd;
      font-size: 0.9em;
      line-height: 1.5;
    }
    
    footer {
      margin-top: 50px;
      text-align: center;
      color: #9d4edd;
      font-size: 1em;
      padding-bottom: 40px;
    }
    
    footer p {
      margin: 10px 0;
    }
    
    a {
      color: #00ff9f;
      text-decoration: none;
      transition: all 0.3s ease;
      text-shadow: 0 0 5px #00ff9f;
    }
    
    a:hover {
      color: #ff006e;
      text-shadow: 0 0 15px #ff006e;
    }
    
    .glitch {
      position: relative;
      animation: glitch 5s infinite;
    }
    
    @keyframes glitch {
      0%, 90%, 100% { transform: translate(0); }
      91% { transform: translate(-2px, 2px); }
      92% { transform: translate(2px, -2px); }
      93% { transform: translate(-2px, 2px); }
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .container {
        padding: 30px 20px;
      }
      
      h1 {
        font-size: 2em;
      }
      
      .llama-float {
        font-size: 2em;
        top: 10px;
        right: 10px;
      }
      
      .ascii-art {
        font-size: 0.5em;
      }
      
      .pricing {
        grid-template-columns: 1fr;
      }
      
      .features {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="llama-float">🦙</div>
  
  <div class="container">
    <h1 class="glitch">🌌 ${CONFIG.agent.name}</h1>
    
    <pre class="ascii-art">
    ___n____n___
   /           \\
  /   🌟 🦙 🌟  \\
 |   NEBULA    |
 |   CONJURER  |
  \\  ⚡ ZK ⚡  /
   \\___________/
    |  |  |  |
    🔮 💎 ⚡ 🎨
    </pre>
    
    <p class="tagline">
      💫 ${CONFIG.agent.description} 💫
    </p>
    
    <div class="pricing">
      <div class="price-card">
        <h3>✨ Ethereal</h3>
        <div class="amount">$0.03</div>
        <div class="desc">Fleeting visions<br>Basic proofs<br>Swift summons</div>
      </div>
      
      <div class="price-card">
        <h3>🌟 Astral</h3>
        <div class="amount">$0.07</div>
        <div class="desc">Deeper dives<br>Standard proofs<br>Artistic lineage</div>
      </div>
      
      <div class="price-card">
        <h3>🔮 Quantum</h3>
        <div class="amount">$0.15</div>
        <div class="desc">Epic tapestries<br>Premium proofs<br>Quantum origins</div>
      </div>
    </div>
    
    <div class="features">
      <div class="feature">
        <h3>⚡ x402 Micropayments</h3>
        <p>Ephemeral USDC transfers on Base L2. Pay only for what you conjure with gasless EIP-3009 signatures.</p>
      </div>
      
      <div class="feature">
        <h3>🔮 Zero-Knowledge Proofs</h3>
        <p>Verifiable authenticity without revealing secrets. Your prompts stay private, your art stays proven.</p>
      </div>
      
      <div class="feature">
        <h3>🎨 AI Art Generation</h3>
        <p>DALL-E 3 powered creation with 5 custom styles: cyberpunk, fractal, neon-noir, volcanic-watercolor, 8-bit-glitch.</p>
      </div>
      
      <div class="feature">
        <h3>🌐 Multi-Chain Support</h3>
        <p>Base L2 primary, with Ethereum and Solana wallets ready for cross-chain expansion.</p>
      </div>
      
      <div class="feature">
        <h3>🦙 Llama-Powered</h3>
        <p>Because every great AI agent needs a spirit animal. This one's cyber-psychedelic.</p>
      </div>
      
      <div class="feature">
        <h3>💎 Provable Provenance</h3>
        <p>Each artifact comes with ZK proofs. Perfect for NFTs, creative APIs, and the metaverse.</p>
      </div>
    </div>
    
    <div class="endpoints">
      <h2>📡 API Endpoints</h2>
      
      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/api/status</span>
        <p>🌟 View agent status and pricing (FREE)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">POST</span>
        <span class="path">/api/conjure</span>
        <p>🎨 Conjure ZK-verified AI art ($0.03 - $0.15 depending on tier)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">POST</span>
        <span class="path">/api/verify-artifact</span>
        <p>🔍 Verify artifact zero-knowledge proofs ($0.03)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/api/verify</span>
        <p>💎 Verify agent identity and wallets (FREE)</p>
      </div>
      
      <div class="endpoint">
        <span class="method">GET</span>
        <span class="path">/health</span>
        <p>❤️ Health check (FREE)</p>
      </div>
    </div>
    
    <div class="wallets">
      <h2>💎 Payment Addresses</h2>
      <div class="wallet">
        <span class="label">🔵 Base L2:</span> ${CONFIG.wallets.base.address}
      </div>
      <div class="wallet">
        <span class="label">⚪ Ethereum:</span> ${CONFIG.wallets.ethereum.address}
      </div>
      <div class="wallet">
        <span class="label">🟣 Solana:</span> ${CONFIG.wallets.solana.address}
      </div>
    </div>
    
    <footer>
      <p>⚡ Powered by Daydreams Lucid Agents & x402 Protocol ⚡</p>
      <p>
        <a href="https://www.daydreams.systems" target="_blank">🌙 Daydreams</a> |
        <a href="https://www.x402.org" target="_blank">💳 x402</a> |
        <a href="https://x402scan.com" target="_blank">🔍 x402scan</a> |
        <a href="https://base.org" target="_blank">🔵 Base L2</a>
      </p>
      <p style="margin-top: 25px; font-size: 1.2em;">
        🦙 v${CONFIG.agent.version} | Status: <span style="color: #00ff9f;">Ethereal</span> ✨
      </p>
      <p style="margin-top: 15px; color: #ff006e;">
        "In the neon void, llamas conjure dreams." - Ancient Cyber Proverb
      </p>
    </footer>
  </div>
</body>
</html>
  `);
});

// Favicon - SVG with proper headers
app.get('/favicon.ico', (req, res) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#9d4edd;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#00ff9f;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="32" height="32" fill="url(#grad)" rx="4"/>
    <text x="16" y="24" font-size="20" text-anchor="middle" fill="#fff">🦙</text>
  </svg>`;
  
  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=31536000');
  res.send(svg);
});

// OG Image
app.get('/og-image.png', (req, res) => {
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#0a0a0a;stop-opacity:1" />
        <stop offset="50%" style="stop-color:#1a0a2e;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bgGrad)"/>
    <text x="600" y="280" font-family="monospace" font-size="80" text-anchor="middle" fill="#00ff9f">🦙 Lucid Nebula Agent</text>
    <text x="600" y="380" font-family="monospace" font-size="40" text-anchor="middle" fill="#9d4edd">ZK-Verifiable AI Art on Base L2</text>
    <text x="600" y="480" font-family="monospace" font-size="35" text-anchor="middle" fill="#ff006e">⚡ x402 Micropayments • 🎨 DALL-E 3 • 🔮 ZK Proofs</text>
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
    llama: '🦙',
  });
});

// API Routes
app.get('/api/status', statusHandler);
app.get('/api/verify', verifyHandler);

// Conjure endpoint - GET returns 402 info, POST with middleware handles payment
app.get('/api/conjure', conjureInfoHandler);
app.post(
  '/api/conjure',
  requirePayment({
    amount: CONFIG.pricing.astral,
    description: 'Conjure verifiable art in the nebula',
  }),
  conjureHandler
);

// Verify artifact endpoint - GET returns 402 info, POST with middleware handles payment
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
    hint: '🦙 The llama knows not this path',
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
    llama: '🦙💥',
  });
});

// Start server
const PORT = CONFIG.server.port;

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║              🦙 LUCID NEBULA AGENT AWAKENED 🦙               ║
║                                                               ║
║  ✨ ZK-Verifiable AI Art Conjurer                            ║
║  ⚡ x402 Micropayments on Base L2                            ║
║  🎨 Powered by DALL-E 3 & snarkjs                            ║
║  🦙 Enhanced with Cyber-Llama Vibes                          ║
║                                                               ║
║  🌐 Portal: http://localhost:${PORT}                         ║
║  📡 Status: http://localhost:${PORT}/api/status              ║
║  🦙 Health: http://localhost:${PORT}/health                  ║
║                                                               ║
║  💎 Base Wallet: ${CONFIG.wallets.base.address.substring(0, 20)}...  ║
║                                                               ║
║  🔮 Ready to conjure verifiable dreams...                    ║
║  🦙 The llama awaits in the neon void...                     ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🌙 SIGTERM received, the llama fades into the void...');
  server.close(() => {
    console.log('💫 Nebula portal closed gracefully. 🦙 zzz...');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🌙 SIGINT received, returning to the ether...');
  server.close(() => {
    console.log('💫 Nebula dispersed gracefully. The llama rests. 🦙✨');
    process.exit(0);
  });
});

export default app;
