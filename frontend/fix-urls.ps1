# Fix all hardcoded localhost URLs

$files = @(
    "app\accounts\page.tsx",
    "app\admin\analytics\page.tsx",
    "app\admin\dashboard\page.tsx",
    "app\admin\reversal\[hash]\page.tsx",
    "app\admin\reversal\history\page.tsx",
    "app\admin\transactions\page.tsx",
    "app\nlp\page.tsx"
)

foreach ($file in $files) {
    $content = Get-Content $file -Raw
    
    # Add import if not present
    if ($content -notmatch "import.*API_ENDPOINTS.*from") {
        $content = $content -replace '("use client"\s+)', "`$1`nimport { API_ENDPOINTS } from ""@/lib/api-endpoints""`n"
    }
    
    # Replace URLs
    $content = $content -replace '"http://localhost:5000/api/users/all"', 'API_ENDPOINTS.USERS.ALL'
    $content = $content -replace '"http://localhost:5000/api/transactions/all"', 'API_ENDPOINTS.TRANSACTIONS.ALL'
    $content = $content -replace '"http://localhost:5000/api/transactions/create"', 'API_ENDPOINTS.TRANSACTIONS.CREATE'
    $content = $content -replace '"http://localhost:5000/api/accounts/me"', 'API_ENDPOINTS.ACCOUNTS.ME'
    $content = $content -replace '"http://localhost:5000/api/nlp/query"', 'API_ENDPOINTS.NLP.QUERY'
    $content = $content -replace '"http://localhost:5000/api/analytics/total"', 'API_ENDPOINTS.ANALYTICS.TOTAL'
    $content = $content -replace '"http://localhost:5000/api/analytics/top-categories"', 'API_ENDPOINTS.ANALYTICS.TOP_CATEGORIES'
    $content = $content -replace '"http://localhost:5000/api/analytics/monthly-trend"', 'API_ENDPOINTS.ANALYTICS.MONTHLY_TREND'
    $content = $content -replace '"http://localhost:5000/api/analytics/flagged"', 'API_ENDPOINTS.ANALYTICS.FLAGGED'
    $content = $content -replace '`http://localhost:5000/api/reversal/\$\{hash\}/reverse`', 'API_ENDPOINTS.REVERSAL.REVERSE(hash)'
    $content = $content -replace '`http://localhost:5000/api/transactions/\$\{hash\}`', 'API_ENDPOINTS.TRANSACTIONS.GET(hash)'
    
    Set-Content -Path $file -Value $content
}

Write-Host "URLs fixed successfully!"
