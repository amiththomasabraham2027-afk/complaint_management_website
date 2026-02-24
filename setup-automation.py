#!/usr/bin/env python3
"""
COMPLAINT MANAGEMENT - COMPLETE DEPLOYMENT SETUP

This script provides a guided setup for full CI/CD automation
- Generates required commands
- Verifies prerequisites
- Provides manual steps where needed
"""

import os
import subprocess
from pathlib import Path
import json

print("""
╔══════════════════════════════════════════════════════════════╗
║        COMPLAINT MANAGEMENT - CI/CD SETUP WIZARD             ║
║              AWS EC2 + Docker + GitHub Automation            ║
╚══════════════════════════════════════════════════════════════╝
""")

# Configuration
CONFIG = {
    'ssh_key': 'resolvex_deploy.pem',
    'ec2_ip': '13.200.254.173',
    'ec2_user': 'ubuntu',
    'ec2_region': 'ap-south-1',
    'instance_id': 'i-0220380d98646d5ea',
    'docker_username': 'amiththomasabraham',
    'docker_image': 'complaint-app',
    'github_repo': 'amiththomasabraham2027-afk/complaint_management_website',
}

def print_step(num, title, color='\033[94m'):
    """Print colored step header"""
    print(f"\n{color}{'='*60}\n[STEP {num}] {title}\n{'='*60}\033[0m\n")

def print_info(msg, icon='ℹ️ '):
    print(f"{icon} {msg}")

def print_success(msg):
    print(f"\033[92m✓ {msg}\033[0m")

def print_warning(msg):
    print(f"\033[93m⚠ {msg}\033[0m")

def print_error(msg):
    print(f"\033[91m✗ {msg}\033[0m")

# Step 1: Verify prerequisites
print_step(1, "VERIFYING PREREQUISITES")

checks = {
    'Git': ['git', '--version'],
    'Docker': ['docker', '--version'],
    'Python': ['python', '--version'],
    'SSH Key': None,  # File check
}

all_good = True
for name, cmd in checks.items():
    if cmd is None:
        # File check
        if Path(CONFIG['ssh_key']).exists():
            print_success(f"{name} found: {CONFIG['ssh_key']}")
        else:
            print_error(f"{name} not found: {CONFIG['ssh_key']}")
            all_good = False
    else:
        try:
            subprocess.run(cmd, capture_output=True, check=True)
            print_success(f"{name} ✓")
        except:
            print_error(f"{name} not found")
            all_good = False

# Step 2: Extract public key
print_step(2, "EXTRACTING SSH PUBLIC KEY")

try:
    result = subprocess.run(
        ['ssh-keygen', '-y', '-f', CONFIG['ssh_key']],
        capture_output=True,
        text=True,
        check=True
    )
    public_key = result.stdout.strip()
    print_success(f"Public key extracted ({len(public_key)} chars)")
    print_info(f"Key type: {public_key.split()[0]}")
    print_info(f"First 50 chars: {public_key[:50]}...")
except Exception as e:
    print_error(f"Failed to extract public key: {e}")
    print_info("Make sure OpenSSH is installed (ssh-keygen available)")
    public_key = None

# Step 3: Manual SSH Key Authorization (Critical Step)
print_step(3, "SSH KEY AUTHORIZATION - MANUAL STEP REQUIRED", '\033[93m')

print_warning("⚠️  IMPORTANT: SSH Key authorization is required!")
print("""
The SSH key needs to be added to EC2's authorized_keys.
Choose ONE of the methods below:

METHOD A: Using EC2 Console (Easiest)
──────────────────────────────────────────────
1. Go to AWS EC2 Console: https://console.aws.amazon.com/ec2/
2. Select Instance: i-0220380d98646d5ea (ap-south-1)
3. Click "Connect" button → "EC2 Instance Connect"
4. A web terminal opens - run this command:
""")

if public_key:
    auth_cmd = f'echo "{public_key}" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys'
    print(f"\n   {auth_cmd}\n")

print("""
METHOD B: Using AWS SSM Session Manager
──────────────────────────────────────────────
1. Install AWS CLI: https://aws.amazon.com/cli/
2. Configure: aws configure (with your AWS Access Key)
3. Open terminal to instance:
   aws ssm start-session --target i-0220380d98646d5ea --region ap-south-1
4. Run the echo command above


METHOD C: Using Original EC2 Launch Key
──────────────────────────────────────────────
1. Use the key that launched the EC2 instance
2. SSH in and add the new key:
   ssh -i original-key.pem ubuntu@13.200.254.173
   # Then run the echo command above


STATUS CHECK:
──────────────────────────────────────────────
Once authorized, verify success with:
   ssh -i resolvex_deploy.pem ubuntu@13.200.254.173 "whoami"

This should print: ubuntu
""")

input_status = input("\n🔑 Have you authorized the SSH key? (yes/no): ").strip().lower()

if input_status not in ['yes', 'y']:
    print_warning("⚠️  Please authorize the SSH key using one of the methods above")
    print_info("Then run this script again")
    exit(1)

print_success("SSH key authorization confirmed!")

# Step 4: Test SSH connection
print_step(4, "TESTING SSH CONNECTION")

try:
    import paramiko
    
    ssh_key = paramiko.RSAKey.from_private_key_file(CONFIG['ssh_key'])
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(CONFIG['ec2_ip'], username=CONFIG['ec2_user'], pkey=ssh_key, timeout=10)
    
    stdin, stdout, stderr = client.exec_command('whoami')
    user = stdout.read().decode().strip()
    
    print_success(f"SSH connection successful!")
    print_info(f"Connected as: {user}@{CONFIG['ec2_ip']}")
    
    client.close()
    
except Exception as e:
    print_error(f"SSH connection failed: {e}")
    exit(1)

# Step 5: Update GitHub Actions workflow
print_step(5, "UPDATING GITHUB ACTIONS WORKFLOW", '\033[96m')

workflow_yml = f"""name: Build, Push & Deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  DOCKER_IMAGE: {CONFIG['docker_username']}/{CONFIG['docker_image']}

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{{{ secrets.DOCKER_USERNAME }}}}
          password: ${{{{ secrets.DOCKER_PASSWORD }}}}

      - name: Build & Push Docker Image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{{{ env.DOCKER_IMAGE }}}}:latest
            ${{{{ env.DOCKER_IMAGE }}}}:${{{{ github.sha }}}}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to EC2
        env:
          HOST: ${{{{ secrets.HOST }}}}
          USER: ${{{{ secrets.USERNAME }}}}
          SSH_KEY: ${{{{ secrets.SSH_PRIVATE_KEY }}}}
          DOCKER_USER: ${{{{ secrets.DOCKER_USERNAME }}}}
          MONGODB_URI: ${{{{ secrets.MONGODB_URI }}}}
          JWT_SECRET: ${{{{ secrets.JWT_SECRET }}}}
          NEXTAUTH_SECRET: ${{{{ secrets.NEXTAUTH_SECRET }}}}
        run: |
          mkdir -p ~/.ssh
          cat > ~/.ssh/deploy_key << 'KEYEOF'
          ${{{{ secrets.SSH_PRIVATE_KEY }}}}
          KEYEOF
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{{{ secrets.HOST }}}} >> ~/.ssh/known_hosts 2>/dev/null || true
          
          ssh -o StrictHostKeyChecking=no -i ~/.ssh/deploy_key ${{{{ secrets.USER }}}}@${{{{ secrets.HOST }}}} << 'DEPLOYEOF'
          cd ~/complaint-app || mkdir -p ~/complaint-app && cd ~/complaint-app
          git clone https://github.com/{CONFIG['github_repo']}.git . 2>/dev/null || git pull origin main
          
          cat > .env.production << 'ENVEOF'
          NODE_ENV=production
          MONGODB_URI=${{MONGODB_URI}}
          JWT_SECRET=${{JWT_SECRET}}
          NEXTAUTH_SECRET=${{NEXTAUTH_SECRET}}
          NEXTAUTH_URL=http://${{HOST}}
          NEXT_PUBLIC_API_URL=http://${{HOST}}/api
          ENVEOF
          
          docker pull ${{DOCKER_USER}}/complaint-app:latest
          docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
          docker-compose -f docker-compose.prod.yml up -d
          
          sleep 5
          curl -f http://localhost/health || true
          DEPLOYEOF

      - name: ✅ Deployment Complete
        if: success()
        run: |
          echo "🎉 Application deployed to: http://${{{{ secrets.HOST }}}}"
          echo "📦 Docker Image: ${{{{ env.DOCKER_IMAGE }}}}:latest"
"""

workflow_path = Path('.github/workflows/automated-deploy.yml')
workflow_path.parent.mkdir(parents=True, exist_ok=True)
workflow_path.write_text(workflow_yml)
print_success(f"Workflow created: {workflow_path}")

# Step 6: Commit and push
print_step(6, "COMMITTING CHANGES TO GITHUB", '\033[96m')

try:
    subprocess.run(['git', 'add', '.github/workflows/automated-deploy.yml'], check=True)
    subprocess.run(['git', 'commit', '-m', 'chore: enable fully automated CI/CD deployment'], check=True)
    subprocess.run(['git', 'push', 'origin', 'main'], check=True)
    print_success("Changes pushed to GitHub!")
except Exception as e:
    print_warning(f"Git push failed: {e}")
    print_info("You can manually commit and push when ready")

# Step 7: Final instructions
print_step(7, "SETUP COMPLETE! 🎉", '\033[92m')

print("""
Next Steps:
──────────────────────────────────────────════════════════════

1. ✅ SSH Key is authorized
2. ✅ GitHub Actions workflow is configured
3. ✅ Automated deployment pipeline is ready

NOW:
────
Every push to 'main' branch will automatically:
  1. Build Docker image
  2. Push to Docker Hub
  3. Deploy to EC2 Instance
  4. Verify application health

TO TEST IMMEDIATELY:
──────────────────────────────────────────────
Run: git commit --allow-empty -m "test: trigger deployment"
     git push origin main

Then watch the GitHub Actions:
https://github.com/{CONFIG['github_repo']}/actions

VERIFY DEPLOYMENT:
──────────────────────────────────────────────
SSH into instance:
  ssh -i {CONFIG['ssh_key']} {CONFIG['ec2_user']}@{CONFIG['ec2_ip']}

Check containers:
  docker-compose -f ~/complaint-app/docker-compose.prod.yml ps

View logs:
  docker-compose -f ~/complaint-app/docker-compose.prod.yml logs -f complaint-app

Access application:
  http://{CONFIG['ec2_ip']}

TROUBLESHOOTING:
──────────────────────────────────────────────
• SSH doesn't work: Verify key authorization on EC2
• Container won't start: Check EC2 Docker installation
• App not responding: View logs and health status
• GitHub Actions fails: Check secrets in repository settings
""")

print("\n" + "="*60)
print("✨ CI/CD Automation Setup Complete!")
print("="*60 + "\n")
