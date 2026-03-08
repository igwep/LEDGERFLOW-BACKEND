@echo off
echo ======================================
echo LedgerFlow Backend API Tests
echo ======================================
echo.

echo 1. Testing Health Checks...
echo.
echo Testing root endpoint:
curl -X GET http://localhost:5000/
echo.
echo Testing health endpoint:
curl -X GET http://localhost:5000/api/health
echo.

echo 2. Testing Webhook Endpoints...
echo.
echo Testing Paystack webhook:
curl -X POST http://localhost:5000/api/webhooks/paystack ^
  -H "Content-Type: application/json" ^
  -H "x-signature: test-signature" ^
  -d "{\"event\": \"charge.success\", \"data\": {\"reference\": \"test_ref_123456\", \"amount\": 5000, \"currency\": \"NGN\", \"customer\": {\"email\": \"test@example.com\", \"name\": \"Test User\"}}}"
echo.
echo Getting webhook events:
curl -X GET http://localhost:5000/api/webhooks/paystack/events
echo.

echo 3. Testing User Endpoints...
echo.
echo Creating user:
curl -X POST http://localhost:5000/api/users ^
  -H "Content-Type: application/json" ^
  -d "{\"email\": \"testuser@example.com\", \"name\": \"Test User\", \"password\": \"password123\", \"role\": \"USER\"}"
echo.
echo Getting all users:
curl -X GET http://localhost:5000/api/users
echo.

echo 4. Testing Transaction Endpoints...
echo.
echo Creating transaction:
curl -X POST http://localhost:5000/api/transactions ^
  -H "Content-Type: application/json" ^
  -d "{\"userId\": \"test_user_id\", \"amount\": 5000, \"currency\": \"NGN\", \"type\": \"CREDIT\", \"description\": \"Test deposit\", \"reference\": \"tx_test_123456\"}"
echo.
echo Getting transactions:
curl -X GET http://localhost:5000/api/transactions/user/test_user_id
echo.

echo ======================================
echo Tests Complete!
echo ======================================
pause
