# 🤖 Automated Deployment Scripts

Complete automated deployment: GitHub Secrets → EC2 Setup → Docker Deployment

## Quick Start (Choose Your OS)

### macOS/Linux
```bash
# 1. Set up secrets (interactive)
chmod +x setup-secrets.sh
./setup-secrets.sh

# 2. Load environment
source .env.local

# 3. Deploy
pip install boto3 paramiko  # (first time only)
python auto_deploy.py

# 4. Monitor
python monitor_deployment.py watch 60
```

### Windows (PowerShell)
```powershell
# 1. Set up secrets (interactive)
.\setup-secrets.ps1

# 2. Load environment
. .\env.local

# 3. Deploy
pip install boto3 paramiko  # (if not installed)
python auto_deploy.py

# 4. Monitor
python monitor_deployment.py watch 60
```

## Scripts Included

| Script | Purpose | OS |
|--------|---------|-----|
| `setup-secrets.sh` | Interactive secret configuration | macOS/Linux |
| `setup-secrets.ps1` | Interactive secret configuration | Windows |
| `auto_deploy.py` | Full automated deployment | All |
| `monitor_deployment.py` | Real-time monitoring | All |

## Configuration

Secrets are read from:
1. **Environment variables** (for CI/CD)
2. **.env.local** file (for local development)
3. **GitHub Secrets** (for actual deployment)

### Required Environment Variables
```bash
export GITHUB_TOKEN='ghp_...'
export MONGODB_URI='mongodb+srv://...'
export JWT_SECRET='...'
export NEXTAUTH_SECRET='...'
```

### Example .env.local
```bash
export GITHUB_TOKEN='ghp_xyz123'
export MONGODB_URI='mongodb+srv://user:pass@host/db'
export JWT_SECRET='random_32_chars_here'
export NEXTAUTH_SECRET='random_32_chars_here'
export AWS_REGION='ap-south-1'
```

## What Gets Deployed

### 1️⃣ GitHub Secrets Setup
- SSH_PRIVATE_KEY (from Complaint_manage.pem)
- SERVER_HOST (13.200.254.173)
- SERVER_USER (ubuntu)
- MONGODB_URI
- JWT_SECRET
- NEXTAUTH_SECRET

### 2️⃣ EC2 Instance Setup
✅ Docker & Docker Compose  
✅ Git, curl, wget, htop  
✅ UFW Firewall (ports 22, 80, 443)  
✅ 2GB Swap space  
✅ Application directories  

### 3️⃣ Application Deployment
✅ Clone/pull repository  
✅ Build Docker image  
✅ Start containers (MongoDB, Next.js, Nginx)  
✅ Verify health checks  
✅ Configure GitHub Actions  

### 4️⃣ Post-Deployment Monitoring
✅ Check application response  
✅ Verify container status  
✅ Monitor GitHub Actions  
✅ View real-time logs  

## Security

🔒 **No hardcoded secrets in code**
- Secrets stored in environment variables only
- GitHub Push Protection detects leaked credentials
- .env.local is in .gitignore

🔒 **Best practices**
- Use strong generated secrets (32+ characters)
- Rotate secrets monthly
- Use GitHub Secrets for CI/CD
- SSH key-based authentication only
- Non-root Docker user

## Monitoring

### Single Health Check
```bash
python monitor_deployment.py
```

### Continuous Monitoring (60 minutes)
```bash
python monitor_deployment.py watch 60
```

### View Recent Logs
```bash
python monitor_deployment.py logs 50
```

## Troubleshooting

### Missing Secrets
```bash
# Set environment variables
source .env.local

# Or run setup again
./setup-secrets.sh
```

### SSH Connection Failed
```bash
# Check key permissions
chmod 600 Complaint_manage.pem

# Test manually
ssh -i Complaint_manage.pem ubuntu@13.200.254.173
```

### Docker Not Installed on EC2
```bash
# Re-run EC2 setup
python auto_deploy.py  # Will retry if failed
```

### Application Won't Start
```bash
# Check logs
ssh -i Complaint_manage.pem ubuntu@13.200.254.173 \
  'cd ~/complaint-app && docker-compose logs'
```

## Next Steps After Deployment

1. **Access Application**
   ```
   http://13.200.254.173:3000
   ```

2. **Set Up Domain** (optional)
   - Point DNS to EC2 IP
   - Install SSL certificate
   - Update NEXTAUTH_URL

3. **Enable GitHub Actions**
   - Secrets are configured ✓
   - Push to `main` branch triggers auto-deployment
   - Monitor at: github.com/repo/actions

4. **Continue Monitoring**
   ```bash
   python monitor_deployment.py watch 120
   ```

## Key Files

- **auto_deploy.py** - Main deployment script (Python)
- **setup-secrets.sh/.ps1** - Secure secret setup (bash/PowerShell)
- **monitor_deployment.py** - Health check & monitoring
- **.env.local** - Local secrets (created, in .gitignore)

## Support

For detailed guides, see:
- `DEPLOYMENT_QUICK_START.md` - Quick reference
- `DOCKER_DEPLOYMENT.md` - Comprehensive guide
- `GITHUB_SECRETS_SETUP.md` - Secrets setup details
- `AUTOMATION_README.md` - This file

---

**Ready?** Start with: `./setup-secrets.sh` then `source .env.local` then `python auto_deploy.py`
