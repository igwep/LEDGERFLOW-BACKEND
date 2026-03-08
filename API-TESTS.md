# LedgerFlow Backend API Tests

## 🚀 Import to Postman

1. Open Postman
2. Click "Import" 
3. Select "Raw text"
4. Copy and paste the JSON from below
5. Save as "LedgerFlow Backend API Tests"

## Postman Collection JSON

Copy this entire JSON block and import into Postman:

```json
{
  "info": {
    "name": "LedgerFlow Backend API Tests",
    "description": "Complete API test collection for LedgerFlow backend endpoints",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "item": [
        {
          "name": "Root Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": [""]
            }
          },
          "response": []
        },
        {
          "name": "API Health Check",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/health",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "health"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Webhooks",
      "item": [
        {
          "name": "Process Paystack Webhook",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json", "type": "text"},
              {"key": "x-signature", "value": "test-signature", "type": "text", "description": "Webhook signature (bypassed for development)"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"event\": \"charge.success\",\n  \"data\": {\n    \"reference\": \"test_ref_123456\",\n    \"amount\": 5000,\n    \"currency\": \"NGN\",\n    \"customer\": {\n      \"email\": \"test@example.com\",\n      \"name\": \"Test User\"\n    }\n  }\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/webhooks/paystack",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "webhooks", "paystack"]
            }
          },
          "response": []
        },
        {
          "name": "Get Webhook Events",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/webhooks/paystack/events",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "webhooks", "paystack", "events"]
            }
          },
          "response": []
        },
        {
          "name": "Retry Failed Webhooks",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": JSON.stringify({
                "reference": "test_ref_123456"
              }, null, 2)
            },
            "url": {
              "raw": "http://localhost:5000/api/webhooks/paystack/retry",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "webhooks", "paystack", "retry"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Users",
      "item": [
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json", "type": "text"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"testuser@example.com\",\n  \"name\": \"Test User\",\n  \"password\": \"password123\",\n  \"role\": \"USER\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/users",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "users"]
            }
          },
          "response": []
        },
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/users",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "users"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Wallets",
      "item": [
        {
          "name": "Create Wallet",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json", "type": "text"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"currency\": \"NGN\",\n  \"initialBalance\": 10000\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/wallets",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "wallets"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Wallets",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/wallets/user/{{userId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "wallets", "user", "{{userId}}"]
            }
          },
          "response": []
        },
        {
          "name": "Get Wallet Balance",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/wallets/{{walletId}}/balance",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "wallets", "{{walletId}}", "balance"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Transactions",
      "item": [
        {
          "name": "Create Transaction",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json", "type": "text"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"amount\": 5000,\n  \"currency\": \"NGN\",\n  \"type\": \"CREDIT\",\n  \"description\": \"Test deposit\",\n  \"reference\": \"tx_test_123456\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/transactions",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "transactions"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Transactions",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/transactions/user/{{userId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "transactions", "user", "{{userId}}"]
            }
          },
          "response": []
        }
      ]
    },
    {
      "name": "Withdrawals",
      "item": [
        {
          "name": "Create Withdrawal",
          "request": {
            "method": "POST",
            "header": [
              {"key": "Content-Type", "value": "application/json", "type": "text"}
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"userId\": \"{{userId}}\",\n  \"amount\": 3000,\n  \"bankName\": \"Test Bank\",\n  \"accountNumber\": \"1234567890\",\n  \"description\": \"Test withdrawal\"\n}"
            },
            "url": {
              "raw": "http://localhost:5000/api/withdrawals",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "withdrawals"]
            }
          },
          "response": []
        },
        {
          "name": "Get User Withdrawals",
          "request": {
            "method": "GET",
            "header": [],
            "url": {
              "raw": "http://localhost:5000/api/withdrawals/user/{{userId}}",
              "protocol": "http",
              "host": ["localhost"],
              "port": "5000",
              "path": ["api", "withdrawals", "user", "{{userId}}"]
            }
          },
          "response": []
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "userId",
      "value": "test_user_id_placeholder",
      "description": "Replace with actual user ID from database"
    },
    {
      "key": "walletId",
      "value": "test_wallet_id_placeholder",
      "description": "Replace with actual wallet ID from database"
    }
  ]
}
```

## Quick Test Commands

### 1. Health Check Tests
```bash
# Test root endpoint
curl -X GET http://localhost:5000/

# Test health endpoint
curl -X GET http://localhost:5000/api/health
```

### 2. Webhook Tests
```bash
# Test Paystack webhook
curl -X POST http://localhost:5000/api/webhooks/paystack \
  -H "Content-Type: application/json" \
  -H "x-signature: test-signature" \
  -d '{
    "event": "charge.success",
    "data": {
      "reference": "test_ref_123456",
      "amount": 5000,
      "currency": "NGN",
      "customer": {
        "email": "test@example.com",
        "name": "Test User"
      }
    }
  }'

# Get webhook events
curl -X GET http://localhost:5000/api/webhooks/paystack/events
```

### 3. User Tests
```bash
# Create user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "password123",
    "role": "USER"
  }'

# Get all users
curl -X GET http://localhost:5000/api/users
```

### 4. Wallet Tests
```bash
# Create wallet (replace USER_ID with actual ID)
curl -X POST http://localhost:5000/api/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "currency": "NGN",
    "initialBalance": 10000
  }'

# Get user wallets
curl -X GET http://localhost:5000/api/wallets/user/USER_ID
```

### 5. Transaction Tests
```bash
# Create transaction
curl -X POST http://localhost:5000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "amount": 5000,
    "currency": "NGN",
    "type": "CREDIT",
    "description": "Test deposit",
    "reference": "tx_test_123456"
  }'

# Get user transactions
curl -X GET http://localhost:5000/api/transactions/user/USER_ID
```

### 6. Withdrawal Tests
```bash
# Create withdrawal
curl -X POST http://localhost:5000/api/withdrawals \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "amount": 3000,
    "bankName": "Test Bank",
    "accountNumber": "1234567890",
    "description": "Test withdrawal"
  }'

# Get user withdrawals
curl -X GET http://localhost:5000/api/withdrawals/user/USER_ID
```

## Testing Workflow

1. **Start your server**: `npm run dev`
2. **Open Prisma Studio**: `npm run db:studio`
3. **Create test data** in Prisma Studio first
4. **Replace placeholders** in Postman variables with actual IDs from database
5. **Run tests** in order: Health → Users → Wallets → Transactions → Withdrawals
6. **Check responses** and server logs

## Variables to Update

After creating test data in Prisma Studio, update these variables:
- `userId`: Get from Users table in Prisma Studio
- `walletId`: Get from Wallets table in Prisma Studio
- `transactionId`: Get from Transactions table after creating
- `withdrawalId`: Get from Withdrawals table after creating

## Expected Results

- **Health endpoints**: Should return 200 OK
- **Webhook endpoints**: Should process and store events
- **User endpoints**: Should create and retrieve users
- **Wallet endpoints**: Should manage wallet operations
- **Transaction endpoints**: Should handle financial transactions
- **Withdrawal endpoints**: Should process withdrawal requests
