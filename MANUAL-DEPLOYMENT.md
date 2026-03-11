# Manual Deployment to Render

## 🚀 Quick Manual Deployment Guide

### 📋 Prerequisites
1. **GitHub Account**: Push code to GitHub
2. **Render Account**: [render.com](https://render.com)
3. **Database**: PostgreSQL (Supabase recommended)

---

## 🔧 Step 1: Prepare Your Code

### Push to GitHub
```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## 🔧 Step 2: Create Render Web Service

### 1. Login to Render
- Go to [render.com](https://render.com)
- Login/signup with GitHub

### 2. Create New Web Service
- Click **"New +"** → **"Web Service"**
- Connect your **GitHub repository**
- Select **"ledgerflow-backend"** repo

### 3. Configure Service
```
Name: ledgerflow-backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
Instance Type: Free (or Starter for production)
```

---

## 🔧 Step 3: Add Environment Variables

### Required Environment Variables
Go to **Environment** tab and add these:

```bash
# Database (Required)
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres

# Server (Required)
PORT=5000
NODE_ENV=production

# Paystack (Required)
PAYSTACK_SECRET_KEY=sk_live_your_live_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_live_key_here

# CORS (Required)
ALLOWED_ORIGINS=https://your-frontend-domain.com

# Security (Required)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
WEBHOOK_SECRET=your-webhook-secret-for-paystack
```

---

## 🔧 Step 4: Deploy

### 1. Initial Deploy
- Click **"Create Web Service"**
- Render will automatically build and deploy

### 2. Monitor Deployment
- Watch the **Logs** tab for progress
- Wait for **"Live"** status

### 3. Test Deployment
- Visit: `https://your-app-name.onrender.com/api/health`
- Should return: `{"status":"LedgerFlow API Running"}`

---

## 🔧 Step 5: Database Setup

### Option A: Use Supabase (Recommended)
1. **Create Supabase Project**: [supabase.com](https://supabase.com)
2. **Get Connection String**: Settings → Database
3. **Run Schema**: SQL Editor → Run `create-supabase-schema.sql`
4. **Update DATABASE_URL**: In Render environment

### Option B: Use Render PostgreSQL
1. **Add PostgreSQL**: Render Dashboard → New → PostgreSQL
2. **Get Connection String**: From database dashboard
3. **Run Migration**: Add build script to package.json

---

## 🔧 Step 6: Test Paystack Integration

### 1. Update Paystack Keys
- Use **live keys** for production
- Or **test keys** for staging

### 2. Test Payment
```bash
curl -X POST https://your-app.onrender.com/api/payments/pay_user/paystack \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "description": "Test payment",
    "customerEmail": "test@example.com",
    "redirectUrl": "https://your-app.com/success"
  }'
```

---

## 🔧 Step 7: Configure Webhooks

### 1. Get Webhook URL
- Your webhook URL: `https://your-app.onrender.com/api/payments/webhook`

### 2. Update Paystack
- Go to [Paystack Dashboard](https://dashboard.paystack.co)
- Settings → Webhooks
- Add your webhook URL

---

## 🔧 Step 8: Frontend Integration

### Update Frontend
```javascript
const API_URL = 'https://your-app.onrender.com';

// Create payment
const payment = await fetch(`${API_URL}/api/payments/pay_user/paystack`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000,
    description: 'Pro Plan',
    customerEmail: 'user@example.com',
    redirectUrl: 'https://your-app.com/success'
  })
});

const result = await payment.json();
window.location.href = result.data.url; // Redirect to Paystack
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Build Fails
```bash
# Check logs in Render dashboard
# Common fixes:
- Update package.json build script
- Add missing dependencies
- Fix TypeScript errors
```

#### 2. Database Connection Fails
```bash
# Verify DATABASE_URL format
# Test connection locally first
# Check Supabase/Render database status
```

#### 3. Paystack Errors
```bash
# Verify API keys are correct
# Check webhook configuration
# Test with test keys first
```

#### 4. CORS Errors
```bash
# Update ALLOWED_ORIGINS
# Include your frontend domain
# Check frontend request headers
```

---

## 🔧 Production Checklist

### ✅ Before Going Live
- [ ] Use **live Paystack keys**
- [ ] Set up **production database**
- [ ] Configure **webhooks**
- [ ] Set up **monitoring**
- [ ] Add **error logging**
- [ ] Test **full payment flow**
- [ ] Set up **backup strategy**

### ✅ Security
- [ ] Use **HTTPS** (automatic on Render)
- [ ] Validate **environment variables**
- [ ] Secure **webhook secrets**
- [ ] Set up **CORS properly**
- [ ] Monitor **suspicious activity**

---

## 🎯 Success Metrics

### Your App is Live When:
- ✅ Health check returns 200
- ✅ Database connects successfully
- ✅ Paystack payments work
- ✅ Webhooks receive events
- ✅ Frontend can integrate

### Expected URLs:
- **API**: `https://your-app.onrender.com`
- **Health**: `https://your-app.onrender.com/api/health`
- **Docs**: `https://your-app.onrender.com/api-docs`

---

## 🚀 Next Steps

1. **Deploy frontend** (Vercel, Netlify, or Render)
2. **Set up monitoring** (Render logs + alerts)
3. **Add analytics** (transaction tracking)
4. **Scale up** (Starter plan for production)
5. **Add features** (refunds, disputes, reporting)

---

## 🎉 You're Ready!

**Your LedgerFlow backend is now ready for production deployment on Render!**

The manual process gives you full control over every step. 🚀
