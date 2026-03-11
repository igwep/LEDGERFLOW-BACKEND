-- Create test user and wallet in Supabase
-- Run this after creating the schema

-- Create test user
INSERT INTO "User" ("id", "email", "name", "paymentEndpoint", "status", "createdAt", "updatedAt")
VALUES ('991ac1ce-bcda-4f56-ad0e-660a2c487eb6', 'test@example.com', 'Test User', 'pay_testuser_ooz', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO UPDATE SET
  "email" = EXCLUDED."email",
  "name" = EXCLUDED."name",
  "paymentEndpoint" = EXCLUDED."paymentEndpoint",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;

-- Create test wallet
INSERT INTO "Wallet" ("id", "userId", "balance", "available", "lockedBalance", "currency", "status", "createdAt", "updatedAt")
VALUES ('wallet-991ac1ce-bcda-4f56-ad0e-660a2c487eb6', '991ac1ce-bcda-4f56-ad0e-660a2c487eb6', 0, 0, 0, 'NGN', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("userId") DO UPDATE SET
  "balance" = EXCLUDED."balance",
  "available" = EXCLUDED."available",
  "lockedBalance" = EXCLUDED."lockedBalance",
  "currency" = EXCLUDED."currency",
  "status" = EXCLUDED."status",
  "updatedAt" = CURRENT_TIMESTAMP;
