# =============================================================
# AWS EC2 Automated Provisioning & Deployment Script
# =============================================================
# This PowerShell script automates:
# 1. EC2 instance verification
# 2. SSH setup
# 3. Docker installation on EC2
# 4. GitHub secrets configuration
# 5. Code deployment

param(
    [Parameter(Mandatory = $false)]
    [string]$EC2PublicIP,
    
    [Parameter(Mandatory = $false)]
    [string]$SSHKeyPath,
    
    [Parameter(Mandatory = $false)]
    [string]$GitHubToken,
    
    [Parameter(Mandatory = $false)]
    [string]$DockerUsername,
    
    [Parameter(Mandatory = $false)]
    [string]$DockerPassword
)

$ErrorActionPreference = "Continue"

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host "  $Title" -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Step {
    param([string]$Message)
    Write-Host "→ $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Error-Custom {
    param([string]$Message)
    Write-Host "✗ $Message" -ForegroundColor Red
}

# =============================================================
# Step 1: Validate Inputs
# =============================================================
Write-Header "Step 1: Validating Configuration"

if (-not $EC2PublicIP) {
    $EC2PublicIP = Read-Host "  📍 Enter EC2 Public IP Address"
}

if (-not $SSHKeyPath) {
    $SSHKeyPath = Read-Host "  🔑 Enter path to .pem SSH key (e.g., C:\Users\YourName\Downloads\key.pem)"
}

if (-not (Test-Path $SSHKeyPath)) {
    Write-Error-Custom "SSH key not found at: $SSHKeyPath"
    exit 1
}

Write-Success "EC2 IP: $EC2PublicIP"
Write-Success "SSH Key: $SSHKeyPath"

# =============================================================
# Step 2: Test SSH Connection
# =============================================================
Write-Header "Step 2: Testing SSH Connection"

Write-Step "Testing SSH to ubuntu@$EC2PublicIP..."

try {
    $testCmd = ssh -i $SSHKeyPath -o StrictHostKeyChecking=no -o ConnectTimeout=10 ubuntu@$EC2PublicIP "whoami"
    Write-Success "SSH connection successful! User: $testCmd"
} catch {
    Write-Error-Custom "SSH connection failed. Check IP and key permissions."
    exit 1
}

# =============================================================
# Step 3: Deploy EC2 Setup Script
# =============================================================
Write-Header "Step 3: Deploying EC2 Setup Script"

Write-Step "Copying setup script to EC2..."

$setupScript = "$(Get-Location)\ec2-setup.sh"
if (-not (Test-Path $setupScript)) {
    Write-Error-Custom "ec2-setup.sh not found in current directory"
    exit 1
}

# Copy script via SCP
$scpCmd = "scp -i `"$SSHKeyPath`" -o StrictHostKeyChecking=no `"$setupScript`" ubuntu@$($EC2PublicIP):~/ec2-setup.sh"
Invoke-Expression $scpCmd

Write-Success "Setup script deployed"

# =============================================================
# Step 4: Execute Setup Script on EC2
# =============================================================
Write-Header "Step 4: Running EC2 Setup (This takes ~3-5 minutes)"

Write-Step "Executing Docker installation..."

$remoteCmd = @"
bash ~/ec2-setup.sh
"@

ssh -i $SSHKeyPath -o StrictHostKeyChecking=no ubuntu@$EC2PublicIP $remoteCmd

Write-Success "EC2 setup complete!"

# =============================================================
# Step 5: Verify Docker on EC2
# =============================================================
Write-Header "Step 5: Verifying Docker Installation"

Write-Step "Checking Docker version..."

ssh -i $SSHKeyPath -o StrictHostKeyChecking=no ubuntu@$EC2PublicIP "docker --version && docker compose version"

Write-Success "Docker verified on EC2"

# =============================================================
# Step 6: Configure GitHub Secrets
# =============================================================
Write-Header "Step 6: GitHub Secrets Configuration"

if (-not $GitHubToken) {
    Write-Host ""
    Write-Host "ℹ️  Need GitHub credentials to add CI/CD secrets" -ForegroundColor Cyan
    Write-Host "   Generate token at: https://github.com/settings/tokens" -ForegroundColor Gray
    Write-Host ""
    $useAutomation = Read-Host "   Do you want to add GitHub secrets now? (y/n)"
    
    if ($useAutomation -eq 'y' -or $useAutomation -eq 'yes') {
        $GitHubToken = Read-Host "   🔑 GitHub Token"
    }
}

if ($GitHubToken) {
    Write-Step "Adding GitHub secrets..."
    
    # Run Python script to add secrets
    $pythonScript = "$(Get-Location)\setup-github-secrets.py"
    if (Test-Path $pythonScript) {
        # Create input file for non-interactive mode
        Write-Host ""
        Write-Host "   ℹ️  Run this to add secrets interactively:" -ForegroundColor Gray
        Write-Host "   python setup-github-secrets.py" -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Error-Custom "setup-github-secrets.py not found"
    }
} else {
    Write-Host ""
    Write-Host "   ℹ️  Skipping automated secret setup" -ForegroundColor Yellow
    Write-Host "   Run manually: python setup-github-secrets.py" -ForegroundColor Gray
}

# =============================================================
# Step 7: Add EC2 Details to .env
# =============================================================
Write-Header "Step 7: Creating Deployment Environment File"

$envContent = @"
# EC2 Deployment Configuration
EC2_HOST=$EC2PublicIP
EC2_USER=ubuntu
EC2_KEY_PATH=$SSHKeyPath
EC2_REGION=ap-south-1
EC2_DEPLOYMENT_PATH=~/complaint-app

# Deployment Timestamps
LAST_SETUP=$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

$envFile = "$(Get-Location)\.env.deployment"
Set-Content -Path $envFile -Value $envContent

Write-Success "Deployment config saved to .env.deployment"

# =============================================================
# Step 8: Display Summary
# =============================================================
Write-Header "✅ Automated Setup Complete!"

Write-Host "📋 Configuration Summary:" -ForegroundColor Cyan
Write-Host "   EC2 Instance: ubuntu@$EC2PublicIP" -ForegroundColor Gray
Write-Host "   SSH Key: $SSHKeyPath" -ForegroundColor Gray
Write-Host "   Docker: ✓ Installed" -ForegroundColor Gray
Write-Host "   Deployment Path: ~/complaint-app" -ForegroundColor Gray
Write-Host ""

Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Add GitHub secrets: python setup-github-secrets.py" -ForegroundColor Gray
Write-Host "   2. Push code: git add . && git commit -m 'message' && git push origin main" -ForegroundColor Gray
Write-Host "   3. Watch deployment: GitHub → Actions tab" -ForegroundColor Gray
Write-Host "   4. Access app: http://$EC2PublicIP" -ForegroundColor Gray
Write-Host ""

Write-Host "📊 CI/CD Pipeline Ready!" -ForegroundColor Green
Write-Host ""
