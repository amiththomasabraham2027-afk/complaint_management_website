# ✅ Automation Setup Checklist

## Pre-Automation Setup (Get these ready FIRST)

### AWS EC2
- [ ] EC2 instance is **running** (Ubuntu 22.04 or later)
- [ ] **EC2 Public IP** noted (e.g., `13.201.87.43`)
- [ ] **SSH key (.pem file)** saved locally (e.g., `C:\Users\YourName\Downloads\key.pem`)
- [ ] Security Group opened:
  - [ ] Port 22 (SSH) - for automation
  - [ ] Port 80 (HTTP) - for app access
  - [ ] Port 443 (HTTPS) - optional

### Docker Hub
- [ ] Docker Hub **account created** (https://hub.docker.com)
- [ ] Docker Hub **username** noted
- [ ] Docker Hub **access token generated** (Account → Settings → Security → Personal Access Tokens)
- [ ] Access token **copied and saved** (shown only once!)

### GitHub
- [ ] GitHub **personal token generated** (Settings → Developer settings → Personal access tokens)
- [ ] Token has **repo** and **workflow** permissions
- [ ] Token is **saved securely**

### Secrets & Credentials
- [ ] **MongoDB URI** (connection string from Atlas or DocumentDB)
- [ ] **JWT Secret** (32+ characters, generated)
- [ ] **NextAuth Secret** (32+ characters, generated)

---

## Automation Execution (Run these in order)

### 1️⃣ Run Master Orchestrator

**Open PowerShell in project directory:**

```powershell
cd "e:\DevOps Nest\Complaint-management-web"
python deploy-orchestrator.py
```

**The script will ask for:**
- [ ] EC2 IP address
- [ ] SSH key path (full path to .pem file)
- [ ] Docker Hub username
- [ ] Docker Hub access token
- [ ] GitHub token
- [ ] GitHub repository (owner/repo)
- [ ] MongoDB URI
- [ ] JWT secret
- [ ] NextAuth secret

**Script does:**
- ✅ Validates local tools (Git, Docker, Python)
- ✅ Copies setup script to EC2
- ✅ Runs Docker installation on EC2 (takes ~5 min)
- ✅ Saves configuration to `.deployment-config.json`

**Expected output:**
```
✓ Docker: docker-ce installed
✓ Docker Compose: plugin installed
✓ Setup complete
```

---

### 2️⃣ Add GitHub Secrets

**Run the secrets automation script:**

```powershell
python setup-github-secrets.py
```

**The script will ask for:**
- [ ] GitHub Token
- [ ] Repository (owner/repo)
- [ ] Docker username
- [ ] Docker password (token)
- [ ] EC2 IP
- [ ] EC2 username
- [ ] SSH private key (paste .pem content, type END when done)
- [ ] MongoDB URI
- [ ] JWT secret
- [ ] NextAuth secret

**Expected output:**
```
✓ DOCKER_USERNAME
✓ DOCKER_PASSWORD
✓ HOST
✓ USERNAME
✓ SSH_PRIVATE_KEY
✓ MONGODB_URI
✓ JWT_SECRET
✓ NEXTAUTH_SECRET

✅ Complete: 8/8 secrets added
```

**Verify on GitHub:**
1. Go to repo → **Settings** → **Secrets and variables** → **Actions**
2. Should see all 8 secrets listed (values hidden with ••••)

---

### 3️⃣ Push Code to GitHub

```bash
git add .
git commit -m "Setup full CI/CD automation with Docker"
git push origin main
```

**Expected:**
- Code pushed to GitHub
- GitHub Actions workflow is **triggered**

---

## Verification (Confirm everything works)

### ✅ Check GitHub Actions

1. Go to **GitHub → Actions tab**
2. Click the latest run: **"Setup full CI/CD automation..."**
3. Wait for status:

**Good signs:**
- ✅ "Build Docker Image & Push" = Green
- ✅ "Deploy to AWS EC2" = Green  
- ✅ Takes ~5-10 minutes total

**Bad signs:**
- ❌ Red X = Failed (check logs)
- 🟡 Spinning = Still running (wait more)

### ✅ Check EC2 Containers

**SSH into EC2:**

```bash
ssh -i "path\to\key.pem" ubuntu@YOUR_EC2_IP
docker ps
```

**Good signs:**
```
CONTAINER ID   IMAGE                STATUS        NAMES
abc123...      complaint-app:latest Up 2 minutes  complaint-app
def456...      nginx:alpine         Up 2 minutes  complaint-nginx
```

**Bad signs:**
- No containers running: Check workflow logs
- Containers exited: Run `docker logs complaint-app`

### ✅ Check Application

**Open browser:**

```
http://YOUR_EC2_IP
```

**Good signs:**
- ✅ App loads successfully
- ✅ No "connection refused" error
- ✅ Can navigate pages

**Bad signs:**
- ❌ Connection refused = Port 80 not open in security group
- ❌ Error page = App crashed (check logs)

---

## Post-Automation

### Daily Workflow (Deploy Changes)

```bash
# Make code changes...
# ... edit files ...

# Deploy (3 steps)
git add .
git commit -m "Your change description"
git push origin main

# Wait 3-5 minutes for auto-deployment
# App updates automatically!
```

### Monitor Deployments

**Via GitHub:**
- Go to **Actions tab**
- Click latest workflow run
- Watch progress in real-time

**Via EC2:**
```bash
ssh -i key.pem ubuntu@YOUR_EC2_IP
docker logs complaint-app -f    # Follow logs (Ctrl+C to exit)
docker-compose -f docker-compose.prod.yml ps
```

---

## Troubleshooting

### ❌ "SSH connection failed"
```powershell
# Check SSH key exists
Test-Path "C:\path\to\key.pem"

# Check EC2 IP is correct
ping YOUR_EC2_IP
```

### ❌ "Docker not installed"
SSH to EC2 and run manually:
```bash
bash ~/ec2-setup.sh
```

### ❌ "GitHub Actions fails"
Check workflow logs:
1. GitHub → Actions
2. Click failed run
3. Expand "Deploy" step
4. Read error message

**Common causes:**
- Docker Hub password is account password (use token instead)
- EC2 IP is wrong
- SSH key is corrupted

### ❌ "App not accessible at http://EC2_IP"
```bash
# Check security group
# AWS Console → EC2 → Your instance → Security tab
# Make sure port 80 is open to 0.0.0.0/0

# Check containers
ssh -i key.pem ubuntu@YOUR_EC2_IP "docker ps"

# Check app logs
ssh -i key.pem ubuntu@YOUR_EC2_IP "docker logs complaint-app"
```

---

## Success Indicators

### ✅ Full Automation Complete When:

- [ ] EC2 has Docker installed (`docker --version` works)
- [ ] GitHub has 8 secrets (repo → Settings → Secrets)
- [ ] GitHub Actions workflow ran and turned ✅ green
- [ ] EC2 has 2 containers running (`docker ps`)
- [ ] App accessible at `http://YOUR_EC2_IP`
- [ ] Next push auto-deploys within 5 minutes

### 🎉 You've Successfully Automated CI/CD!

---

## Quick Command Reference

```sh
# Orchestration
python deploy-orchestrator.py          # Run if first time
python setup-github-secrets.py         # Add/update GitHub secrets

# Git deployment
git push origin main                    # Triggers auto-deployment

# Monitor EC2
ssh -i key.pem ubuntu@IP "docker ps"  # Check containers
ssh -i key.pem ubuntu@IP "docker logs complaint-app -f"  # View logs

# Manual EC2 setup (if needed)
scp -i key.pem ec2-setup.sh ubuntu@IP:~/
ssh -i key.pem ubuntu@IP "bash ~/ec2-setup.sh"
```

---

**Need help?** Check [AUTOMATION_GUIDE.md](AUTOMATION_GUIDE.md) for detailed instructions.

**Ready?** Start with: `python deploy-orchestrator.py` 🚀
