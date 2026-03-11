# PostgreSQL Setup Guide

## Option 1: Supabase (Recommended - Free)

### Steps:
1. **Go to**: https://supabase.com
2. **Sign up** for free account
3. **Create new project**: 
   - Name: `ledgerflow`
   - Database password: Create strong password
4. **Get connection string**:
   - Go to Settings → Database
   - Find "Connection string"
   - Copy the URI
5. **Update .env**:
   ```bash
   DATABASE_URL=your_connection_string_here
   ```

## Option 2: Railway (Easy - Free Tier)

### Steps:
1. **Go to**: https://railway.app
2. **Add PostgreSQL** service
3. **Get connection string** from service settings
4. **Update .env**

## Option 3: Neon (Modern - Free Tier)

### Steps:
1. **Go to**: https://neon.tech
2. **Create new project**
3. **Get connection string**
4. **Update .env**

## Option 4: Local PostgreSQL (Advanced)

### Windows:
1. **Download**: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads
2. **Install**: PostgreSQL for Windows
3. **Create database**: `ledgerflow`
4. **Create user**: `postgres` with password
5. **Connection string**: `postgresql://postgres:password@localhost:5432/ledgerflow`

## After Setup:

### 1. Update .env:
```bash
DATABASE_URL=your_actual_postgresql_connection_string
```

### 2. Regenerate Prisma:
```bash
npx prisma generate
npx prisma db push
```

### 3. Start server:
```bash
npm start
```

## Benefits of PostgreSQL over SQLite:
- ✅ **Better performance** with concurrent transactions
- ✅ **No timeout issues** with complex operations  
- ✅ **Production ready** - what you'll use in production
- ✅ **Better indexing** and query optimization
- ✅ **ACID compliance** for financial transactions
- ✅ **Connection pooling** for better scalability

## Quick Test:
Once PostgreSQL is set up, the transaction timeout issues should be resolved!
