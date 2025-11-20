<#
.SYNOPSIS
Relocates the pnpm store to the X: drive to fix ENOSPC (No space left on device) errors on Windows.

.DESCRIPTION
This script moves the pnpm package store from the default C: drive location to X:\pnpm-store,
freeing up space on the primary drive and preventing "ENOSPC" errors during pnpm install.

.PARAMETER StoreDir
The target directory for the pnpm store. Defaults to 'X:\pnpm-store'.

.EXAMPLE
.\fix-pnpm-store.ps1
.\fix-pnpm-store.ps1 -StoreDir "X:\custom\pnpm-store"

.NOTES
- Requires PowerShell 5.1 or later
- Requires pnpm to be installed and in PATH
- The X: drive must have at least 5-10 GB free space
#>

param(
  [string]$StoreDir = 'X:\pnpm-store'
)

$ErrorActionPreference = "Stop"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  pnpm Store Relocation Tool" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Target store directory: " -NoNewline
Write-Host "$StoreDir" -ForegroundColor Yellow
Write-Host ""

# Step 1: Ensure X: drive path exists
Write-Host "[1/4] Creating directory structure..." -ForegroundColor Magenta
$parent = Split-Path $StoreDir -Parent
if (-not (Test-Path $parent)) {
  Write-Host "  Creating: $parent"
  try {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
    Write-Host "  ✓ Directory created successfully" -ForegroundColor Green
  } catch {
    Write-Host "  ✗ Failed to create $parent" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  Ensure you have permission to create directories on the X: drive." -ForegroundColor Red
    exit 1
  }
} else {
  Write-Host "  ✓ Directory already exists" -ForegroundColor Green
}
Write-Host ""

# Step 2: Configure pnpm to use new store
Write-Host "[2/4] Configuring pnpm store location..." -ForegroundColor Magenta
try {
  pnpm config set store-dir $StoreDir | Out-Null
  Write-Host "  ✓ pnpm config updated" -ForegroundColor Green
} catch {
  Write-Host "  ✗ Failed to configure pnpm" -ForegroundColor Red
  Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host "  Ensure pnpm is installed and accessible in your PATH." -ForegroundColor Red
  exit 1
}
Write-Host ""

# Step 3: Prune the old store
Write-Host "[3/4] Cleaning old pnpm store and cache..." -ForegroundColor Magenta
try {
  pnpm store prune | Out-Null
  pnpm cache clean --all | Out-Null
  Write-Host "  ✓ Store and cache cleaned" -ForegroundColor Green
} catch {
  Write-Host "  ⚠ Warning: Failed to clean store/cache" -ForegroundColor Yellow
  Write-Host "  This is non-critical. Continuing..." -ForegroundColor Yellow
}
Write-Host ""

# Step 4: Verify configuration
Write-Host "[4/4] Verifying pnpm configuration..." -ForegroundColor Magenta
try {
  $configuredStore = pnpm config get store-dir
  if ($configuredStore -eq $StoreDir) {
    Write-Host "  ✓ Store directory configured: $configuredStore" -ForegroundColor Green
  } else {
    Write-Host "  ⚠ Store directory may not match: $configuredStore" -ForegroundColor Yellow
  }
} catch {
  Write-Host "  ⚠ Could not verify configuration" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 NEXT STEPS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Verify X: Drive Space:" -ForegroundColor Yellow
Write-Host "   Run: Get-Volume X: | Format-Table -AutoSize" -ForegroundColor White
Write-Host "   Ensure at least 5-10 GB is available"
Write-Host ""
Write-Host "2. Reinstall Dependencies:" -ForegroundColor Yellow
Write-Host "   Run: pnpm install" -ForegroundColor White
Write-Host "   The pnpm store will be populated on the X: drive"
Write-Host ""
Write-Host "3. Verify Store Location:" -ForegroundColor Yellow
Write-Host "   Run: pnpm config get store-dir" -ForegroundColor White
Write-Host "   Should return: $StoreDir" -ForegroundColor White
Write-Host ""
Write-Host "4. If ENOSPC Errors Continue:" -ForegroundColor Yellow
Write-Host "   • Check X: drive free space: Get-Volume X: | Format-Table" -ForegroundColor White
Write-Host "   • Clear more space or increase X: drive allocation" -ForegroundColor White
Write-Host "   • Rerun this script if needed" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tip: Monitor X: drive usage with: Get-Volume X: | Format-Table -AutoSize" -ForegroundColor Cyan
Write-Host ""
