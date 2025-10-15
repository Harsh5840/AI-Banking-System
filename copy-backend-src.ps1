# PowerShell script to copy all backend source files from monorepo to standalone

Write-Host "Copying backend source files from monorepo to standalone..." -ForegroundColor Cyan

$sourceRoot = "D:\LedgerX\apps\ledgerX-backend\src"
$destRoot = "D:\LedgerX-standalone\backend\src"

# Ensure destination directories exist
$directories = @(
    "controllers",
    "services",
    "routes",
    "middleware",
    "validators",
    "types",
    "config"
)

foreach ($dir in $directories) {
    $path = Join-Path $destRoot $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Copy all TypeScript files
$files = Get-ChildItem -Path $sourceRoot -Filter "*.ts" -Recurse -File

$copied = 0
$skipped = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($sourceRoot.Length + 1)
    $destPath = Join-Path $destRoot $relativePath
    
    # Create parent directory if it doesn't exist
    $destDir = Split-Path $destPath -Parent
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    # Copy file (overwrite if exists)
    Copy-Item -Path $file.FullName -Destination $destPath -Force
    $copied++
}

Write-Host "`n✅ Copied $copied files" -ForegroundColor Green
Write-Host "✅ Backend source files migration complete!" -ForegroundColor Green

# List what was copied
Write-Host "`nCopied files by directory:" -ForegroundColor Cyan
foreach ($dir in $directories) {
    $path = Join-Path $destRoot $dir
    if (Test-Path $path) {
        $count = (Get-ChildItem -Path $path -Filter "*.ts" -File | Measure-Object).Count
        Write-Host "  $dir/: $count files" -ForegroundColor Yellow
    }
}
