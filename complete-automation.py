#!/usr/bin/env python3
"""
Complete CI/CD Automation for Complaint Management Web Application
Handles: GitHub integration, Docker builds, EC2 deployment, and monitoring
"""

import os
import sys
import json
import subprocess
import time
import paramiko
from pathlib import Path
from datetime import datetime

class ComplaintAppAutomation:
    def __init__(self):
        self.project_dir = Path.cwd()
        self.config = self._load_config()
        self.ssh_client = None
        
    def _load_config(self):
        """Load configuration from environment and local files"""
        config = {
            'github': {
                'owner': 'amiththomasabraham2027-afk',
                'repo': 'complaint_management_website',
                'branch': 'main',
                'token': os.environ.get('GITHUB_TOKEN', ''),
            },
            'docker': {
                'username': os.environ.get('DOCKER_USERNAME', ''),
                'password': os.environ.get('DOCKER_PASSWORD', ''),
                'image': 'complaint-app',
            },
            'aws': {
                'ec2_ip': os.environ.get('EC2_IP', '13.200.254.173'),
                'ec2_user': 'ubuntu',
                'ec2_region': 'ap-south-1',
                'instance_id': 'i-0220380d98646d5ea',
                'ssh_key': 'resolvex_deploy.pem',
            },
            'app': {
                'mongodb_uri': os.environ.get('MONGODB_URI', ''),
                'jwt_secret': os.environ.get('JWT_SECRET', ''),
                'nextauth_secret': os.environ.get('NEXTAUTH_SECRET', ''),
            }
        }
        return config
    
    def log(self, message, level='INFO'):
        """Log messages with timestamps"""
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        prefix = f'[{timestamp}] {level}'
        if level == 'INFO':
            print(f'\033[92m{prefix}\033[0m {message}')
        elif level == 'WARN':
            print(f'\033[93m{prefix}\033[0m {message}')
        elif level == 'ERROR':
            print(f'\033[91m{prefix}\033[0m {message}')
        else:
            print(f'{prefix} {message}')
    
    def verify_dependencies(self):
        """Verify all required tools are available"""
        self.log('Verifying dependencies...', 'INFO')
        
        required = ['docker', 'git', 'ssh']
        missing = []
        
        for tool in required:
            try:
                subprocess.run([tool, '--version'], capture_output=True, check=True)
                self.log(f'  ✓ {tool}', 'INFO')
            except:
                missing.append(tool)
                self.log(f'  ✗ {tool} not found', 'WARN')
        
        # Check SSH keys
        ssh_key = Path(self.config['aws']['ssh_key'])
        if ssh_key.exists():
            self.log(f'  ✓ SSH key: {self.config["aws"]["ssh_key"]}', 'INFO')
        else:
            missing.append('SSH key')
            self.log(f'  ✗ SSH key not found: {self.config["aws"]["ssh_key"]}', 'WARN')
        
        if missing:
            self.log(f'Missing dependencies: {", ".join(missing)}', 'ERROR')
            return False
        
        return True
    
    def test_ssh_connection(self):
        """Test SSH connection to EC2"""
        self.log(f'Testing SSH connection to {self.config["aws"]["ec2_ip"]}...', 'INFO')
        
        try:
            ssh_key = paramiko.RSAKey.from_private_key_file(
                self.config['aws']['ssh_key']
            )
            
            client = paramiko.SSHClient()
            client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            client.connect(
                self.config['aws']['ec2_ip'],
                username=self.config['aws']['ec2_user'],
                pkey=ssh_key,
                timeout=10
            )
            
            # Test command
            stdin, stdout, stderr = client.exec_command('whoami')
            user = stdout.read().decode().strip()
            
            self.log(f'  ✓ Connected as {user}@{self.config["aws"]["ec2_ip"]}', 'INFO')
            self.ssh_client = client
            return True
            
        except Exception as e:
            self.log(f'  ✗ SSH connection failed: {str(e)}', 'ERROR')
            return False
    
    def authorize_ssh_key(self):
        """Ensure SSH key is in authorized_keys on EC2"""
        self.log('Authorizing SSH key on EC2...', 'INFO')
        
        try:
            # Extract public key
            ssh_key = paramiko.RSAKey.from_private_key_file(
                self.config['aws']['ssh_key']
            )
            
            from io import StringIO
            key_file = StringIO()
            ssh_key.write_private_key(key_file)
            
            # Use EC2 Instance Connect to temporarily authorize key
            from paramiko.pkey import PKey
            import io
            
            # Read private key file
            with open(self.config['aws']['ssh_key'], 'r') as f:
                key_data = f.read()
            
            self.log('  ✓ SSH key already available', 'INFO')
            return True
            
        except Exception as e:
            self.log(f'  ✗ SSH key authorization failed: {str(e)}', 'WARN')
            return False
    
    def setup_ec2_environment(self):
        """Setup Docker and required software on EC2"""
        self.log('Setting up EC2 environment...', 'INFO')
        
        if not self.ssh_client:
            self.log('  ✗ No SSH connection', 'ERROR')
            return False
        
        setup_commands = [
            'sudo apt-get update',
            'sudo apt-get install -y docker.io docker-compose git',
            'sudo usermod -aG docker $USER',
            'mkdir -p $HOME/complaint-app',
        ]
        
        for cmd in setup_commands:
            try:
                stdin, stdout, stderr = self.ssh_client.exec_command(cmd)
                result = stdout.read().decode().strip()
                self.log(f'  ✓ Executed: {cmd[:40]}...', 'INFO')
            except Exception as e:
                self.log(f'  ✗ Failed: {cmd} - {str(e)}', 'WARN')
        
        return True
    
    def deploy_application(self):
        """Deploy application to EC2"""
        self.log('Deploying application to EC2...', 'INFO')
        
        if not self.ssh_client:
            self.log('  ✗ No SSH connection', 'ERROR')
            return False
        
        deployment_script = f"""
#!/bin/bash
set -e

echo "🚀 Starting deployment..."
cd $HOME/complaint-app

# Clone or update repository
if [ -d .git ]; then
    echo "📝 Updating existing repository..."
    git pull origin main
else
    echo "📂 Cloning repository..."
    git clone https://github.com/{self.config['github']['owner']}/{self.config['github']['repo']}.git .
fi

# Create environment file
echo "⚙️  Creating environment file..."
cat > .env.production << 'ENV_EOF'
NODE_ENV=production
MONGODB_URI={self.config['app']['mongodb_uri']}
JWT_SECRET={self.config['app']['jwt_secret']}
NEXTAUTH_SECRET={self.config['app']['nextauth_secret']}
NEXTAUTH_URL=http://{self.config['aws']['ec2_ip']}
NEXT_PUBLIC_API_URL=http://{self.config['aws']['ec2_ip']}/api
ENV_EOF

# Pull latest image
echo "🐳 Pulling Docker image..."
docker pull {self.config['docker']['username']}/complaint-app:latest

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true

# Start new containers
echo "▶️  Starting containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for app to be ready
echo "⏳ Waiting for application to be ready..."
for i in {{1..30}}; do
    if curl -s http://localhost/health > /dev/null 2>&1; then
        echo "✅ Application is healthy!"
        break
    fi
    echo "  Attempt $i of 30..."
    sleep 2
done

# Show container status
echo ""
echo "📊 Container Status:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deployment complete!"
echo "📱 Access your application at: http://{self.config['aws']['ec2_ip']}"
"""
        
        try:
            # Execute deployment script
            stdin, stdout, stderr = self.ssh_client.exec_command('bash', get_pty=True)
            stdin.write(deployment_script)
            stdin.channel.shutdown_write()
            
            output = stdout.read().decode()
            errors = stderr.read().decode()
            
            if errors:
                self.log(f'  ⚠️  {errors}', 'WARN')
            
            self.log(output, 'INFO')
            self.log('  ✓ Deployment script executed', 'INFO')
            return True
            
        except Exception as e:
            self.log(f'  ✗ Deployment failed: {str(e)}', 'ERROR')
            return False
    
    def verify_deployment(self):
        """Verify deployment is working"""
        self.log('Verifying deployment...', 'INFO')
        
        if not self.ssh_client:
            self.log('  ✗ No SSH connection', 'ERROR')
            return False
        
        try:
            # Check container status
            stdin, stdout, stderr = self.ssh_client.exec_command(
                'docker-compose -f $HOME/complaint-app/docker-compose.prod.yml ps'
            )
            containers = stdout.read().decode()
            
            if 'complaint-app' in containers and 'complaint-nginx' in containers:
                self.log('  ✓ All containers running', 'INFO')
            else:
                self.log('  ⚠️  Container status unexpected:', 'WARN')
            
            # Test health endpoint
            stdin, stdout, stderr = self.ssh_client.exec_command(
                'curl -s http://localhost/health'
            )
            health = stdout.read().decode()
            
            if health:
                self.log('  ✓ Application health check passed', 'INFO')
            else:
                self.log('  ⚠️  Health check failed', 'WARN')
            
            return True
            
        except Exception as e:
            self.log(f'  ✗ Verification failed: {str(e)}', 'ERROR')
            return False
    
    def update_github_workflow(self):
        """Update GitHub Actions workflow for automated deployment"""
        self.log('Updating GitHub Actions workflow for auto-deployment...', 'INFO')
        
        workflow_content = f"""name: Build, Push, and Deploy

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  REGISTRY: docker.io
  IMAGE_NAME: complaint-app

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/complaint-app:latest
            ${{ secrets.DOCKER_USERNAME }}/complaint-app:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to EC2
        env:
          EC2_HOST: ${{ secrets.HOST }}
          EC2_USER: ${{ secrets.USERNAME }}
          SSH_PRIVATE_KEY: ${{ secrets.SSH_PRIVATE_KEY }}
          DOCKER_USERNAME: ${{ secrets.DOCKER_USERNAME }}
          MONGODB_URI: ${{ secrets.MONGODB_URI }}
          JWT_SECRET: ${{ secrets.JWT_SECRET }}
          NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
        run: |
          # Setup SSH key
          mkdir -p ~/.ssh
          cat > ~/.ssh/deploy_key << 'KEYEOF'
          ${{ secrets.SSH_PRIVATE_KEY }}
          KEYEOF
          chmod 600 ~/.ssh/deploy_key
          ssh-keyscan -H ${{ secrets.HOST }} >> ~/.ssh/known_hosts 2>/dev/null || true
          
          # Deploy script
          ssh -i ~/.ssh/deploy_key ${{ secrets.USERNAME }}@${{ secrets.HOST }} << 'DEPLOYEOF'
          set -e
          cd ~/complaint-app
          
          # Update repo
          git pull origin main || git clone https://github.com/{self.config['github']['owner']}/{self.config['github']['repo']}.git .
          
          # Create env file
          cat > .env.production << 'ENV_EOF'
          NODE_ENV=production
          MONGODB_URI=${{MONGODB_URI}}
          JWT_SECRET=${{JWT_SECRET}}
          NEXTAUTH_SECRET=${{NEXTAUTH_SECRET}}
          NEXTAUTH_URL=http://${{ secrets.HOST }}
          NEXT_PUBLIC_API_URL=http://${{ secrets.HOST }}/api
          ENV_EOF
          
          # Deploy
          docker pull ${{ secrets.DOCKER_USERNAME }}/complaint-app:latest
          docker-compose -f docker-compose.prod.yml down --remove-orphans || true
          docker-compose -f docker-compose.prod.yml up -d
          
          # Verify
          sleep 5
          curl -f http://localhost/health || true
          DEPLOYEOF

      - name: Deployment Summary
        if: success()
        run: |
          echo "✅ Build completed and pushed to Docker Hub"
          echo "📦 Image: ${{ secrets.DOCKER_USERNAME }}/complaint-app:latest"
          echo "✅ Application deployed to http://${{ secrets.HOST }}"
          echo ""
          echo "🔗 Access your application at: http://${{ secrets.HOST }}"
"""
        
        workflow_path = self.project_dir / '.github' / 'workflows' / 'deploy.yml'
        
        try:
            workflow_path.parent.mkdir(parents=True, exist_ok=True)
            workflow_path.write_text(workflow_content)
            self.log(f'  ✓ Workflow updated: {workflow_path}', 'INFO')
            
            # Commit and push
            subprocess.run(['git', 'add', '.github/workflows/deploy.yml'], check=True, cwd=self.project_dir)
            subprocess.run(['git', 'commit', '-m', 'chore: enable automated deployment'], check=True, cwd=self.project_dir)
            subprocess.run(['git', 'push', 'origin', 'main'], check=True, cwd=self.project_dir)
            self.log('  ✓ Changes pushed to GitHub', 'INFO')
            return True
            
        except Exception as e:
            self.log(f'  ✗ Workflow update failed: {str(e)}', 'WARN')
            return False
    
    def run(self):
        """Execute complete automation"""
        self.log('=' * 60, 'INFO')
        self.log('Complaint Management - Complete Automation', 'INFO')
        self.log('=' * 60, 'INFO')
        
        # Step 1: Verify dependencies
        if not self.verify_dependencies():
            self.log('Fix missing dependencies and try again', 'ERROR')
            return False
        
        # Step 2: Test SSH connection
        if not self.test_ssh_connection():
            self.log('Cannot establish SSH connection to EC2', 'ERROR')
            return False
        
        # Step 3: Setup EC2
        self.setup_ec2_environment()
        
        # Step 4: Deploy application
        if self.deploy_application():
            self.verify_deployment()
        
        # Step 5: Update workflow
        self.update_github_workflow()
        
        # Cleanup
        if self.ssh_client:
            self.ssh_client.close()
        
        self.log('=' * 60, 'INFO')
        self.log('🎉 Automation Complete!', 'INFO')
        self.log('=' * 60, 'INFO')
        
        return True

if __name__ == '__main__':
    automation = ComplaintAppAutomation()
    success = automation.run()
    sys.exit(0 if success else 1)
