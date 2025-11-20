$pnpmStorePath = 'X:\pnpm-store'

Write-Host ' D-A-I-R-A pnpm Store Fix (X: Drive Relocation)' -ForegroundColor Cyan
Write-Host '==========================================' -ForegroundColor Cyan

Write-Host "
[1/5] Creating pnpm store directory on X: drive..." -ForegroundColor Yellow
New-Item -ItemType Directory -Path $pnpmStorePath -Force | Out-Null
Write-Host ' Store directory created' -ForegroundColor Green

Write-Host "
[2/5] Configuring pnpm to use X: drive..." -ForegroundColor Yellow
pnpm config set store-dir $pnpmStorePath
Write-Host ' pnpm store configured' -ForegroundColor Green

Write-Host "
[3/5] Pruning pnpm store..." -ForegroundColor Yellow
pnpm store prune
Write-Host ' Store pruned' -ForegroundColor Green

Write-Host "
[4/5] Clearing pnpm cache..." -ForegroundColor Yellow
pnpm cache clean --all
Write-Host ' Cache cleared' -ForegroundColor Green

Write-Host "
[5/5] Running fresh pnpm install..." -ForegroundColor Yellow
pnpm install --frozen-lockfile
if ($LASTEXITCODE -eq 0) {
  Write-Host ' pnpm install completed successfully' -ForegroundColor Green
  Write-Host "
 All done! pnpm store is now on X: drive" -ForegroundColor Cyan
} else {
  Write-Host ' pnpm install failed' -ForegroundColor Red
  exit 1
}
