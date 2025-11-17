# 🚀 Deployment Guide

## Railway Deployment (Recommended)

Railway is the easiest way to deploy your Lucid Nebula Agent.

### Step 1: Prepare Your Repository

```bash
# Ensure your code is committed
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Railway

1. Go to [Railway](https://railway.app/)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `lucid-nebula-agent` repository
5. Railway will auto-detect Node.js and deploy

### Step 3: Add Environment Variables

In Railway dashboard:

1. Go to your project
2. Click "Variables"
3. Add these variables:
   ```
   OPENAI_API_KEY=sk-your_key_here
   NODE_ENV=production
   ```

### Step 4: Get Your URL

Railway will provide a URL like:
```
https://lucid-nebula-agent-production.up.railway.app
```

## Vercel Deployment

### Prerequisites
```bash
npm install -g vercel
```

### Deploy
```bash
# From your project directory
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? lucid-nebula-agent
# - Directory? ./
# - Override settings? No

# Add environment variables
vercel env add OPENAI_API_KEY
# Enter your API key when prompted

# Deploy to production
vercel --prod
```

## Docker Deployment

### Build Image
```bash
docker build -t lucid-nebula-agent .
```

### Run Container
```bash
docker run -d \
  -p 3000:3000 \
  -e OPENAI_API_KEY=sk-your_key_here \
  -e NODE_ENV=production \
  --name nebula-agent \
  lucid-nebula-agent
```

### Using Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  nebula-agent:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## Fly.io Deployment

### Install Fly CLI
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Deploy
```bash
# Login
fly auth login

# Launch app
fly launch

# Set secrets
fly secrets set OPENAI_API_KEY=sk-your_key_here

# Deploy
fly deploy
```

## Environment Variables Reference

Required:
- `OPENAI_API_KEY` - Your OpenAI API key

Optional:
- `PORT` - Port to run on (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `AGENT_WALLET_ADDRESS_BASE` - Base L2 wallet (pre-configured)
- `AGENT_WALLET_ADDRESS_ETH` - Ethereum wallet (pre-configured)
- `AGENT_WALLET_ADDRESS_SOLANA` - Solana wallet (pre-configured)

## Post-Deployment Checklist

- [ ] Test status endpoint: `GET /api/status`
- [ ] Test payment requirement: `POST /api/conjure` (should return 402)
- [ ] Verify wallet addresses: `GET /api/verify`
- [ ] Monitor logs for errors
- [ ] Set up monitoring/alerts
- [ ] Register on [x402scan.com](https://x402scan.com)
- [ ] Update README with your live URL

## Monitoring

### Check Logs

**Railway:**
```bash
# In Railway dashboard, click "Logs" tab
```

**Vercel:**
```bash
vercel logs
```

**Docker:**
```bash
docker logs nebula-agent -f
```

**Fly.io:**
```bash
fly logs
```

### Health Check

Test your deployment:
```bash
# Replace with your URL
curl https://your-app.railway.app/health
```

## Troubleshooting

### 502 Bad Gateway
- Check if app is running: View logs
- Verify PORT environment variable
- Ensure build completed successfully

### OpenAI Errors
- Verify API key is set correctly
- Check OpenAI account has credits
- Review rate limits

### Memory Issues
- Railway: Upgrade plan for more RAM
- Docker: Increase memory limit
- Optimize image generation settings

## Scaling

### Railway
- Automatic scaling included
- Upgrade plan for more resources

### Docker
- Use Docker Swarm or Kubernetes
- Configure replicas in docker-compose.yml

### Load Balancing
- Use Nginx or Cloudflare
- Configure multiple instances

## Security Best Practices

1. **Never commit `.env` files**
2. **Use environment variables for secrets**
3. **Enable HTTPS** (automatic on Railway/Vercel)
4. **Set up rate limiting** for production
5. **Monitor for abuse** via logs
6. **Keep dependencies updated**

## Cost Estimation

### OpenAI API Costs
- DALL-E 3: ~$0.04 per image (standard quality)
- You charge $0.03-$0.15, so factor in margin

### Hosting Costs
- **Railway**: Free tier available, then ~$5-20/mo
- **Vercel**: Free for hobby, ~$20/mo for production
- **Fly.io**: Free tier available, then ~$5-15/mo

### Expected Margins
- Ethereal ($0.03): Break even or slight loss (promo tier)
- Astral ($0.07): ~$0.03 profit per image
- Quantum ($0.15): ~$0.11 profit per image

## Support

Need help deploying? 

- 📚 Check the [main README](./README.md)
- 💬 Join our [Discord](https://discord.gg/daydreams)
- 🐛 Open an [issue](https://github.com/yourusername/lucid-nebula-agent/issues)

---

**Happy Deploying! 🚀✨**
