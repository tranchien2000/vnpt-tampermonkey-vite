# NotebookLM Auth Fixer
Write-Host "Checking environment..." -ForegroundColor Cyan
if (!(Get-Command node -ErrorAction SilentlyContinue)) { Write-Error "Node.js not found!"; exit }

Write-Host "Cleaning up old processes..." -ForegroundColor Yellow
taskkill /F /IM msedge.exe /T 2>$null
taskkill /F /IM node.exe /T 2>$null

$env:CHROME_PATH="E:\CENT_BROWER\CentBrowser\Application\chrome.exe"
$env:HEADLESS="false"

Write-Host "Launching Authentication Window via CentBrowser..." -ForegroundColor Green
npx -y notebooklm-mcp-ultimate setup-auth
