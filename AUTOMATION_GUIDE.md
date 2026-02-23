# 🤖 Full Automation Guide - CI/CD for Complaint Management App

## Overview

This guide uses **automated scripts** to eliminate manual setup steps. Everything is orchestrated through:

- **Python scripts** for GitHub API automation
- **PowerShell scripts** for AWS EC2 management  
- **Bash scripts** for EC2 Docker setup
- **GitHub Actions** for CI/CD pipeline

---

## ⚡ Quick Start (5 Steps)

### Step 1: Run Orchestration Script (Local Machine)

```powershell
cd "e:\DevOps Nest\Complaint-management-web"
python deploy-orchestrator.py
```

This interactive script will:
- ✅ Validate your local environment
- ✅ Collect EC2 and credentials info
- ✅ Deploy EC2 setup script
- ✅ Configure GitHub
- ✅ Prepare for deployment

**Input Required:**
- EC2 Public IP
- EC2 SSH Key path (.pem file)
- Docker Hub username & token
- GitHub token & repository
- MongoDB URI
- JWT & NextAuth secrets

### Step 2: Add GitHub Secrets

```python
python setup-github-secrets.py
```

This script:
- ✅ Takes your secrets as input
- ✅ Encrypts them securely
- ✅ Adds them to GitHub Actions via API
- ✅ NO secrets left in files

### Step 3: Push Code to GitHub

```bash
git add .
git commit -m "Setup full CI/CD automation"
git push origin main
```

### Step 4: Watch GitHub Actions

1. Go to GitHub repo → **Actions** tab
2. Watch the workflow: **"Deploy Complaint App to AWS EC2"**
3. It will:
   - 🔨 Build Docker image
   - 📤 Push to Docker Hub
   - 🚀 Deploy to EC2
   - ✅ Start containers
   - 🌐 Make app live

### Step 5: Access Your App

Open browser → `http://YOUR_EC2_IP`

```
✨ Your app is now live and auto-updating with every push! ✨
```

---

## 📋 What Each Script Does

### `deploy-orchestrator.py` (Master Orchestration)
**Purpose:** Automates the entire setup process  
**What it does:**
1. Validates local environment (Git, Docker, Python)
2. Collects configuration interactively
3. Copies EC2 setup script via SCP
4. Executes Docker installation on EC2
5. Prepares GitHub secrets configuration
6. Sets up Git for deployment
7. Displays next steps

**When to use:**  
First time setup - run this one script and it handles everything!

**Run:**
```powershell
python deploy-orchestrator.py
```

---

### `setup-github-secrets.py` (GitHub Secrets Automation)
**Purpose:** Add all 8 secrets to GitHub via API  
**What it does:**
1. Takes credentials as input (interactive)
2. Encrypts each secret
3. Uses GitHub REST API to create secrets
4. Shows which ones succeeded/failed

**Secrets added:**
- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`
- `HOST` (EC2 IP)
- `USERNAME` (ubuntu)
- `SSH_PRIVATE_KEY` (.pem contents)
- `MONGODB_URI`
- `JWT_SECRET`
- `NEXTAUTH_SECRET`

**When to use:**  
After orchestrator completes, or to update individual secrets

**Run:**
```powershell
python setup-github-secrets.py
```

**Important:** Input is prompted interactively. For SSH key, paste the full .pem content and type `END` on a new line.

---

### `setup-aws-automation.ps1` (AWS EC2 PowerShell Helper)
**Purpose:** Alternative to orchestrator for manual EC2 setup  
**What it does:**
1. Tests SSH connection to EC2
2. Copies Docker setup script
3. Executes remote setup
4. Verifies Docker installation
5. Offers to add GitHub secrets

**When to use:**  
If you prefer PowerShell or need to re-run setup on an existing instance

**Run:**
```powershell
.\setup-aws-automation.ps1 -EC2PublicIP "13.201.87.43" -SSHKeyPath "C:\path\to\key.pem"
```

---

### `ec2-setup.sh` (EC2 Docker Installation)
**Purpose:** Fully automate Docker setup on EC2  
**What it does:**
1. Updates system packages
2. Installs Docker Engine
3. Installs Docker Compose plugin
4. Configures docker user group
5. Sets up logging
6. Verifies installation

**When to use:**  
Either automated via orchestrator or manual SSH:

**Run manually on EC2:**
```bash
bash ~/ec2-setup.sh
```

---

## 🔐 Security Considerations

### ✅ What's Protected
- ✓ SSH keys stored ONLY in GitHub encrypted secrets
- ✓ Credentials stored ONLY in GitHub, not in files
- ✓ `.pem` files in `.gitignore`
- ✓ All secrets encrypted in config files
- ✓ No hardcoded credentials in code

### ✅ Best Practices
- Never commit `.deployment-config.json` (in .gitignore)
- Delete local `.pem` files after adding to GitHub
- Use GitHub personal tokens, not account passwords
- Regenerate secrets if using public computers
- Audit GitHub secrets regularly

---

## 🔄 Workflow After Automation

### Every Day: Deploy Code Changes

```bash
# Make changes locally
# ... edit files ...

# Deploy (3 commands!)
git add .
git commit -m "Your changes"
git push origin main

# → GitHub Actions automatically deploys (3-5 minutes)
# → App updates live
```

### Monitor Deployments

1. **GitHub Actions:**
   ```
   GitHub → Actions tab → Latest run → Watch progress
   ```

2. **EC2 Logs:**
   ```bash
   ssh -i key.pem ubuntu@YOUR_EC2_IP
   docker logs complaint-app -f
   docker logs complaint-nginx -f
   docker ps
   ```

3. **Application Health:**
   ```
   http://YOUR_EC2_IP/health → Should return "healthy"
   ```

---

## 🐛 Troubleshooting Automation

### "SSH connection failed"
```powershell
# Verify key permissions
icacls "C:\path\to\key.pem"

# Should be readable. If not:
# Right-click → Properties → Security → Advanced → Remove inheritance → Apply
```

### "Docker not installed"
```bash
# SSH to EC2 and check
ssh -i key.pem ubuntu@YOUR_EC2_IP
docker --version  # Should work

# If not, run manually:
bash ~/ec2-setup.sh
```

### "GitHub secrets not added"
```powershell
# Check:
# 1. GitHub token is valid
# 2. Repository URL is correct (owner/repo)
# 3. You have admin access to repo

# Then try again:
python setup-github-secrets.py
```

### "Workflow fails at build step"
Check GitHub Actions logs:
1. GitHub → Actions → [Failed run] → Build step
2. Look for Docker Hub login error
3. Verify `DOCKER_PASSWORD` is an **access token**, not password

---

## 📊 Automation Architecture

```plaintext
Your Code
    ↓
git push origin main
    ↓
GitHub (Repository)
    ↓
GitHub Actions Workflow (.github/workflows/deploy.yml)
    ├─ Build Step
    │  ├─ Build Docker image from Dockerfile
    │  └─ Push to Docker Hub (uses DOCKER_USERNAME + DOCKER_PASSWORD)
    ├─ Deploy Step
    │  ├─ SSH into EC2 (uses HOST, USERNAME, SSH_PRIVATE_KEY)
    │  ├─ Pull Docker image
    │  └─ Run: docker-compose -f docker-compose.prod.yml up -d
    └─ ✅ Complete
    ↓
EC2 Instance
    ├─ Nginx Container (port 80)
    │  └─ Reverse proxy to app
    ├─ App Container (port 3000)
    │  └─ Connected to MongoDB (external)
    └─ Containers running
    ↓
User Browser
    └─ http://YOUR_EC2_IP ✨ Live!
```

---

## 📝 Configuration Files

| File | Purpose | Gitignored? |
|------|---------|-------------|
| `.deployment-config.json` | Stores all configuration | ✓ Yes |
| `setup-github-secrets.py` | Adds secrets to GitHub | ✗ No (executable) |
| `setup-aws-automation.ps1` | AWS PowerShell automation | ✗ No (executable) |
| `deploy-orchestrator.py` | Master orchestration | ✗ No (executable) |
| `ec2-setup.sh` | EC2 Docker setup | ✗ No (executable) |
| `.github/workflows/deploy.yml` | CI/CD pipeline | ✗ No (pipeline) |

---

## 🎯 Checklist

### Pre-Automation
- [ ] EC2 instance launched
- [ ] EC2 security group opened (port 80, 443, 22)
- [ ] EC2 public IP noted
- [ ] SSH .pem key downloaded locally
- [ ] Docker Hub account created
- [ ] Docker Hub access token generated
- [ ] GitHub token generated
- [ ] MongoDB URI ready (Atlas or DocumentDB)
- [ ] JWT and NextAuth secrets generated

### During Automation
- [ ] Run `python deploy-orchestrator.py`
- [ ] EC2 setup script runs successfully
- [ ] Run `python setup-github-secrets.py`
- [ ] All 8 secrets added to GitHub
- [ ] Git changes committed and pushed

### After Automation
- [ ] GitHub Actions workflow runs (green ✅)
- [ ] Containers running on EC2 (`docker ps` shows 2 containers)
- [ ] App accessible at `http://YOUR_EC2_IP`
- [ ] Logs clean (`docker logs complaint-app`)

---

## 🚀 You're Done!

From now on, every time you:

```bash
git push origin main
```

Your app **automatically deploys** to AWS EC2 within 3-5 minutes. 

No manual steps. No SSH commands. No waiting. 

**Pure automation.** 🎉

---

## 📞 Need Help?

### Quick Reference
- Full setup guide: `CI_CD_SETUP_GUIDE.md`
- Secrets reference: `GITHUB_SECRETS_REFERENCE.md`
- Quick start: `CI_CD_QUICK_START.md`

### Debug Commands
```bash
# Check EC2 status
ssh -i key.pem ubuntu@YOUR_EC2_IP "docker ps"

# View app logs
ssh -i key.pem ubuntu@YOUR_EC2_IP "docker logs complaint-app -f"

# View GitHub Actions
GitHub → Repo → Actions tab → Latest run

# SSH directly to EC2
ssh -i "path/to/key.pem" ubuntu@YOUR_EC2_IP
```

---

**Happy deploying!** ✨
