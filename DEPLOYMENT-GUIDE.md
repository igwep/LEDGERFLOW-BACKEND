# 🚀 LedgerFlow Backend - Render Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Required Items:
- [ ] GitHub repository with code pushed
- [ ] Supabase database URL
- [ ] Paystack live API keys
- [ ] Render account

## 🌐 Step 1: Prepare Your Code

### Push to GitHub:
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### Update .env:
```bash
# Replace with your actual values
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
PAYSTACK_SECRET_KEY=sk_live_your_live_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
```

## 🏗️ Step 2: Create Render Web Service

### 1. Go to [render.com](https://render.com)
### 2. Click **New +** → **Web Service**
### 3. Connect your GitHub repository
### 4. Configure service settings:

| Setting | Value |
|---------|-------|
| **Name** | `ledgerflow-api` |
| **Branch** | `main` |
| **Root Directory** | `.` |
| **Runtime** | `Node` |
| **Build Command** | `npm run render-build` |
| **Start Command** | `npm run render-start` |
| **Instance Type** | `Starter` ($7/month) |

## ⚙️ Step 3: Add Environment Variables

### In Render Dashboard → Environment Variables:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
NODE_ENV=production
PORT=5000
PAYSTACK_SECRET_KEY=sk_live_your_live_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here
WEBHOOK_SECRET=your-secure-webhook-secret
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
JWT_SECRET=your-super-secure-jwt-secret
```

## 🚀 Step 4: Deploy

### 1. Click **Create Web Service**
### 2. Wait for build to complete
### 3. Test your deployed API

## 🧪 Step 5: Test Deployment

### Health Check:
```bash
curl https://ledgerflow-api.onrender.com/api/health
```

### Paystack Test:
```bash
curl -X POST https://ledgerflow-api.onrender.com/api/payments/test_merchant_123/paystack \
  -H "Content-Type: application/json" \
  -d '{"amount":5000,"customerEmail":"test@example.com"}'
```

## 🔧 Step 6: Configure Webhooks

### In Paystack Dashboard:
1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://ledgerflow-api.onrender.com/api/webhooks/paystack`
3. Set webhook secret
4. Test webhook events

## 📊 Step 7: Monitor Deployment

### Render Dashboard:
- **Logs**: Monitor deployment logs
- **Metrics**: Check performance
- **Events**: Track deployments

### Commands:
```bash
# View logs
render logs ledgerflow-api

# Trigger redeploy
render deploy ledgerflow-api
```

## 🎯 Production URLs

### Your API will be available at:
- **API**: `https://ledgerflow-api.onrender.com`
- **Health**: `https://ledgerflow-api.onrender.com/api/health`
- **Swagger**: `https://ledgerflow-api.onrender.com/api-docs`

## 🔒 Security Notes

### Important:
- Never commit .env files to git
- Use strong secrets
- Monitor for suspicious activity
- Set up alerts in Paystack

## 📈 Scaling

### When to upgrade:
- **Free tier**: Development/testing
- **Starter ($7)**: Small production
- **Standard ($25)**: Medium traffic
- **Pro ($50+)**: High traffic

## 🆘 Troubleshooting

### Common Issues:
1. **Build fails**: Check package.json scripts
2. **Database errors**: Verify DATABASE_URL
3. **Paystack errors**: Check API keys
4. **CORS errors**: Update ALLOWED_ORIGINS

### Debug Commands:
```bash
# Check build logs
render logs ledgerflow-api

# Redeploy
render deploy ledgerflow-api

# Check environment variables
# In Render dashboard → Environment
```

## 🎉 Success!

Your LedgerFlow payment gateway is now live! 🚀

### Next Steps:
1. Test all endpoints
2. Configure frontend
3. Set up monitoring
4. Plan for scaling
