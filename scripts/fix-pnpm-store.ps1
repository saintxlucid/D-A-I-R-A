<#
This helper relocates the `pnpm` store to a path on the X: drive under X:\DAIRA.
Usage: run from PowerShell: `.ix-pnpm-store.ps1 -StoreDir "X:\DAIRA\pnpm-store"`
#>

param(
  [string]$StoreDir = 'X:\DAIRA\pnpm-store'
)

Write-Host "Setting pnpm store dir to $StoreDir"
pnpm config set store-dir $StoreDir

 # Ensure X: drive path exists. Create parent folder if needed.
 $parent = Split-Path $StoreDir -Parent
 if (-not (Test-Path $parent)) {
   Write-Host "Creating directory $parent"
   try {
     New-Item -ItemType Directory -Path $parent -Force | Out-Null
   } catch {
     Write-Host "Failed to create $parent. Ensure you have permission to create X: drive folders." -ForegroundColor Red
     exit 1
   }
 }

Write-Host "Cleaning pnpm store & cache"
pnpm store prune
pnpm cache clean --all

Write-Host "Store dir set. Run 'pnpm install' to re-populate the store on the X: drive."
Write-Host "Tip: If you see ENOSPC during install, ensure X: has enough free disk space and rerun this script."
