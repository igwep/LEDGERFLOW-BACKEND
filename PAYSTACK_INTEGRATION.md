# Paystack Integration Guide

## 🏦 Paystack Payment Gateway Integration

LedgerFlow now supports Paystack as a payment provider for Nigerian Naira (NGN) transactions.

## 📋 Prerequisites

1. **Paystack Account**: Create an account at [Paystack](https://paystack.co)
2. **API Keys**: Get your test keys from [Paystack Dashboard](https://dashboard.paystack.co/#/settings/keys)
3. **Webhook Setup**: Configure webhook URL in Paystack dashboard

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Getting Paystack Keys

1. Sign up at [Paystack](https://paystack.co)
2. Go to **Settings** → **API Keys**
3. Copy your **Test Secret Key** (starts with `sk_test_`)
4. Copy your **Test Public Key** (starts with `pk_test_`)

## 🚀 API Endpoints

### 1. Process Payment with Paystack

```http
POST /api/payments/{endpoint}/paystack
```

**Request Body:**
```json
{
  "amount": 5000,
  "description": "Premium subscription",
  "customerEmail": "customer@example.com",
  "redirectUrl": "https://your-site.com/payment/success",
  "metadata": {
    "userId": "user_123",
    "plan": "premium"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "PAY_pay_john123_abc_1234567890",
    "status": "pending",
    "amount": 5000,
    "currency": "NGN",
    "redirectUrl": "https://checkout.paystack.com/xxxxx",
    "gateway": "paystack",
    "gatewayReference": "paystack_ref_123456"
  },
  "redirectUrl": "https://checkout.paystack.com/xxxxx"
}
```

### 2. Verify Payment Status

```http
GET /api/payments/verify/{reference}/paystack
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reference": "PAY_pay_john123_abc_1234567890",
    "status": "success",
    "amount": 5000,
    "currency": "NGN",
    "paidAt": "2023-12-01T10:30:00Z",
    "gatewayResponse": "Successful"
  }
}
```

### 3. Paystack Webhook

```http
POST /api/webhooks/paystack
```

**Webhook Events:**
- `charge.success` - Payment completed successfully
- `charge.failed` - Payment failed
- `transfer.success` - Transfer completed
- `transfer.failed` - Transfer failed

## 🧪 Testing with Paystack Sandbox

### Test Cards

Use these test cards for sandbox testing:

| Card Type | Card Number | Expiry | CVV | Response |
|-----------|-------------|--------|-----|----------|
| Success | `4084084084084081` | 12/30 | 123 | Successful charge |
| Fail 3DS | `5060666666666666` | 12/30 | 123 | Requires 3DSecure |
| Insufficient Funds | `4187447155040432` | 12/30 | 123 | Insufficient funds |
| Invalid Card | `4242424242424241` | 12/30 | 123 | Invalid card |

### Test Scenarios

1. **Successful Payment**: Use card `4084084084084081`
2. **Failed Payment**: Use card `4187447155040432`
3. **3DSecure**: Use card `5060666666666666`

## 📱 Payment Flow

1. **Initialize Payment**: Call `/api/payments/{endpoint}/paystack`
2. **Redirect Customer**: Send customer to `redirectUrl` (Paystack checkout)
3. **Payment Completion**: Customer completes payment on Paystack
4. **Webhook Notification**: Paystack sends webhook to your endpoint
5. **Verify Payment**: Call `/api/payments/verify/{reference}/paystack`

## 🔒 Security Considerations

1. **Webhook Verification**: Always verify webhook signatures
2. **Environment Keys**: Use test keys for development, live keys for production
3. **Amount Validation**: Validate amounts before processing
4. **Reference Tracking**: Track payment references for reconciliation

## 🌐 Webhook Configuration

### Setup in Paystack Dashboard

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://your-domain.com/api/webhooks/paystack`
3. Select events to receive:
   - Charge Success
   - Charge Failure
   - Transfer events (if applicable)

### Webhook Events Handling

```javascript
// Example webhook payload
{
  "event": "charge.success",
  "data": {
    "id": 123456,
    "reference": "PAY_pay_john123_abc_1234567890",
    "amount": 500000,
    "currency": "NGN",
    "status": "success",
    "customer": {
      "email": "customer@example.com"
    }
  }
}
```

## 📊 Transaction Management

### Payment Status Flow

1. **Pending** → Payment initialized, awaiting customer action
2. **Success** → Payment completed successfully
3. **Failed** → Payment failed or abandoned
4. **Reversed** → Payment reversed (if applicable)

### Transaction Records

Each payment creates:
- **Transaction Record** - In your database
- **Paystack Reference** - For reconciliation
- **Webhook Events** - For real-time updates

## 🚨 Error Handling

### Common Errors

| Error Code | Description | Solution |
|------------|-------------|----------|
| `PAYSTACK_NOT_CONFIGURED` | Paystack keys not set | Add PAYSTACK_SECRET_KEY to env |
| `INVALID_AMOUNT` | Amount below minimum | Minimum ₦1.00 (100 kobo) |
| `MISSING_EMAIL` | Customer email required | Add customerEmail to request |
| `INVALID_ENDPOINT` | Payment endpoint invalid | Check endpoint exists |

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "PAYSTACK_ERROR",
    "message": "Paystack payment failed: Insufficient funds"
  }
}
```

## 🔄 Production Migration

### Steps to Go Live

1. **Get Live Keys**: Request live keys from Paystack
2. **Update Environment**: Replace test keys with live keys
3. **Update Webhook URL**: Change to production webhook URL
4. **Test Live Transactions**: Make small test transactions
5. **Monitor**: Set up monitoring and alerts

### Environment Differences

| Feature | Test | Live |
|---------|------|------|
| Currency | NGN only | NGN, USD, GHS |
| Cards | Test cards only | Real cards |
| Webhooks | Test environment | Production environment |
| Fees | No fees | Standard Paystack fees |

## 📞 Support

- **Paystack Support**: [support@paystack.co](mailto:support@paystack.co)
- **Documentation**: [Paystack Docs](https://paystack.com/docs)
- **LedgerFlow Support**: Check your API documentation

## 🎯 Best Practices

1. **Always verify payments** via API, don't rely only on webhooks
2. **Use unique references** for each payment
3. **Handle all webhook events** appropriately
4. **Log all transactions** for debugging
5. **Implement retry logic** for failed API calls
6. **Set proper CORS** for your frontend
7. **Use environment variables** for sensitive data

## 🧪 Testing Checklist

- [ ] Paystack keys configured
- [ ] Test payment with success card
- [ ] Test payment with fail card
- [ ] Webhook receiving events
- [ ] Payment verification working
- [ ] Error handling tested
- [ ] Amount validation working
- [ ] Redirect URLs functional

Your LedgerFlow payment gateway is now ready to accept Paystack payments! 🎉
