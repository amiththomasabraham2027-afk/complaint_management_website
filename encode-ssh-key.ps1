#!/usr/bin/env pwsh
# Encode the LF-only SSH key from file (aws-deploy-key-lf.pem)
# ALWAYS use aws-deploy-key-lf.pem - this is the key whose public part is on the server

$keyFile = Join-Path $PSScriptRoot "aws-deploy-key-lf.pem"
if (-not (Test-Path $keyFile)) {
    Write-Error "Key file not found: $keyFile  (run: python -c to create it)"
    exit 1
}

# Read bytes directly to avoid any line-ending manipulation
$keyBytes = [System.IO.File]::ReadAllBytes($keyFile)

# Verify no CRLF
$hasCRLF = $false
for ($i = 0; $i -lt $keyBytes.Length - 1; $i++) {
    if ($keyBytes[$i] -eq 13 -and $keyBytes[$i+1] -eq 10) { $hasCRLF = $true; break }
}
if ($hasCRLF) {
    Write-Host "WARNING: CRLF detected in key file! Use aws-deploy-key-lf.pem, not aws-deploy-key.pem" -ForegroundColor Red
    exit 1
}

$base64Key = [System.Convert]::ToBase64String($keyBytes)

Write-Host "Key file  : $keyFile" -ForegroundColor Cyan
Write-Host "Key bytes : $($keyBytes.Length)" -ForegroundColor Cyan
Write-Host "Base64 len: $($base64Key.Length) chars`n" -ForegroundColor Cyan
Write-Host $base64Key

$base64Key | Set-Clipboard
Write-Host "`nBase64 key copied to clipboard" -ForegroundColor Green
Write-Host "Run python update_github_secrets.py to push to GitHub" -ForegroundColor Yellow
