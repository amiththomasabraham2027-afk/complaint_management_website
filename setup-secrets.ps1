# PowerShell script to set up deployment secrets

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "🔐 Deployment Configuration Setup" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

if (Test-Path ".env.local") {
    $response = Read-Host "❓ .env.local exists. Update? (y/n)"
    if ($response -ne 'y' -and $response -ne 'Y') {
        Write-Host "Using existing .env.local"
        Write-Host "Run: . .\setup-secrets.ps1 -Load" -ForegroundColor Green
        exit 0
    }
}

Write-Host "Enter the following secrets:" -ForegroundColor Green
Write-Host ""

$GitHubToken = Read-Host "GitHub Personal Access Token"
if ([string]::IsNullOrWhiteSpace($GitHubToken)) {
    Write-Host "❌ Token required" -ForegroundColor Red
    exit 1
}

Write-Host ""
$MongodbUri = Read-Host "MongoDB URI"
if ([string]::IsNullOrWhiteSpace($MongodbUri)) {
    Write-Host "❌ URI required" -ForegroundColor Red
    exit 1
}

Write-Host ""
$JwtSecret = Read-Host "JWT Secret (Enter to generate)"
if ([string]::IsNullOrWhiteSpace($JwtSecret)) {
    $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    $JwtSecret = [System.Convert]::ToBase64String($bytes)
    Write-Host "Generated: $JwtSecret" -ForegroundColor Green
}

Write-Host ""
$NextAuthSecret = Read-Host "NextAuth Secret (Enter to generate)"
if ([string]::IsNullOrWhiteSpace($NextAuthSecret)) {
    $bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    $NextAuthSecret = [System.Convert]::ToBase64String($bytes)
    Write-Host "Generated: $NextAuthSecret" -ForegroundColor Green
}

$envContent = @"
`$env:GITHUB_TOKEN='$GitHubToken'
`$env:MONGODB_URI='$MongodbUri'
`$env:JWT_SECRET='$JwtSecret'
`$env:NEXTAUTH_SECRET='$NextAuthSecret'
`$env:AWS_REGION='ap-south-1'
"@

$envContent | Set-Content ".env.local" -Encoding UTF8

if (-not (Test-Path ".gitignore") -or (Get-Content ".gitignore" -Raw) -notmatch "\.env\.local") {
    Add-Content ".gitignore" ".env.local" -ErrorAction SilentlyContinue
}

(Get-Item ".env.local").Attributes = 'Hidden'

Write-Host ""
Write-Host "✅ Configuration saved to .env.local" -ForegroundColor Green
Write-Host ""
Write-Host "To deploy, run:" -ForegroundColor Cyan
Write-Host "  . .\env.local    # Load environment" -ForegroundColor Gray
Write-Host "  python auto_deploy.py           # Deploy" -ForegroundColor Gray
