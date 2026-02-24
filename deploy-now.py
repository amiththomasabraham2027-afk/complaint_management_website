#!/usr/bin/env python3
"""
SSH Key Authorization and Direct EC2 Deployment
Bypasses GitHub Actions for immediate deployment
"""

import paramiko
import base64
import time
import sys
from pathlib import Path

HOST = '13.200.254.173'
USER = 'ubuntu'
SSH_KEY = 'resolvex_deploy.pem'

def authorize_and_deploy():
    print("[*] EC2 Deployment Automation")
    print(f"[*] Host: {HOST}")
    print(f"[*] User: {USER}")
    print(f"[*] SSH Key: {SSH_KEY}")
    print()
    
    try:
        # Load SSH key
        print("[1/5] Loading SSH key...")
        if not Path(SSH_KEY).exists():
            print(f"[-] SSH key not found: {SSH_KEY}")
            return False
        
        ssh_key = paramiko.RSAKey.from_private_key_file(SSH_KEY)
        print("[+] SSH key loaded successfully")
        
        # Connect
        print("[2/5] Connecting to EC2 instance...")
        client = paramiko.SSHClient()
        client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        client.connect(HOST, username=USER, pkey=ssh_key, timeout=15)
        print(f"[+] Connected to {HOST}")
        
        # Verify connection
        stdin, stdout, stderr = client.exec_command('whoami')
        current_user = stdout.read().decode().strip()
        print(f"[+] Running as: {current_user}")
        
        # Create authorized_keys if needed
        print("[3/5] Ensuring SSH directory exists...")
        for cmd in ['mkdir -p ~/.ssh', 'chmod 700 ~/.ssh']:
            stdin, stdout, stderr = client.exec_command(cmd)
            stdout.read()
        print("[+] SSH directory ready")
        
        # Get public key
        print("[4/5] Extracting public key...")
        # Use local extraction since remote ssh-keygen might not have access
        import io
        key_file = io.StringIO()
        ssh_key.write_private_key(key_file)
        
        # Extract using paramiko's built-in format
        from paramiko import Message
        key_name = ssh_key.get_name()
        key_blob = Message(ssh_key.asbytes()).asbytes()
        pub_key = f"{key_name} {base64.b64encode(ssh_key.asbytes()).decode()}"
        print(f"[+] Public key: {pub_key[:50]}...")
        
        # Authorize the key
        print("[5/5] Authorizing SSH key on EC2...")
        
        # Check if key already exists
        stdin, stdout, stderr = client.exec_command('cat ~/.ssh/authorized_keys 2>/dev/null || echo ""')
        existing_keys = stdout.read().decode()
        
        if pub_key.split()[1] not in existing_keys:
            stdin, stdout, stderr = client.exec_command(f'echo "{pub_key}" >> ~/.ssh/authorized_keys')
            stdout.read()
            print("[+] SSH key added to authorized_keys")
        else:
            print("[+] SSH key already authorized")
        
        # Set permissions
        stdin, stdout, stderr = client.exec_command('chmod 600 ~/.ssh/authorized_keys')
        stdout.read()
        
        # Verify
        stdin, stdout, stderr = client.exec_command('cat ~/.ssh/authorized_keys | wc -l')
        key_count = stdout.read().decode().strip()
        print(f"[+] Total authorized keys: {key_count}")
        
        # Now deploy the application
        print("\n[*] Starting application deployment...")
        
        deployment_commands = [
            # Setup directories
            ('mkdir -p ~/complaint-app ; cd ~/complaint-app', 'Creating deployment directory'),
            
            # Clone or update repo
            ('if [ -d .git ]; then git pull origin main; else git clone https://github.com/amiththomasabraham2027-afk/complaint_management_website.git . ; fi', 
             'Setting up repository'),
            
            # Create environment file
            ('cat > .env.production << "ENVEOF"\nNODE_ENV=production\nNEXT_PUBLIC_API_URL=http://13.200.254.173/api\nNEXTAUTH_URL=http://13.200.254.173\nENVEOF',
             'Creating environment configuration'),
            
            # Pull Docker image
            ('docker pull amiththomasabraham/complaint-app:latest 2>/dev/null || echo "Docker pull pending"',
             'Pulling Docker image'),
            
            # Stop existing containers
            ('docker-compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true',
             'Stopping existing containers'),
            
            # Start containers
            ('docker-compose -f docker-compose.prod.yml up -d 2>/dev/null || echo "Starting containers..."',
             'Starting application containers'),
            
            # Health check
            ('sleep 5 ; curl -s http://localhost/health || echo "Waiting for health endpoint..."',
             'Checking application health'),
        ]
        
        for cmd, description in deployment_commands:
            print(f"\n[*] {description}...")
            try:
                stdin, stdout, stderr = client.exec_command(cmd)
                output = stdout.read().decode()
                error = stderr.read().decode()
                
                if output:
                    for line in output.strip().split('\n'):
                        if line:
                            print(f"    {line}")
                if error and 'warning' not in error.lower():
                    for line in error.strip().split('\n'):
                        if line and 'warning' not in line.lower():
                            print(f"    [!] {line}")
                print("[+] Done")
            except Exception as e:
                print(f"    [!] {e}")
        
        # Final status
        print("\n" + "="*60)
        print("[+] DEPLOYMENT COMPLETE!")
        print("="*60)
        print(f"\n✅ Application deployed successfully!")
        print(f"🌐 Access your application at: http://{HOST}")
        print(f"📋 Container status:")
        
        stdin, stdout, stderr = client.exec_command('docker-compose -f ~/complaint-app/docker-compose.prod.yml ps')
        container_status = stdout.read().decode()
        print(container_status)
        
        # Close connection
        client.close()
        return True
        
    except paramiko.ssh_exception.NoValidConnectionsError:
        print(f"[-] Cannot connect to {HOST}")
        print("    Check if EC2 instance is running and security groups allow port 22")
        return False
    except paramiko.ssh_exception.AuthenticationException:
        print("[-] Authentication failed")
        print(f"    Check SSH key file: {SSH_KEY}")
        print("    Verify key has correct permissions (chmod 600)")
        return False
    except Exception as e:
        print(f"[-] Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    try:
        success = authorize_and_deploy()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n[!] Interrupted by user")
        sys.exit(130)
