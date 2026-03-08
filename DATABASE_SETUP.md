# Database Setup Guide

## 🚀 Quick Setup

### 1. Install PostgreSQL
```bash
# Windows (using Chocolatey)
choco install postgresql

# Or download from: https://www.postgresql.org/download/windows/
```

### 2. Create Database
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE ledgerflow_db;
CREATE USER ledgerflow_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ledgerflow_db TO ledgerflow_user;
```

### 3. Set Up Environment
```bash
# Copy the example file
cp env-example.txt .env

# Edit .env with your database credentials
DATABASE_URL="postgresql://ledgerflow_user:your_password@localhost:5432/ledgerflow_db"
```

### 4. Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in browser
npx prisma studio
```

### 5. Test Database Connection
```bash
# Run the test script
npx ts-node src/scripts/testDatabase.ts
```

## 🗄️ Database Models Available

- **Users**: User accounts with authentication
- **Wallets**: User wallets with balance tracking
- **Transactions**: Financial transactions (CREDIT/DEBIT)
- **LedgerEntries**: Detailed transaction history
- **Withdrawals**: Withdrawal requests and status
- **FraudScores**: Fraud detection scores
- **WebhookEvents**: Webhook event processing

## 🛠️ Database Operations

### View Data
```bash
# Open Prisma Studio (web interface)
npx prisma studio

# Or run the test script
npx ts-node src/scripts/testDatabase.ts
```

### Reset Database
```bash
# WARNING: This will delete all data!
npx prisma db push --force-reset
```

### Migrate Changes
```bash
# When you modify schema.prisma
npx prisma db push
```

## 🔍 Common Issues

### "Database connection failed"
- Check if PostgreSQL is running
- Verify DATABASE_URL in .env file
- Ensure database exists

### "PrismaClientInitializationError"
- Set DATABASE_URL environment variable
- Generate Prisma client: `npx prisma generate`

### "Permission denied"
- Check database user permissions
- Verify connection string credentials
