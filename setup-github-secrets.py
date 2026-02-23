#!/usr/bin/env python3
"""
GitHub Secrets Automation Script
Automatically creates all CI/CD secrets in GitHub Actions
"""

import json
import urllib.request
import urllib.error
from nacl import encoding, public
from base64 import b64encode
import sys

def add_github_secret(token, repo, secret_name, secret_value):
    """Add a secret to GitHub repository"""
    try:
        # Get the public key for encryption
        headers = {
            'Authorization': f'token {token}',
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        }
        
        # Fetch public key
        pk_url = f'https://api.github.com/repos/{repo}/actions/secrets/public-key'
        req = urllib.request.Request(pk_url, headers=headers)
        
        try:
            with urllib.request.urlopen(req) as response:
                pk_data = json.loads(response.read())
        except urllib.error.HTTPError as e:
            print(f"❌ Failed to get public key: {e}")
            return False
        
        # Encrypt the secret
        pk = public.PublicKey(pk_data['key'], encoding.Base64Encoder)
        box = public.SealedBox(pk)
        
        if isinstance(secret_value, str):
            secret_value = secret_value.encode()
        
        encrypted = b64encode(box.encrypt(secret_value)).decode()
        
        # Create the secret
        payload = json.dumps({
            'encrypted_value': encrypted,
            'key_id': pk_data['key_id']
        }).encode()
        
        secret_url = f'https://api.github.com/repos/{repo}/actions/secrets/{secret_name}'
        req = urllib.request.Request(
            secret_url,
            data=payload,
            headers=headers,
            method='PUT'
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                status = response.status
                if status in [201, 204]:
                    print(f"✅ {secret_name}")
                    return True
                else:
                    print(f"⚠️  {secret_name} - Status: {status}")
                    return False
        except urllib.error.HTTPError as e:
            print(f"❌ {secret_name} failed: {e}")
            return False
            
    except Exception as e:
        print(f"❌ Error adding {secret_name}: {str(e)}")
        return False

def main():
    """Main function to add all GitHub secrets"""
    
    print("\n" + "="*60)
    print("GitHub Secrets Automation")
    print("="*60 + "\n")
    
    # Get inputs
    token = input("🔑 Enter GitHub Token (ghp_...): ").strip()
    if not token:
        print("❌ GitHub token is required")
        sys.exit(1)
    
    repo = input("📦 Enter Repository (owner/repo): ").strip()
    if not repo:
        print("❌ Repository is required")
        sys.exit(1)
    
    print("\n📋 Enter Secret Values (will be stored encrypted):\n")
    
    secrets = {}
    secrets['DOCKER_USERNAME'] = input("  DOCKER_USERNAME: ").strip()
    secrets['DOCKER_PASSWORD'] = input("  DOCKER_PASSWORD (token): ").strip()
    secrets['HOST'] = input("  HOST (EC2 IP): ").strip()
    secrets['USERNAME'] = input("  USERNAME (usually 'ubuntu'): ").strip() or 'ubuntu'
    
    print("\n  📄 SSH_PRIVATE_KEY (paste .pem content, type 'END' on new line when done):")
    ssh_lines = []
    while True:
        line = input()
        if line == 'END':
            break
        ssh_lines.append(line)
    secrets['SSH_PRIVATE_KEY'] = '\n'.join(ssh_lines)
    
    secrets['MONGODB_URI'] = input("  MONGODB_URI: ").strip()
    secrets['JWT_SECRET'] = input("  JWT_SECRET: ").strip()
    secrets['NEXTAUTH_SECRET'] = input("  NEXTAUTH_SECRET: ").strip()
    
    # Validate
    required = ['DOCKER_USERNAME', 'DOCKER_PASSWORD', 'HOST', 'USERNAME', 'SSH_PRIVATE_KEY', 'MONGODB_URI', 'JWT_SECRET', 'NEXTAUTH_SECRET']
    missing = [s for s in required if not secrets.get(s)]
    
    if missing:
        print(f"\n❌ Missing secrets: {', '.join(missing)}")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("🚀 Adding secrets to GitHub...")
    print("="*60 + "\n")
    
    success_count = 0
    for name, value in secrets.items():
        if add_github_secret(token, repo, name, value):
            success_count += 1
    
    print("\n" + "="*60)
    print(f"✅ Complete: {success_count}/{len(secrets)} secrets added")
    print("="*60 + "\n")
    
    if success_count == len(secrets):
        print("🎉 All secrets configured! Ready to deploy.\n")
        return 0
    else:
        print(f"⚠️  {len(secrets) - success_count} secrets failed. Check errors above.\n")
        return 1

if __name__ == '__main__':
    sys.exit(main())
