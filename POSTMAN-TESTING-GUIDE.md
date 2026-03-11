# 🧪 Paystack Testing with Postman Guide

## 📥 Step 1: Import Collection

1. **Open Postman**
2. **Click "Import"** (top left)
3. **Select File**: `postman-collection.json`
4. **Choose "Collection"**
5. **Import** ✅

## 🔧 Step 2: Configure Variables

After importing:
1. **Click on "LedgerFlow Paystack API" collection**
2. **Go to "Variables" tab**
3. **Update if needed**:
   - `baseUrl`: `http://localhost:5000/api`
   - `paymentEndpoint`: `test_merchant_123`

## 🧪 Step 3: Test Endpoints

### **✅ Working Endpoints:**

#### **1. Health Check**
- **Method**: GET
- **URL**: `{{baseUrl}}/health`
- **Expected**: `{"status":"LedgerFlow API Running"}`

#### **2. Paystack Webhook Test**
- **Method**: POST
- **URL**: `{{baseUrl}}/webhooks/paystack`
- **Body**: 
```json
{
  "event": "charge.success",
  "data": {
    "id": 123456789,
    "reference": "PAY_test_merchant_123_abc123",
    "amount": 500000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "test@example.com"
    }
  }
}
```

### **⚠️ Currently Not Working (Route Issue):**

#### **3. Initialize Payment**
- **Method**: POST
- **URL**: `{{baseUrl}}/payments/{{paymentEndpoint}}/paystack`
- **Status**: 404 (routes not mounting)

#### **4. Verify Payment**
- **Method**: GET
- **URL**: `{{baseUrl}}/payments/verify/{{reference}}/paystack`
- **Status**: 404 (routes not mounting)

## 🔍 Alternative Testing Method

Since payment routes have mounting issues, test the service directly:

### **Method 1: Direct Service Test**
```bash
node test-paystack-direct.js
```

### **Method 2: Manual API Test**
Create a temporary test endpoint in your server:

```javascript
// Add to server.ts temporarily
app.post('/api/test-paystack', async (req, res) => {
  const { paymentService } = require('./dist/services/paymentService');
  
  try {
    const result = await paymentService.processPaymentWithPaystack(
      'test_endpoint',
      req.body
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## 🎯 Test Cards for Paystack

### **✅ Success Cards:**
- **Visa**: `4084084084084081`
- **Mastercard**: `5060666666666666`

### **❌ Failed Cards:**
- **Declined**: `4187447155040432`
- **Insufficient Funds**: `5254471234567890`

### **🔢 Expiry & CVV:**
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

## 📝 Test Scenarios

### **Scenario 1: Successful Payment**
1. **Initialize** payment with success card
2. **Redirect** to Paystack URL
3. **Complete** payment on Paystack page
4. **Verify** payment status
5. **Check** webhook receipt

### **Scenario 2: Failed Payment**
1. **Initialize** payment with failed card
2. **Redirect** to Paystack URL
3. **Fail** payment on Paystack page
4. **Verify** failed status
5. **Check** webhook for failure

### **Scenario 3: Webhook Testing**
1. **Send** webhook payload manually
2. **Check** server logs
3. **Verify** webhook processing

## 🔧 Troubleshooting

### **If Routes Return 404:**
1. **Check server logs** for route mounting errors
2. **Restart server** after route changes
3. **Verify** payment routes are imported properly

### **If Paystack Returns Error:**
1. **Check** your Paystack keys in `.env`
2. **Verify** test mode (keys should start with `sk_test_`)
3. **Check** internet connection to Paystack API

### **If CORS Errors:**
1. **Check** `ALLOWED_ORIGINS` in `.env`
2. **Add** your frontend URL to allowed origins
3. **Restart** server after CORS changes

## 📊 Expected Responses

### **Successful Payment Init:**
```json
{
  "success": true,
  "data": {
    "reference": "PAY_test_endpoint_1234567890",
    "status": "pending",
    "amount": 5000,
    "currency": "NGN",
    "redirectUrl": "https://checkout.paystack.com/xxxxx",
    "gateway": "paystack"
  }
}
```

### **Successful Verification:**
```json
{
  "success": true,
  "data": {
    "reference": "PAY_test_endpoint_1234567890",
    "status": "success",
    "amount": 5000,
    "currency": "NGN",
    "paidAt": "2023-12-01T10:30:00Z"
  }
}
```

### **Successful Webhook:**
```json
{
  "success": true,
  "message": "Paystack webhook processed successfully",
  "event": "charge.success",
  "processed": true
}
```

## 🚀 Next Steps

1. **Import** the Postman collection
2. **Test** working endpoints (health, webhook)
3. **Fix** payment route mounting issue
4. **Test** complete payment flow
5. **Deploy** with real Paystack keys

## 📞 Support

- **Swagger Docs**: http://localhost:5000/api-docs
- **Health Check**: http://localhost:5000/api/health
- **Collection**: `postman-collection.json`
