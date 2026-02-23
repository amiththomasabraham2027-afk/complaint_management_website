#!/usr/bin/env python3
"""
Automated Deployment Orchestration Script
Handles: GitHub Secrets, EC2 Setup, Docker Deployment, and Monitoring
Secrets are read from environment variables (secure)
"""

import os
import sys
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Configuration - Read from environment variables
CONFIG = {
    'GITHUB_TOKEN': os.getenv('GITHUB_TOKEN', ''),
    'GITHUB_REPO': 'amiththomasabraham2027-afk/complaint_management_website',
    'AWS_ACCESS_KEY': os.getenv('AWS_ACCESS_KEY_ID', ''),
    'AWS_SECRET_KEY': os.getenv('AWS_SECRET_ACCESS_KEY', ''),
    'AWS_REGION': os.getenv('AWS_REGION', 'ap-south-1'),
    'EC2_INSTANCE_ID': 'i-0220380d98646d5ea',
    'EC2_IP': '13.200.254.173',
    'EC2_USER': 'ubuntu',
    'SSH_KEY_PATH': 'Complaint_manage.pem',
    'MONGODB_URI': os.getenv('MONGODB_URI', ''),
    'JWT_SECRET': os.getenv('JWT_SECRET', ''),
    'NEXTAUTH_SECRET': os.getenv('NEXTAUTH_SECRET', ''),
    'NEXTAUTH_URL': 'http://13.200.254.173:3000'
}

class Colors:
    RESET = '\033[0m'
    BOLD = '\033[1m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'

def log(msg, level='INFO'):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    if level == 'INFO':
        print(f"{Colors.BLUE}[{timestamp}] ℹ️  {msg}{Colors.RESET}")
    elif level == 'SUCCESS':
        print(f"{Colors.GREEN}[{timestamp}] ✅ {msg}{Colors.RESET}")
    elif level == 'WARNING':
        print(f"{Colors.YELLOW}[{timestamp}] ⚠️  {msg}{Colors.RESET}")
    elif level == 'ERROR':
        print(f"{Colors.RED}[{timestamp}] ❌ {msg}{Colors.RESET}")

def validate_config():
    """Validate that all required config values are set"""
    log("Validating configuration...", 'INFO')
    
    required = {
        'GITHUB_TOKEN': 'GitHub Personal Access Token',
        'MONGODB_URI': 'MongoDB connection string',
        'JWT_SECRET': 'JWT secret key',
        'NEXTAUTH_SECRET': 'NextAuth secret key'
    }
    
    missing = {}
    for key, description in required.items():
        if not CONFIG[key]:
            missing[key] = description
    
    if missing:
        log("❌ Missing required configuration!", 'ERROR')
        log("\nFirst, set up your secrets:\n", 'INFO')
        log("  bash setup-secrets.sh      # macOS/Linux", 'INFO')
        log("  .\\setup-secrets.ps1       # Windows", 'INFO')
        log("\nThen source the environment:\n", 'INFO')
        log("  source .env.local          # macOS/Linux", 'INFO')
        log("  . .\\env.local             # PowerShell", 'INFO')
        sys.exit(1)
    
    # Check SSH key exists
    if not Path(CONFIG['SSH_KEY_PATH']).exists():
        log(f"SSH key not found: {CONFIG['SSH_KEY_PATH']}", 'ERROR')
        sys.exit(1)
    
    log("✓ All configuration validated!", 'SUCCESS')

def run_cmd(cmd, check=True, capture=False):
    """Run shell command"""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=check)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=check)
            return None
    except subprocess.CalledProcessError as e:
        log(f"Command failed: {cmd}", 'ERROR')
        raise

def setup_github_secrets():
    """Configure GitHub repository secrets"""
    log("Setting up GitHub Secrets...", 'INFO')
    
    secrets = {
        'SSH_PRIVATE_KEY': open(CONFIG['SSH_KEY_PATH']).read(),
        'SERVER_HOST': CONFIG['EC2_IP'],
        'SERVER_USER': CONFIG['EC2_USER'],
        'MONGODB_URI': CONFIG['MONGODB_URI'],
        'JWT_SECRET': CONFIG['JWT_SECRET'],
        'NEXTAUTH_SECRET': CONFIG['NEXTAUTH_SECRET'],
    }
    
    for secret_name, secret_value in secrets.items():
        log(f"Setting secret: {secret_name}")
        
        try:
            cmd = f"gh secret set {secret_name}"
            process = subprocess.Popen(cmd, shell=True, stdin=subprocess.PIPE, 
                                      text=True, capture_output=True)
            process.communicate(input=secret_value)
            
            if process.returncode == 0:
                log(f"✓ {secret_name} set successfully", 'SUCCESS')
            else:
                log(f"Could not set {secret_name}", 'WARNING')
        except Exception as e:
            log(f"Error setting {secret_name}: {e}", 'WARNING')
    
    log("GitHub Secrets configured!", 'SUCCESS')

def setup_ec2_instance():
    """Setup EC2 with Docker and prerequisites"""
    log("Setting up EC2 instance...", 'INFO')
    
    # Test SSH connection
    log("Testing SSH connection...", 'INFO')
    try:
        run_cmd(f"ssh-keyscan -H {CONFIG['EC2_IP']} >> ~/.ssh/known_hosts 2>/dev/null || true", check=False)
        
        run_cmd(
            f"ssh -i {CONFIG['SSH_KEY_PATH']} -o StrictHostKeyChecking=no "
            f"-o ConnectTimeout=5 {CONFIG['EC2_USER']}@{CONFIG['EC2_IP']} "
            f"'echo SSH Connected'",
            check=True
        )
        log("SSH connection successful!", 'SUCCESS')
    except Exception as e:
        log(f"SSH connection failed: {e}", 'ERROR')
        raise
    
    # Run setup script
    log("Installing Docker and prerequisites...", 'INFO')
    setup_script = '''
set -e
echo "=== EC2 Setup Started ==="

sudo apt-get update -qq && sudo apt-get upgrade -y -qq

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh && sudo bash /tmp/get-docker.sh
fi

sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
    -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose

sudo usermod -aG docker $USER || true
sudo systemctl restart docker || true

sudo apt-get install -y -qq git curl wget htop net-tools build-essential
mkdir -p ~/complaint-app ~/backups

sudo apt-get install -y -qq ufw
sudo ufw allow 22/tcp && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw --force enable || true

echo "=== EC2 Setup Complete ==="
docker --version && docker-compose --version
'''
    
    ssh_cmd = (
        f"ssh -i {CONFIG['SSH_KEY_PATH']} -o StrictHostKeyChecking=no "
        f"{CONFIG['EC2_USER']}@{CONFIG['EC2_IP']} << 'SCRIPT_EOF'\n"
        f"{setup_script}\nSCRIPT_EOF"
    )
    
    try:
        run_cmd(ssh_cmd, check=True)
        log("EC2 instance setup complete!", 'SUCCESS')
    except Exception as e:
        log(f"EC2 setup failed: {e}", 'ERROR')
        raise

def deploy_application():
    """Deploy application to EC2"""
    log("Deploying application to EC2...", 'INFO')
    
    deploy_script = f'''
set -e
cd ~/complaint-app || mkdir -p ~/complaint-app && cd ~/complaint-app

if [ -d .git ]; then
    git pull origin main
else
    git clone https://github.com/{CONFIG['GITHUB_REPO']}.git .
fi

cat > .env.production << 'ENVEOF'
NODE_ENV=production
MONGODB_URI={CONFIG['MONGODB_URI']}
JWT_SECRET={CONFIG['JWT_SECRET']}
JWT_EXPIRE=7d
NEXTAUTH_SECRET={CONFIG['NEXTAUTH_SECRET']}
NEXTAUTH_URL={CONFIG['NEXTAUTH_URL']}
NEXT_PUBLIC_API_URL=http://{CONFIG['EC2_IP']}/api
NODE_OPTIONS=--max-old-space-size=2048
ENVEOF

docker build -t complaint-app:latest . && docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker-compose -f docker-compose.prod.yml up -d

for i in {{1..60}}; do
    curl -f http://localhost:3000 >/dev/null 2>&1 && echo "✓ Application is healthy!" && break
    echo "Waiting... ($i/60)" && sleep 2
done

docker-compose -f docker-compose.prod.yml ps
echo "Access app at: http://{CONFIG['EC2_IP']}:3000"
'''
    
    ssh_cmd = (
        f"ssh -i {CONFIG['SSH_KEY_PATH']} -o StrictHostKeyChecking=no "
        f"{CONFIG['EC2_USER']}@{CONFIG['EC2_IP']} << 'SCRIPT_EOF'\n"
        f"{deploy_script}\nSCRIPT_EOF"
    )
    
    try:
        run_cmd(ssh_cmd, check=True)
        log("Application deployed successfully!", 'SUCCESS')
    except Exception as e:
        log(f"Deployment failed: {e}", 'ERROR')
        raise

def verify_deployment():
    """Verify application is running"""
    log("Verifying deployment...", 'INFO')
    
    ssh_cmd = (
        f"ssh -i {CONFIG['SSH_KEY_PATH']} -o StrictHostKeyChecking=no "
        f"{CONFIG['EC2_USER']}@{CONFIG['EC2_IP']} "
        f"'cd ~/complaint-app && docker-compose -f docker-compose.prod.yml ps'"
    )
    
    try:
        output = run_cmd(ssh_cmd, capture=True)
        log("Container status:", 'INFO')
        print(output)
        log("✓ Application is running", 'SUCCESS')
    except Exception as e:
        log(f"Verification failed: {e}", 'WARNING')

def main():
    """Main orchestration"""
    print(f"\n{Colors.BOLD}{'='*60}")
    print("🚀 Complaint Management System - Automated Deployment")
    print(f"{'='*60}{Colors.RESET}\n")
    
    try:
        validate_config()
        print()
        
        log("STEP 1: Configuring GitHub Secrets", 'INFO')
        setup_github_secrets()
        print()
        
        log("STEP 2: Setting up EC2 Instance", 'INFO')
        setup_ec2_instance()
        print()
        
        log("STEP 3: Deploying Application", 'INFO')
        deploy_application()
        print()
        
        log("STEP 4: Verifying Deployment", 'INFO')
        verify_deployment()
        print()
        
        print(f"\n{Colors.BOLD}{'='*60}")
        print("✅ AUTOMATED DEPLOYMENT COMPLETE!")
        print(f"{'='*60}{Colors.RESET}")
        print(f"""
{Colors.GREEN}Application Details:{Colors.RESET}
  URL:    http://{CONFIG['EC2_IP']}:3000
  SSH:    ssh -i {CONFIG['SSH_KEY_PATH']} {CONFIG['EC2_USER']}@{CONFIG['EC2_IP']}

{Colors.GREEN}Next Steps:{Colors.RESET}
  1. Access: http://{CONFIG['EC2_IP']}:3000
  2. Push to main for auto-deployment
""")
        
    except Exception as e:
        log(f"Deployment failed: {e}", 'ERROR')
        sys.exit(1)

if __name__ == '__main__':
    main()
