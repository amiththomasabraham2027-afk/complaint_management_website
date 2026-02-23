# CI/CD Pipeline Setup — Complaint Management Web App

## 📋 Complete Step-by-Step Guide

This guide walks you through setting up automatic deployment of your Complaint Management Web App to AWS EC2 whenever you push code to GitHub.

---

## ⚙️ What You'll Have After This

✅ Push code to GitHub → Automatic build & deployment to AWS EC2
✅ Nginx reverse proxy on port 80
✅ Docker containers for app + Nginx
✅ MongoDB external (Atlas or AWS DocumentDB)
✅ Health checks + automatic rollback on failure

---

## 🔧 Architecture

```
GitHub (Code)
    ↓
GitHub Actions (Build & Push Docker image)
    ↓
Docker Hub (Store image)
    ↓
AWS EC2 (SSH, pull image, start containers)
    ↓
Nginx (Port 80) → Next.js App (Port 3000)
    ↓
MongoDB (External - Atlas or DocumentDB)
```

---

## 📑 Table of Contents

1. [Step 1: AWS EC2 Setup](#step-1-aws-ec2-setup)
2. [Step 2: Docker Hub Setup](#step-2-docker-hub-setup)
3. [Step 3: GitHub Secrets](#step-3-github-secrets)
4. [Step 4: Trigger Pipeline](#step-4-trigger-pipeline)
5. [Step 5: Verification](#step-5-verification)
6. [Step 6: Future Deployments](#step-6-future-deployments)

---

## Step 1: AWS EC2 Setup

### 1.1 Launch EC2 Instance

**On AWS Console:**

1. Go to **EC2 → Instances → Launch Instance**
2. Choose **Ubuntu 22.04 LTS** AMI
3. Instance Type: **t2.micro** (free tier eligible)
4. Create or select a **Key Pair** (`.pem` file) — **SAVE THIS FILE LOCALLY**
5. Click **Launch**

**After launch, note:**
- **Instance ID**: `i-xxxxx`
- **Public IPv4 address**: `XX.XXX.XXX.XXX` (you'll use this as the HOST)

### 1.2 Open Security Group Ports

**In AWS Console:**

1. Go to your Instance → **Security** tab
2. Click on the **Security Group** link
3. Click **Edit inbound rules**
4. Add these rules:

| Type | Port | Source | Purpose |
|------|------|--------|---------|
| SSH | 22 | Your IP or 0.0.0.0/0 | SSH access |
| HTTP | 80 | 0.0.0.0/0 | Web traffic |
| HTTPS | 443 | 0.0.0.0/0 | Secure traffic |

5. Click **Save rules**

### 1.3 SSH Into EC2 and Install Docker

**On your Windows machine (PowerShell):**

```powershell
# Find your .pem file location
$pemPath = "C:\Users\YourName\Downloads\your-key.pem"

# SSH into EC2
ssh -i $pemPath ubuntu@YOUR_EC2_PUBLIC_IP
```

**Once connected, run these commands on EC2 (one by one):**

```bash
# Update packages
sudo apt update
sudo apt upgrade -y

# Remove old Docker if any
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null; echo "Done"

# Install Docker dependencies
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker and Docker Compose
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Start and enable Docker
sudo systemctl enable docker
sudo systemctl start docker

# Exit and reconnect
exit
```

**Reconnect via SSH:**

```powershell
ssh -i $pemPath ubuntu@YOUR_EC2_PUBLIC_IP
```

**Verify Docker installation:**

```bash
docker --version
docker compose version
docker run hello-world
```

**Expected output:**
```
Docker version 25.x.x
Docker Compose version v2.x.x
Hello from Docker!
```

---

## Step 2: Docker Hub Setup

### 2.1 Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Click **Sign Up**
3. Enter details and create account
4. **Note your username** (you'll need this)

### 2.2 Create Access Token

1. Log in to [hub.docker.com](https://hub.docker.com)
2. Click your **Profile icon** (top right) → **Account Settings**
3. In left sidebar, click **Personal Access Tokens**
4. Click **Generate new token**
5. Name: `github-actions`
6. Permissions: Check **Read & Write**
7. Click **Generate**
8. **COPY THE TOKEN IMMEDIATELY** (shown only once!)

**Save it somewhere safe — you'll need it for GitHub secrets**

---

## Step 3: GitHub Secrets

### 3.1 What Secrets You Need

You need to add **6 secrets** to your GitHub repository:

| Secret Name | Value | Example |
|---|---|---|
| `DOCKER_USERNAME` | Your Docker Hub username | `akhilbabu` |
| `DOCKER_PASSWORD` | Docker Hub Access Token (from Step 2) | `dckr_pat_xxxx...` |
| `HOST` | EC2 Public IP | `13.200.254.173` |
| `USERNAME` | EC2 login username | `ubuntu` |
| `SSH_PRIVATE_KEY` | Contents of your `.pem` file | `-----BEGIN RSA PRIVATE KEY-----...` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@host/db` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key-32-chars-min` |
| `NEXTAUTH_SECRET` | Secret for NextAuth | `your-nextauth-secret-32-chars` |

### 3.2 Get SSH Private Key (Windows)

**On your Windows machine (PowerShell):**

```powershell
# Read the .pem file
$pemPath = "C:\Users\YourName\Downloads\your-key.pem"
$pemContent = Get-Content $pemPath

# Display it
Write-Host $pemContent

# Or copy to clipboard
Get-Content $pemPath -Raw | Set-Clipboard
Write-Host "✓ Copied to clipboard!"
```

**The output should look like:**

```
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdefgh...
(many lines)
...zyxwvutsrqponmlkjihgfedcba
-----END RSA PRIVATE KEY-----
```

### 3.3 Add Secrets to GitHub

**On GitHub:**

1. Go to your repository
2. Click **Settings** (top right)
3. In left sidebar, click **Secrets and variables → Actions**
4. Click **New repository secret**
5. Add each secret:

**First, add the 4 basic secrets:**

- **Name:** `DOCKER_USERNAME` → **Value:** `akhilbabu` (your Docker Hub username)
- **Name:** `DOCKER_PASSWORD` → **Value:** (paste your Docker Hub access token)
- **Name:** `HOST` → **Value:** `13.200.254.173` (your EC2 public IP)
- **Name:** `USERNAME` → **Value:** `ubuntu`

**Then add SSH key:**

- **Name:** `SSH_PRIVATE_KEY` → **Value:** (paste entire .pem file content)

**Then add environment variables:**

- **Name:** `MONGODB_URI` → **Value:** (your MongoDB connection string)
- **Name:** `JWT_SECRET` → **Value:** (your JWT secret)
- **Name:** `NEXTAUTH_SECRET` → **Value:** (your NextAuth secret)

---

## Step 4: Trigger Pipeline

### 4.1 Prepare Code

On your local machine:

```bash
cd e:\DevOps Nest\Complaint-management-web

# Add all files
git add .

# Commit
git commit -m "Setup CI/CD pipeline with Docker and nginx"

# Push to GitHub
git push origin main
```

### 4.2 Watch the Pipeline

1. Go to your GitHub repo
2. Click **Actions** tab
3. You should see a new workflow running: **"Deploy Complaint App to AWS EC2"**
4. Click on it to watch progress

**What happens:**

1. 🟡 **Build and push** → Builds Docker image and pushes to Docker Hub (~2 min)
2. 🟡 **Deploy** → SSHes into EC2, pulls image, starts containers (~30 sec)
3. ✅ **Success** → Application is live!

---

## Step 5: Verification

### 5.1 Check Containers on EC2

SSH into your EC2:

```bash
docker ps
```

**You should see 2 containers:**

```
CONTAINER ID   IMAGE                  STATUS        NAMES
abc123def456   complaint-app:latest   Up 2 minutes  complaint-app
def789ghi012   nginx:alpine           Up 2 minutes  complaint-nginx
```

### 5.2 Test Application

Open your browser and visit:

```
http://YOUR_EC2_PUBLIC_IP
```

(Replace `YOUR_EC2_PUBLIC_IP` with your actual EC2 public IP)

You should see your **Complaint Management application** live! 🎉

### 5.3 Check Logs

If something goes wrong:

```bash
# App logs
docker logs complaint-app

# Nginx logs
docker logs complaint-nginx

# Check docker compose status
cd ~/complaint-app
docker-compose -f docker-compose.prod.yml ps
```

---

## Step 6: Future Deployments

Now that everything is set up, **every time you push code**, it automatically deploys!

### Daily Workflow

```bash
# Make code changes locally
# ... edit files ...

# Stage changes
git add .

# Commit
git commit -m "Fix: update complaint form validation"

# Push to GitHub
git push origin main
```

**GitHub Actions automatically:**

1. ✅ Builds new Docker image
2. ✅ Pushes to Docker Hub
3. ✅ SSHes into EC2
4. ✅ Pulls new image
5. ✅ Restarts containers
6. ✅ **Your changes are live in ~3-5 minutes!**

---

## 🔍 Troubleshooting

### "Connection refused" when visiting app

**Problem:** You see `refused to connect` in browser

**Solutions:**

1. Check port 80 is open in AWS Security Group
2. Check containers are running: `docker ps`
3. Check app logs: `docker logs complaint-app`

### Docker image push fails

**Problem:** GitHub Actions fails at "Build and push"

**Solution:**

1. Go to GitHub → Settings → Secrets
2. Verify `DOCKER_USERNAME` is correct (no spaces, no newlines)
3. Verify `DOCKER_PASSWORD` is your Access Token (not password)

### SSH connection fails

**Problem:** GitHub Actions fails at "Deploy to AWS EC2"

**Solutions:**

1. Check `HOST` is just the IP (no http://)
2. Check `USERNAME` is `ubuntu`
3. Check `SSH_PRIVATE_KEY` includes full `.pem` content
4. Try SSH manually from your machine to verify access

### Application not healthy after deployment

**Problem:** Shows "Waiting for application..." message

**Solutions:**

1. SSH to EC2 and check logs: `docker logs complaint-app`
2. Check environment variables are correct in `.env.production`
3. Check MongoDB URI is valid and accessible

---

## 📝 Important Files

| File | Purpose |
|------|---------|
| [.github/workflows/deploy.yml](.github/workflows/deploy.yml) | GitHub Actions workflow |
| [docker-compose.prod.yml](docker-compose.prod.yml) | Production docker-compose setup |
| [Dockerfile](Dockerfile) | Next.js Docker build configuration |
| [nginx/prod.conf](nginx/prod.conf) | Nginx reverse proxy config |

---

## 🎯 Key Concepts

| Term | Meaning |
|------|---------|
| **CI/CD** | Continuous Integration / Continuous Deployment |
| **GitHub Actions** | GitHub's automation service |
| **Docker** | Container technology for packaging apps |
| **Nginx** | Web server acting as reverse proxy |
| **EC2** | AWS virtual machine |
| **Reverse Proxy** | Server that forwards requests to backend |
| **Environment Variables** | Secret values (passwords, keys, URLs) |

---

## ✅ Checklist

Before considering your setup complete, verify:

- [ ] AWS EC2 instance is running
- [ ] Security Group has ports 22, 80, 443 open
- [ ] Docker and Docker Compose installed on EC2
- [ ] Docker Hub account created
- [ ] Access Token generated on Docker Hub
- [ ] All 6 GitHub secrets added
- [ ] GitHub Actions workflow succeeded
- [ ] Containers running on EC2 (`docker ps` shows 2 containers)
- [ ] Application accessible at `http://YOUR_EC2_IP`
- [ ] Test push to GitHub triggers automatic deployment

---

## 🚀 You're Done!

Your **Production-Ready CI/CD Pipeline** is now active!

Every push to `main` branch will automatically:
1. Build your application
2. Push Docker image
3. Deploy to AWS EC2
4. Make it live within 3-5 minutes

Happy deploying! 🎉
