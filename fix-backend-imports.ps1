# Fix imports in standalone backend to use local modules

Write-Host "Fixing import paths in standalone backend..." -ForegroundColor Cyan

$backendSrc = "D:\LedgerX-standalone\backend\src"

# Define replacements
$replacements = @{
    '@ledgerX/db' = '../db/client'
    '@ledgerX/db/src/transaction' = '../db/transaction'
    '@ledgerX/db/repo/account' = '../db/account'
    '@ledgerX/db/repo/ledger' = '../db/ledger'
    '@ledgerX/db"' = '../db/client"'
    '@ledgerX/core' = '../core/ledger'
    '@ledgerX/ai' = '../ai/fraud'
    '@ledgerX/types' = '../types/types'
}

# Get all TypeScript files
$files = Get-ChildItem -Path $backendSrc -Filter "*.ts" -Recurse -File

$totalChanges = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Apply all replacements
    foreach ($key in $replacements.Keys) {
        $value = $replacements[$key]
        $content = $content -replace [regex]::Escape($key), $value
    }
    
    if ($content -ne $originalContent) {
        Set-Content $file.FullName $content -NoNewline
        $totalChanges++
        $relativePath = $file.FullName.Substring($backendSrc.Length + 1)
        Write-Host "  Updated: $relativePath" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Fixed imports in $totalChanges files" -ForegroundColor Green
