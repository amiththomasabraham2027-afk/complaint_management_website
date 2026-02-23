#!/usr/bin/env python3
"""
Master Deployment Orchestration Script
Automates the entire CI/CD pipeline setup for Complaint Management App
"""

import os
import sys
import subprocess
import json
from pathlib import Path

class DeploymentOrchestrator:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.config_file = self.project_root / '.deployment-config.json'
        self.config = self.load_config()
    
    def load_config(self):
        """Load deployment configuration"""
        if self.config_file.exists():
            with open(self.config_file) as f:
                return json.load(f)
        return {}
    
    def save_config(self):
        """Save deployment configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def print_header(self, title):
        """Print section header"""
        print("\n" + "="*60)
        print(f"  {title}")
        print("="*60 + "\n")
    
    def print_step(self, message):
        """Print step message"""
        print(f"→ {message}")
    
    def print_success(self, message):
        """Print success message"""
        print(f"✓ {message}")
    
    def print_error(self, message):
        """Print error message"""
        print(f"✗ {message}")
    
    def run_command(self, cmd, description=""):
        """Run shell command"""
        if description:
            self.print_step(description)
        
        try:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode != 0:
                self.print_error(f"Command failed: {result.stderr}")
                return False
            return True
        except Exception as e:
            self.print_error(f"Error: {str(e)}")
            return False
    
    def get_input(self, prompt, default=""):
        """Get user input with optional default"""
        if default:
            prompt = f"{prompt} [{default}]: "
        else:
            prompt = f"{prompt}: "
        
        value = input(prompt).strip()
        return value or default
    
    # =========================================================
    # Main Orchestration Steps
    # =========================================================
    
    def step1_validate_environment(self):
        """Step 1: Validate local environment"""
        self.print_header("Step 1: Validating Environment")
        
        checks = {
            'Git': 'git --version',
            'Docker': 'docker --version',
            'Docker Compose': 'docker compose version',
            'Python': 'python --version'
        }
        
        all_ok = True
        for name, cmd in checks.items():
            if self.run_command(cmd):
                self.print_success(f"{name} is installed")
            else:
                self.print_error(f"{name} is NOT installed")
                all_ok = False
        
        return all_ok
    
    def step2_collect_configuration(self):
        """Step 2: Collect configuration from user"""
        self.print_header("Step 2: Configuration Setup")
        
        self.print_step("Enter your AWS EC2 details:")
        self.config['ec2_ip'] = self.get_input("  EC2 Public IP")
        self.config['ec2_user'] = self.get_input("  EC2 Username", "ubuntu")
        self.config['ssh_key_path'] = self.get_input("  SSH Key Path (.pem file)")
        
        self.print_step("Enter Docker Hub credentials:")
        self.config['docker_username'] = self.get_input("  Docker Hub Username")
        self.config['docker_password'] = self.get_input("  Docker Hub Access Token")
        
        self.print_step("Enter GitHub details:")
        self.config['github_token'] = self.get_input("  GitHub Personal Token")
        self.config['github_repo'] = self.get_input("  GitHub Repository (owner/repo)")
        
        self.print_step("Enter application secrets:")
        self.config['mongodb_uri'] = self.get_input("  MongoDB URI")
        self.config['jwt_secret'] = self.get_input("  JWT Secret")
        self.config['nextauth_secret'] = self.get_input("  NextAuth Secret")
        
        self.save_config()
        self.print_success("Configuration saved")
    
    def step3_setup_ec2(self):
        """Step 3: Setup EC2 instance"""
        self.print_header("Step 3: EC2 Setup")
        
        if not self.config.get('ec2_ip'):
            self.print_error("EC2 IP not configured")
            return False
        
        ec2_ip = self.config['ec2_ip']
        ssh_key = self.config['ssh_key_path']
        
        # Copy setup script to EC2
        self.print_step("Copying setup script to EC2...")
        setup_script = self.project_root / 'ec2-setup.sh'
        
        cmd = f'scp -i "{ssh_key}" -o StrictHostKeyChecking=no "{setup_script}" ubuntu@{ec2_ip}:~/ec2-setup.sh'
        if not self.run_command(cmd):
            return False
        
        # Execute setup script
        self.print_step("Running setup script on EC2 (this takes ~5 minutes)...")
        cmd = f'ssh -i "{ssh_key}" -o StrictHostKeyChecking=no ubuntu@{ec2_ip} "bash ~/ec2-setup.sh"'
        
        if not self.run_command(cmd):
            return False
        
        self.print_success("EC2 setup complete")
        return True
    
    def step4_configure_github_secrets(self):
        """Step 4: Configure GitHub secrets"""
        self.print_header("Step 4: GitHub Secrets Configuration")
        
        if not all(self.config.get(k) for k in ['github_token', 'github_repo']):
            self.print_error("GitHub configuration incomplete")
            return False
        
        # Create secrets mapping
        secrets = {
            'DOCKER_USERNAME': self.config['docker_username'],
            'DOCKER_PASSWORD': self.config['docker_password'],
            'HOST': self.config['ec2_ip'],
            'USERNAME': self.config['ec2_user'],
            'SSH_PRIVATE_KEY': self._read_ssh_key(),
            'MONGODB_URI': self.config['mongodb_uri'],
            'JWT_SECRET': self.config['jwt_secret'],
            'NEXTAUTH_SECRET': self.config['nextauth_secret']
        }
        
        # Write secrets to temporary file
        secrets_file = self.project_root / '.temp-secrets.json'
        with open(secrets_file, 'w') as f:
            json.dump(secrets, f)
        
        self.print_success("Secrets prepared (use setup-github-secrets.py to add them)")
        
        # Clean up
        secrets_file.unlink()
        return True
    
    def step5_git_configuration(self):
        """Step 5: Configure Git and push code"""
        self.print_header("Step 5: Git Configuration")
        
        # Check if .env.deployment needs to be created
        env_file = self.project_root / '.env.deployment'
        if not env_file.exists():
            self.print_step("Creating .env.deployment...")
            content = f"""# Deployment Configuration
EC2_HOST={self.config.get('ec2_ip')}
EC2_USER={self.config.get('ec2_user')}
GITHUB_REPO={self.config.get('github_repo')}
DEPLOYMENT_DATE={__import__('datetime').datetime.now().isoformat()}
"""
            with open(env_file, 'w') as f:
                f.write(content)
            self.print_success(".env.deployment created")
        
        # Add to git
        self.print_step("Adding files to Git...")
        commands = [
            ('git add .', "Staging files"),
            ('git status', "Checking status"),
        ]
        
        for cmd, desc in commands:
            self.run_command(cmd, desc)
        
        return True
    
    def step6_summary_and_next_steps(self):
        """Step 6: Display summary"""
        self.print_header("✅ Automation Complete!")
        
        print("📋 Configuration Summary:")
        print(f"   EC2 Instance: ubuntu@{self.config.get('ec2_ip')}")
        print(f"   GitHub Repo: {self.config.get('github_repo')}")
        print(f"   Docker Username: {self.config.get('docker_username')}")
        print()
        
        print("🚀 Next Steps:")
        print("   1. Run: python setup-github-secrets.py")
        print("   2. Run: git commit -m 'Setup CI/CD automation'")
        print("   3. Run: git push origin main")
        print("   4. Watch GitHub Actions for deployment")
        print(f"   5. Access app at: http://{self.config.get('ec2_ip')}")
        print()
        
        print("📊 Configuration saved to: .deployment-config.json")
        print()
    
    def _read_ssh_key(self):
        """Read SSH private key from file"""
        key_path = self.config.get('ssh_key_path')
        if key_path and Path(key_path).exists():
            with open(key_path) as f:
                return f.read()
        return ""
    
    def run(self):
        """Run the complete orchestration"""
        print("\n" + "="*60)
        print("  Complaint Management App - Deployment Orchestration")
        print("="*60)
        
        try:
            # Step 1: Validate
            if not self.step1_validate_environment():
                print("\n⚠️  Some tools are missing. Install them and try again.")
                return False
            
            # Step 2: Configuration
            self.step2_collect_configuration()
            
            # Step 3: EC2 Setup
            if not self.step3_setup_ec2():
                print("\n❌ EC2 setup failed")
                return False
            
            # Step 4: GitHub Secrets
            if not self.step4_configure_github_secrets():
                print("\n⚠️  GitHub secrets configuration incomplete")
            
            # Step 5: Git Setup
            self.step5_git_configuration()
            
            # Step 6: Summary
            self.step6_summary_and_next_steps()
            
            return True
            
        except KeyboardInterrupt:
            print("\n\n❌ Setup cancelled by user")
            return False
        except Exception as e:
            print(f"\n❌ Error: {str(e)}")
            return False

def main():
    """Main entry point"""
    orchestrator = DeploymentOrchestrator()
    success = orchestrator.run()
    sys.exit(0 if success else 1)

if __name__ == '__main__':
    main()
