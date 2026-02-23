# PowerShell deployment helper for Windows users

param(
    [Parameter(Mandatory = $false)]
    [string]$Action = "deploy",
    
    [Parameter(Mandatory = $false)]
    [string]$KeyPath = ".\Complaint_manage.pem",
    
    [Parameter(Mandatory = $false)]
    [string]$ServerUser = "ubuntu",
    
    [Parameter(Mandatory = $false)]
    [string]$ServerHost = "13.200.254.173"
)

# Colors
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }

# Check if key exists
if (-not (Test-Path $KeyPath)) {
    Write-Error "SSH key not found at: $KeyPath"
    exit 1
}

# Convert script to WSL-compatible bash script
$BashScripts = @{
    "setup-ec2" = {
        Write-Warning "Running EC2 setup..."
        & bash setup-ec2.sh $KeyPath $ServerUser $ServerHost
    }
    "deploy" = {
        Write-Warning "Deploying application..."
        & bash deploy.sh $KeyPath $ServerUser $ServerHost
    }
    "update" = {
        Write-Warning "Running quick update..."
        & bash quick-update.sh $KeyPath $ServerUser $ServerHost
    }
    "logs" = {
        Write-Warning "Fetching logs..."
        & bash view-logs.sh $KeyPath $ServerUser $ServerHost complaint-app 50
    }
    "status" = {
        Write-Warning "Checking application status..."
        & bash -c "ssh -i '$KeyPath' -o StrictHostKeyChecking=no '$ServerUser@$ServerHost' 'cd ~/complaint-app && docker-compose -f docker-compose.prod.yml ps'"
    }
    "restart" = {
        Write-Warning "Restarting application..."
        & bash -c "ssh -i '$KeyPath' -o StrictHostKeyChecking=no '$ServerUser@$ServerHost' 'cd ~/complaint-app && docker-compose -f docker-compose.prod.yml restart complaint-app'"
    }
    "stop" = {
        Write-Warning "Stopping application..."
        & bash -c "ssh -i '$KeyPath' -o StrictHostKeyChecking=no '$ServerUser@$ServerHost' 'cd ~/complaint-app && docker-compose -f docker-compose.prod.yml down'"
    }
    "clean" = {
        Write-Warning "Cleaning up Docker images and volumes..."
        & bash -c "ssh -i '$KeyPath' -o StrictHostKeyChecking=no '$ServerUser@$ServerHost' 'cd ~/complaint-app && docker system prune -af'"
    }
}

if ($BashScripts.ContainsKey($Action)) {
    try {
        & $BashScripts[$Action]
        if ($LASTEXITCODE -eq 0) {
            Write-Success "✓ Operation completed successfully!"
        } else {
            Write-Error "✗ Operation failed with exit code: $LASTEXITCODE"
            exit 1
        }
    }
    catch {
        Write-Error "Error: $_"
        exit 1
    }
} else {
    Write-Error "Unknown action: $Action"
    Write-Host ""
    Write-Host "Usage: .\deploy.ps1 [action] [keyPath] [serverUser] [serverHost]"
    Write-Host ""
    Write-Host "Available actions:"
    Write-Host "  setup-ec2  - Setup EC2 instance with Docker"
    Write-Host "  deploy     - Full deployment to EC2"
    Write-Host "  update     - Quick update (git pull + restart)"
    Write-Host "  status     - Check application status"
    Write-Host "  logs       - View application logs"
    Write-Host "  restart    - Restart application containers"
    Write-Host "  stop       - Stop application containers"
    Write-Host "  clean      - Clean up Docker resources"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\deploy.ps1 deploy"
    Write-Host "  .\deploy.ps1 logs -KeyPath './Complaint_manage.pem' -ServerHost '13.200.254.173'"
    exit 1
}
