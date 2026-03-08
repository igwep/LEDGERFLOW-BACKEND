# LedgerFlow - Developer Payment Gateway & Transaction Management API

A comprehensive payment gateway API designed for developers to integrate into their websites and applications. Provides accurate transaction tracking, wallet management, and payment processing with upcoming VTU integration.

## 🚀 Features

### 🔌 Developer-Friendly Payment Gateway
- **Unique Payment Endpoints** - Each user gets a personalized API endpoint for receiving payments
- **RESTful API** - Clean, well-documented endpoints for easy integration
- **SDK Ready** - Structure supports multiple programming language implementations
- **Sandbox Mode** - Test environment for development and testing

### 💳 Payment Processing
- **Real-time Transaction Tracking** - Complete audit trail for every payment
- **Multiple Payment Methods** - Support for various payment providers
- **Webhook Integration** - Instant notifications for payment events
- **Custom Redirects** - Redirect users to your custom success/failure pages

### 💼 Wallet Management
- **Automatic Wallet Creation** - Wallets created automatically when users register
- **Real-time Balance Updates** - Instant balance updates on successful payments
- **Transaction History** - Complete, searchable transaction records
- **Balance Inquiries** - API endpoints to check current balance

### 📊 Analytics & Reporting
- **Transaction Analytics** - Detailed insights into payment patterns
- **Revenue Tracking** - Monitor earnings and growth
- **Success Rate Monitoring** - Track payment success/failure rates
- **Custom Reports** - Generate reports for accounting and business analysis

### 🛡️ Security & Reliability
- **Idempotency Protection** - Prevent duplicate transaction processing
- **Fraud Detection** - Built-in risk assessment and fraud prevention
- **API Key Management** - Secure authentication for API access
- **Rate Limiting** - Protect against API abuse and DDoS attacks

### 📱 VTU Integration (Coming Soon)
- **Airtime Top-Up** - Sell airtime for all major networks
- **Data Bundle Sales** - Offer data packages to customers
- **Utility Bill Payments** - PHCN, water bills, and more
- **Commission Tracking** - Track earnings from VTU services

## 🏗️ Architecture

### Clean Architecture
```
src/
├── controllers/          # Request handling and response formatting
├── services/           # Business logic and data operations
├── middleware/          # Cross-cutting concerns (auth, validation, etc.)
├── types/             # TypeScript type definitions
├── routes/             # API route definitions
└── utils/              # Utility functions
```

### Core Components

#### 1. **Wallet Service**
- Double-entry ledger implementation
- Atomic balance updates with optimistic locking
- Fund locking/unlocking for withdrawals
- Complete audit trail with ledger entries

#### 2. **Transaction Service**
- Idempotency protection for all operations
- Transaction lifecycle management
- Automatic expiration handling
- Transaction reversal support

#### 3. **Withdrawal Service**
- Balance verification before processing
- Fund locking during withdrawal processing
- Multi-status workflow (PENDING → PROCESSING → SUCCESS/FAILED)
- Comprehensive withdrawal analytics

#### 4. **Fraud Scoring Service**
- Multi-factor risk analysis
- Configurable risk thresholds
- Real-time fraud detection
- Detailed risk factor tracking

#### 5. **Webhook Controller**
- Provider-agnostic webhook processing
- Signature verification
- Duplicate prevention
- Automatic retry mechanism

## � Prerequisites

- Node.js 16+
- npm or yarn
- SQLite (default) or PostgreSQL
- Prisma CLI

## 🛠️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd ledgerflow-backend
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp env-example.txt .env
# Edit .env with your configuration
```

4. Set up database
```bash
npx prisma generate
npx prisma db push
```

5. Start the server
```bash
npm run dev
```

## 🔌 API Endpoints

### User Management
- `POST /api/users` - Create new user with unique payment endpoint
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user details

### Payment Gateway
- `POST /api/payments/:endpoint` - Process payment via unique endpoint
- `GET /api/payments/status/:reference` - Check payment status

### Wallet Operations
- `GET /api/wallets/:userId` - Get wallet balance and details
- `GET /api/wallets/:userId/transactions` - Get transaction history
- `POST /api/wallets/credit` - Credit wallet (internal)
- `POST /api/wallets/debit` - Debit wallet (internal)

### Transaction Management
- `POST /api/transactions/initialize` - Initialize a transaction
- `POST /api/transactions/process` - Complete transaction processing
- `GET /api/transactions` - List transactions with filtering
- `GET /api/transactions/:reference` - Get transaction details

### Withdrawal Management
- `POST /api/withdrawals` - Create withdrawal request
- `GET /api/withdrawals/:userId` - List user withdrawals
- `PUT /api/withdrawals/:id/process` - Process withdrawal
- `PUT /api/withdrawals/:id/cancel` - Cancel withdrawal

## 💡 Usage Examples

### Create User with Payment Endpoint
```javascript
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'merchant@example.com',
    name: 'John Doe Store',
    password: 'securepassword',
    role: 'MERCHANT'
  })
});

const { data } = await response.json();
// Returns: { id, email, name, paymentEndpoint: "pay_john123", createdAt }
```

### Process Payment via Unique Endpoint
```javascript
const paymentResponse = await fetch(`/api/payments/pay_john123`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 5000,
    currency: 'NGN',
    description: 'Product purchase - Order #1234',
    customerEmail: 'customer@example.com',
    metadata: {
      orderId: '1234',
      productName: 'Premium Widget'
    }
  })
});

// On success, redirects to your specified URL with payment details
```

### Check Wallet Balance
```javascript
const walletResponse = await fetch(`/api/wallets/${userId}`);
const { data } = await walletResponse.json();
// Returns: { balance: 15000, available: 12000, lockedBalance: 3000, currency: 'NGN' }
```

### Get Transaction History
```javascript
const transactionsResponse = await fetch(`/api/wallets/${userId}/transactions?limit=10&offset=0`);
const { data } = await transactionsResponse.json();
// Returns: { transactions: [...], total: 25, hasMore: true }
```

## 🔧 Configuration

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-jwt-secret
PAYMENT_WEBHOOK_URL=your-webhook-url
SUCCESS_REDIRECT_URL=https://yoursite.com/payment/success
FAILURE_REDIRECT_URL=https://yoursite.com/payment/failure
```

## 🧪 Testing

```bash
# Test database connection
npm run test:db

# Run API tests
npm run test:api

# Test payment endpoints
npm run test:payments

# Test database setup
node src/scripts/testDatabase.ts
```

## 📚 Integration Guides

### Web Integration
1. Create user account to get payment endpoint
2. Integrate payment form on your website
3. Handle payment redirects and webhooks
4. Display transaction history to users

### Mobile App Integration
1. Use RESTful endpoints for mobile API calls
2. Implement payment flow with unique endpoints
3. Handle in-app balance display
4. Process withdrawals to bank accounts

## 🗺️ Roadmap

- [ ] **VTU Services Integration**
  - Airtime top-up for all networks
  - Data bundle sales
  - Utility bill payments
  - Commission tracking

- [ ] **Enhanced Developer Experience**
  - Mobile SDKs (iOS/Android)
  - Web SDKs (React, Vue, Angular)
  - Advanced analytics dashboard
  - Multi-currency support

- [ ] **Advanced Features**
  - Subscription management
  - Recurring payments
  - Advanced fraud detection
  - International payment support

## 🆘 Support

- **Documentation**: docs.ledgerflow.dev
- **API Reference**: api.ledgerflow.dev
- **Support Email**: support@ledgerflow.dev
- **GitHub Issues**: Report bugs and feature requests

---

**Built with ❤️ for developers by developers - Making payment integration simple and reliable**

### Financial Safety
- **Double-Entry Ledger**: Every credit has corresponding debit
- **Atomic Transactions**: All operations use Prisma `$transaction`
- **Optimistic Locking**: Prevents race conditions
- **Balance Validation**: Insufficient funds protection

### Idempotency Protection
- **Request Deduplication**: Prevents duplicate transactions
- **Cached Responses**: Consistent responses for retry attempts
- **Configurable TTL**: Automatic cleanup of expired keys

### Fraud Detection
- **Risk Scoring**: 0-100 scale with configurable thresholds
- **Multiple Factors**: Amount, frequency, location, device, time
- **Real-time Analysis**: Post-transaction fraud scoring
- **Alert System**: High-risk transaction flagging

## 📊 API Endpoints

### Wallet Management
```
POST   /api/wallets                    # Create wallet
GET    /api/wallets/:userId              # Get wallet details
GET    /api/wallets/:userId/balance      # Get wallet balance
GET    /api/wallets/:userId/ledger     # Get ledger entries
POST   /api/wallets/:userId/lock-funds  # Lock funds
POST   /api/wallets/:userId/unlock-funds # Unlock funds
```

### Transaction Management
```
POST   /api/transactions                          # Initialize transaction
POST   /api/transactions/:reference/process     # Process transaction
GET    /api/transactions/:reference            # Get transaction details
GET    /api/transactions/user/:userId          # List user transactions
POST   /api/transactions/:reference/fail       # Fail transaction
POST   /api/transactions/:reference/reverse    # Reverse transaction
GET    /api/transactions/:reference/fraud-score # Get fraud score
```

### Withdrawal Management
```
POST   /api/withdrawals                      # Create withdrawal
POST   /api/withdrawals/:id/process         # Process withdrawal
GET    /api/withdrawals/:id                 # Get withdrawal details
GET    /api/withdrawals/user/:userId          # List user withdrawals
POST   /api/withdrawals/:id/cancel          # Cancel withdrawal
GET    /api/withdrawals/user/:userId/stats     # Withdrawal statistics
```

### Webhook Processing
```
POST   /api/webhooks/:provider                 # Process webhook
GET    /api/webhooks/:provider/events          # Get webhook events
POST   /api/webhooks/:provider/retry          # Retry failed webhooks
```

## 🔧 Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/ledgerflow

# Server
PORT=5000
NODE_ENV=production

# Security
WEBHOOK_SECRET=your-webhook-secret
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Transaction Settings
TRANSACTION_EXPIRATION_MINUTES=30
MAX_TRANSACTION_AMOUNT=10000000
IDEMPOTENCY_TTL_MINUTES=60

# Fraud Detection
FRAUD_LOW_THRESHOLD=30
FRAUD_MEDIUM_THRESHOLD=60
FRAUD_HIGH_THRESHOLD=80
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- TypeScript 5+

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

### Database Setup
```bash
# Create database
createdb ledgerflow

# Run migrations
npx prisma migrate deploy

# Seed data (optional)
npx prisma db seed
```

## 🔍 Key Features

### 1. **Double-Entry Ledger System**
Every financial operation creates two corresponding entries:
- **Credit Entry**: Increases wallet balance
- **Debit Entry**: Records the outflow (fee, transfer, etc.)
- **Balance Tracking**: Before/after balance for audit trail

### 2. **Idempotency Protection**
```typescript
// Client includes idempotency key
headers: {
  'x-idempotency-key': 'unique-transaction-key'
}

// Server returns cached response on duplicates
// Prevents double-charging and inconsistent state
```

### 3. **Fraud Detection Engine**
Multi-factor risk analysis:
- **Amount Risk**: Higher amounts = higher risk
- **Frequency Risk**: Unusual transaction patterns
- **Location Risk**: Geographic anomalies
- **Device Risk**: New device detection
- **Time Risk**: Off-hours transactions

### 4. **Webhook Processing**
- **Signature Verification**: HMAC-SHA256 validation
- **Duplicate Prevention**: Reference-based deduplication
- **Provider Support**: Paystack, Flutterwave, Stripe
- **Retry Logic**: Automatic failed webhook retry

## 📈 Monitoring & Analytics

### Transaction Analytics
- Real-time balance tracking
- Transaction volume metrics
- Success/failure rates
- Geographic distribution

### Fraud Analytics
- Risk score distribution
- High-risk transaction alerts
- Fraud factor analysis
- Trending patterns

### System Health
- Database connection monitoring
- API response time tracking
- Error rate monitoring
- Resource utilization

## 🔒 Security Best Practices

### 1. **API Security**
- Rate limiting per endpoint
- CORS configuration
- Request size limits
- Input validation with Zod

### 2. **Data Protection**
- Encrypted database connections
- Sensitive data masking in logs
- Secure webhook signature verification
- Environment variable protection

### 3. **Financial Security**
- Atomic database transactions
- Optimistic concurrency control
- Balance verification before operations
- Complete audit trails

## 🧪 Testing

### Unit Tests
```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage
```

### Integration Tests
```bash
# Run integration tests
npm run test:integration

# Test webhook endpoints
npm run test:webhooks
```

### Load Testing
```bash
# Run load tests
npm run test:load

# Stress test transaction processing
npm run test:stress
```

## 📚 API Documentation

### Authentication
Include API key in headers:
```bash
curl -H "x-api-key: your-api-key" \
     -H "x-idempotency-key: unique-key" \
     -X POST https://api.yourdomain.com/api/transactions
```

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456",
    "pagination": {
      "limit": 20,
      "offset": 0,
      "total": 100,
      "hasMore": true
    }
  }
}
```

### Error Handling
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient available balance",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "req_123456"
  }
}
```

## 🚀 Deployment

### Production Deployment
```bash
# Build for production
npm run build

# Start production server
npm start

# With PM2
pm2 start ecosystem.config.js
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Environment Configuration
- **Development**: Local PostgreSQL, hot reload
- **Staging**: Cloud database, full logging
- **Production**: Managed database, minimal logging

## 📊 Performance Optimization

### Database Optimization
- Indexed queries for fast lookups
- Connection pooling
- Query result caching
- Periodic cleanup of expired records

### Application Optimization
- In-memory caching for frequent operations
- Async processing for non-blocking operations
- Request batching for bulk operations
- Graceful degradation under load

## 🔄 Maintenance

### Database Maintenance
```bash
# Cleanup expired transactions
npm run cleanup:transactions

# Cleanup old idempotency keys
npm run cleanup:idempotency

# Archive old ledger entries
npm run archive:ledger
```

### Monitoring Setup
- Application metrics (Prometheus)
- Log aggregation (ELK stack)
- Error tracking (Sentry)
- Performance monitoring (New Relic)

## 🤝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes with tests
4. Run full test suite
5. Submit pull request
6. Code review and merge

### Code Standards
- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Comprehensive test coverage
- Documentation updates

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourorg/ledgerflow/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourorg/ledgerflow/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourorg/ledgerflow/discussions)

---

**Built with ❤️ for production fintech infrastructure**
#   L E D G E R F L O W - B A C K E N D  
 