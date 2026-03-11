# 🔍 Paystack Webhook Setup Guide

## 🎯 Where to Find Webhook Settings:

### Method 1: Settings → API Keys & Webhooks
1. Login to [dashboard.paystack.co](https://dashboard.paystack.co)
2. Click ⚙️ **Settings** (top right)
3. Look for **API Keys & Webhooks** in left menu
4. Click **Webhooks** tab

### Method 2: Developers → Webhooks  
1. Login to dashboard
2. Click **Developers** (top navigation)
3. Select **Webhooks** from dropdown
4. Configure webhook settings

### Method 3: Settings → Business
1. Dashboard → ⚙️ Settings
2. **Business** section
3. **Webhooks** under business settings

## 🔍 What You Should See:

### Webhook Configuration:
- **Webhook URL**: `https://your-app.onrender.com/api/webhooks/paystack`
- **Secret**: Your webhook secret
- **Events**: 
  - ✅ charge.success
  - ✅ charge.failed  
  - ✅ transfer.success
  - ✅ transfer.failed

### Test Options:
- **Test Webhook**: Send test event
- **View Logs**: See webhook delivery
- **Retry Failed**: Resend failed webhooks

## 🚨 If You Can't Find It:

### Check Account Status:
- **Test Mode**: Usually has webhooks enabled
- **Live Mode**: May need business verification
- **Account Type**: Some features require verification

### Alternative Solutions:
1. **Contact Paystack Support**
2. **Use Test Mode first**
3. **Check API Keys section**

## 🎯 Once You Find It:

### Configuration Steps:
1. **Webhook URL**: `https://your-app.onrender.com/api/webhooks/paystack`
2. **Secret**: `671380cb55a1f220e7c496c6608a7b772c3eb350d93b93430bc184f314d4aec0`
3. **Events**: Select charge.success, charge.failed
4. **Save** configuration

### Test Your Webhook:
```bash
curl -X POST https://your-app.onrender.com/api/webhooks/paystack \
  -H "Content-Type: application/json" \
  -d '{"event":"charge.success","data":{"reference":"TEST_123"}}'
```

## 📞 Paystack Support:
- **Email**: support@paystack.co
- **Chat**: In-dashboard help
- **Help Center**: [support.paystack.co](https://support.paystack.co)
