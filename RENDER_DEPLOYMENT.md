# 🚀 Quick Render Deployment Guide

## 📋 Prerequisites
- Render account (free): [render.com](https://render.com)
- GitHub repository with your code

## ⚡ One-Command Deployment

### Step 1: Install Render CLI
```bash
npm install -g render-cli
```

### Step 2: Login to Render
```bash
render login
```

### Step 3: Deploy Your App
```bash
# Deploy directly from your current directory
render deploy

# Or specify GitHub repository
render deploy --src https://github.com/yourusername/ledgerflow-backend
```

## 🎯 What Happens During Deployment

1. **Render analyzes** your `package.json` and `Dockerfile`
2. **Builds Docker image** using the provided Dockerfile
3. **Deploys to global network** with automatic HTTPS
4. **Sets up PostgreSQL** database (free tier)
5. **Configures environment variables** from `render.yaml`
6. **Starts health checks** on `/api/health`
7. **Provides deployment URL** like `https://ledgerflow-api.onrender.com`

## 📁 Files Created for Render

### ✅ `render.yaml`
- Service configuration for Render
- Environment variables setup
- Health check configuration
- Production optimizations

### ✅ `Dockerfile`
- Production-ready container
- Node.js 18 Alpine Linux
- Health checks included
- Security best practices

### ✅ `.dockerignore`
- Optimized build context
- Faster deployment times

### ✅ Updated `package.json`
- Added deployment scripts:
  - `npm run deploy` - Quick deploy
  - `npm run deploy:build` - Build then deploy
  - `npm run render:login` - Login to Render
  - `npm run render:logs` - View deployment logs

## 🌐 Your Live Application

### After Deployment:
- **API Base URL**: `https://your-app.onrender.com`
- **Payment Gateway**: `https://your-app.onrender.com/api/payments/:endpoint`
- **User Creation**: `https://your-app.onrender.com/api/users`
- **Health Check**: `https://your-app.onrender.com/api/health`

## 🧪 Test Your Deployment

```bash
# Test health endpoint
curl https://your-app.onrender.com/api/health

# Create a test user
curl -X POST https://your-app.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Test payment endpoint (replace with actual endpoint)
curl -X POST https://your-app.onrender.com/api/payments/pay_test123 \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"description":"Test payment"}'
```

## 🔧 Environment Variables in Render

Render automatically provides these in your `render.yaml`:
- `NODE_ENV=production`
- `PORT=5000` (or whatever you specify)
- `DATABASE_URL` (PostgreSQL connection string)
- Custom variables you add

## 📊 Monitoring & Logs

### View Real-time Logs:
```bash
render logs your-app-name
```

### Check Deployment Status:
```bash
render info your-app-name
```

### Access Render Dashboard:
- Visit [render.com](https://render.com)
- See metrics, logs, and settings
- Set up alerts and notifications

## 🔄 Continuous Deployment

### Automatic Deployments:
- Connect your GitHub repository
- Render auto-deploys on every push to main branch
- Zero-downtime deployments with instant rollbacks

### Manual Redeploy:
```bash
# Redeploy latest version
render deploy

# Deploy specific commit
render deploy --commit <commit-hash>
```

## 🛠️ Troubleshooting

### Common Issues:
1. **Port conflicts**: Render automatically assigns ports
2. **Database connection**: Check Render's PostgreSQL format
3. **Build failures**: Check Dockerfile and package.json
4. **Payment 404s**: Verify routes are properly registered

### Get Help:
- Render docs: [render.com/docs](https://render.com/docs)
- Render status: [status.render.com](https://status.render.com)
- Community: [community.render.com](https://community.render.com)

---

**🚀 Your LedgerFlow Payment Gateway is ready for production!**

**Next Steps:**
1. Run `render login`
2. Run `render deploy`
3. Test your live payment gateway!

**You're all set! 🎉**
