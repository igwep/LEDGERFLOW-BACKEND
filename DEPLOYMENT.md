# 🚀 LedgerFlow Deployment Guide

## 📋 Prerequisites

- Node.js 18+
- Render account (free)
- GitHub repository
- PostgreSQL database (Render provides free tier)

## 🎯 Quick Deploy to Render

### Step 1: Install Render CLI
```bash
npm install -g render-cli
```

### Step 2: Login to Render
```bash
render login
```

### Step 3: Deploy Your Application
```bash
# Deploy to Render (creates web service)
render create --type node

# Or deploy with custom name
render create --type node --name ledgerflow-api
```

## 🔧 Configuration Files Created

### `render.yaml` - Render Service Configuration
- ✅ Node.js 18 runtime
- ✅ Production environment variables
- ✅ Health checks enabled
- ✅ Auto-deployment from GitHub
- ✅ Free tier configuration

### `Dockerfile` - Production Container
- ✅ Optimized for production
- ✅ Multi-stage build (smaller image)
- ✅ Health checks included
- ✅ Security best practices

### `.dockerignore` - Build Optimization
- ✅ Excludes unnecessary files
- ✅ Faster build times
- ✅ Smaller container size

## 🌐 Environment Setup

### Required Environment Variables
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/ledgerflow
JWT_SECRET=your-production-jwt-secret
WEBHOOK_SECRET=your-webhook-secret
ALLOWED_ORIGINS=https://yourdomain.com
```

### Database Migration
```bash
# After deployment, run migrations
npx prisma migrate deploy
```

## 🚀 Deployment Commands

### Option 1: Direct Deploy (Recommended)
```bash
# Deploy with automatic GitHub integration
render create --type node --src https://github.com/yourusername/ledgerflow-backend
```

### Option 2: Manual Deploy
```bash
# Build and push to GitHub first
git add .
git commit -m "Add Render deployment configuration"
git push origin main

# Then deploy to Render
render create --type node
```

### Option 3: Custom Domain Setup
```bash
# After initial deployment, add custom domain
render add-domain ledgerflow-api yourdomain.com
```

## 📊 Deployment URLs

### After Deployment Success:
- **API URL**: `https://ledgerflow-api.onrender.com`
- **Health Check**: `https://ledgerflow-api.onrender.com/api/health`
- **Payment Endpoints**: `https://ledgerflow-api.onrender.com/api/payments/:endpoint`

## 🔒 Production Considerations

### Security
- ✅ HTTPS automatically provided by Render
- ✅ Environment variables are encrypted
- ✅ Rate limiting recommended for payment endpoints
- ✅ Database connection strings are secure

### Performance
- ✅ Auto-scaling available (upgrade to paid plans)
- ✅ CDN integration for static assets
- ✅ Global edge network

### Monitoring
- ✅ Built-in metrics dashboard
- ✅ Error logging and alerts
- ✅ Health check monitoring
- ✅ Custom webhook support

## 🛠️ Troubleshooting

### Common Issues:
1. **Build Failures**: Check `package.json` scripts
2. **Database Connection**: Verify `DATABASE_URL` format
3. **Port Conflicts**: Ensure PORT=5000 in environment
4. **Payment 404s**: Check routes registration in `src/routes/index.ts`

### Debug Commands:
```bash
# Check Render logs
render logs ledgerflow-api

# Check deployment status
render info ledgerflow-api

# Redeploy latest commit
render deploy ledgerflow-api
```

## 📈 Scaling Options

### Free Tier (Current):
- 512MB RAM
- Shared CPU
- 750 hours/month
- PostgreSQL (free tier)

### Paid Upgrades:
- **Starter ($7/month)**: 1GB RAM, 2.5GB disk
- **Standard ($25/month)**: 2GB RAM, 20GB disk, background workers
- **Pro ($100/month)**: 4GB RAM, 100GB disk, background workers, priority support

## 🎉 Post-Deployment Checklist

- [ ] Test health endpoint: `curl https://your-app.onrender.com/api/health`
- [ ] Test user creation: `POST https://your-app.onrender.com/api/users`
- [ ] Test payment endpoint: `POST https://your-app.onrender.com/api/payments/:endpoint`
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring alerts
- [ ] Set up database backups
- [ ] Test with real payment provider

## 📞 Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Render Status**: [status.render.com](https://status.render.com)
- **Community**: [community.render.com](https://community.render.com)

---

**🚀 Your LedgerFlow Payment Gateway is ready for production deployment!**
