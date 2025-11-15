# Auto-commit and push script for DAIRA
while ($true) {
    git add .
    $status = git status --porcelain
    if ($status) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "Auto-commit: $timestamp"
        git push origin main
    }
    Start-Sleep -Seconds 60  # Check every 60 seconds
}
