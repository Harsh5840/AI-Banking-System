# Quick Transaction Test Guide

## Step 1: Get Your JWT Token

If you don't have a token, login first:

```bash
# Login to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Copy the `token` from the response.

## Step 2: Get Your Accounts

```bash
# Replace YOUR_JWT_TOKEN with the actual token
curl -X GET http://localhost:5000/api/accounts/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Copy one of the account IDs from the response.

## Step 3: Test Transaction Creation

### Test Expense (Only need FROM account)
```bash
curl -X POST http://localhost:5000/api/transactions/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "expense",
    "from": "YOUR_ACCOUNT_ID",
    "amount": 100,
    "description": "Test expense"
  }'
```

### Test Income (Only need TO account)
```bash
curl -X POST http://localhost:5000/api/transactions/create \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "income",
    "to": "YOUR_ACCOUNT_ID",
    "amount": 1000,
    "description": "Test income"
  }'
```

## PowerShell Version (for Windows)

### Get Accounts
```powershell
$token = "YOUR_JWT_TOKEN"
$headers = @{ Authorization = "Bearer $token" }
Invoke-RestMethod -Uri "http://localhost:5000/api/accounts/me" -Headers $headers
```

### Create Expense
```powershell
$token = "YOUR_JWT_TOKEN"
$accountId = "YOUR_ACCOUNT_ID"
$headers = @{ 
  Authorization = "Bearer $token"
  "Content-Type" = "application/json"
}
$body = @{
  type = "expense"
  from = $accountId
  amount = 100
  description = "Test expense"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/create" -Method Post -Headers $headers -Body $body
```

### Create Income
```powershell
$token = "YOUR_JWT_TOKEN"
$accountId = "YOUR_ACCOUNT_ID"
$headers = @{ 
  Authorization = "Bearer $token"
  "Content-Type" = "application/json"
}
$body = @{
  type = "income"
  to = $accountId
  amount = 1000
  description = "Test income"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/create" -Method Post -Headers $headers -Body $body
```
