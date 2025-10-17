# Test Transaction Creation Script
# This script tests expense and income transactions

Write-Host "🧪 Transaction Test Script" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Get credentials
$email = Read-Host "Enter your email"
$password = Read-Host "Enter your password" -AsSecureString
$passwordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host "`n🔐 Logging in..." -ForegroundColor Yellow

try {
    # Login
    $loginBody = @{
        email = $email
        password = $passwordPlain
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody

    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green

    # Get accounts
    Write-Host "`n📋 Fetching accounts..." -ForegroundColor Yellow
    $headers = @{ Authorization = "Bearer $token" }
    $accounts = Invoke-RestMethod -Uri "http://localhost:5000/api/accounts/me" -Headers $headers

    if ($accounts.Count -eq 0) {
        Write-Host "❌ No accounts found. Please create an account first." -ForegroundColor Red
        exit 1
    }

    Write-Host "✅ Found $($accounts.Count) account(s):" -ForegroundColor Green
    foreach ($acc in $accounts) {
        Write-Host "   - $($acc.name) ($($acc.type)): $($acc.id)" -ForegroundColor White
    }

    $testAccountId = $accounts[0].id

    # Test Expense
    Write-Host "`n💸 Creating EXPENSE transaction..." -ForegroundColor Yellow
    $expenseBody = @{
        type = "expense"
        from = $testAccountId
        amount = 50
        description = "Test expense - Coffee"
    } | ConvertTo-Json

    $expenseHeaders = @{ 
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $expenseResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/create" `
        -Method Post `
        -Headers $expenseHeaders `
        -Body $expenseBody

    Write-Host "✅ Expense created: $($expenseResponse.message)" -ForegroundColor Green

    # Test Income
    Write-Host "`n💰 Creating INCOME transaction..." -ForegroundColor Yellow
    $incomeBody = @{
        type = "income"
        to = $testAccountId
        amount = 1000
        description = "Test income - Salary"
    } | ConvertTo-Json

    $incomeResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/create" `
        -Method Post `
        -Headers $expenseHeaders `
        -Body $incomeBody

    Write-Host "✅ Income created: $($incomeResponse.message)" -ForegroundColor Green

    # Test Transfer if multiple accounts
    if ($accounts.Count -ge 2) {
        Write-Host "`n🔄 Creating TRANSFER transaction..." -ForegroundColor Yellow
        $transferBody = @{
            type = "transfer"
            from = $accounts[0].id
            to = $accounts[1].id
            amount = 100
            description = "Test transfer between accounts"
        } | ConvertTo-Json

        $transferResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/transactions/create" `
            -Method Post `
            -Headers $expenseHeaders `
            -Body $transferBody

        Write-Host "✅ Transfer created: $($transferResponse.message)" -ForegroundColor Green
    }

    Write-Host "`n🎉 All tests passed successfully!" -ForegroundColor Green
    Write-Host "`n📊 You can view your transactions at: http://localhost:3000/transactions" -ForegroundColor Cyan

} catch {
    Write-Host "`n❌ Test failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}
