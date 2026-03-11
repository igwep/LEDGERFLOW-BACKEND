# 🔑 Environment Variables Checklist

## ✅ REQUIRED for Production:

### 🗄️ Database:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 🏦 Paystack:
```
PAYSTACK_SECRET_KEY=sk_live_your_actual_live_secret_key_here
PAYSTACK_PUBLIC_KEY=pk_live_your_actual_live_public_key_here
```

### 🌐 Server:
```
NODE_ENV=production
PORT=5000
```

### 🔒 Security:
```
JWT_SECRET=your-super-secure-jwt-secret-key-for-production
WEBHOOK_SECRET=your-secure-webhook-secret-key
```

### 🌍 CORS:
```
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## ⚠️ What Happens WITHOUT Environment Variables:

### ❌ Database Errors:
```
Error: P1000: Authentication failed against database server
```

### ❌ Paystack Errors:
```
Error: PAYSTACK_NOT_CONFIGURED
```

### ❌ CORS Errors:
```
Error: Access-Control-Allow-Origin blocked
```

### ❌ JWT Errors:
```
Error: JWT_SECRET not configured
```

## 🎯 How to Add:

### Option 1: render.yaml (Easy)
```yaml
envVars:
  - key: DATABASE_URL
    value: postgresql://postgres:password@db.abc.supabase.co:5432/postgres
    sync: false
```

### Option 2: Render Dashboard (Secure)
1. Go to your service on Render
2. Click "Environment"
3. Add each variable manually
4. Save and redeploy

## 🔍 Testing Environment Variables:

### Health Check:
```bash
curl https://your-app.onrender.com/api/health
```

### Should Return:
```json
{
  "success": true,
  "data": {
    "status": "LedgerFlow API Running",
    "paystack": "Configured",
    "environment": "production"
  }
}
```

## 🚨 Security Notes:

### ❌ NEVER:
- Commit secrets to git
- Use test keys in production
- Share environment variables
- Use default passwords

### ✅ ALWAYS:
- Use strong secrets
- Rotate keys regularly
- Monitor for breaches
- Use different keys per environment

## 🎉 Ready When:

All environment variables are set and your health check returns success!
