# GitHub Actions Docker Deployment Setup

## 📋 Prerequisites

Before setting up the GitHub workflow, you need:

1. **Ubuntu Server** (with Docker installed)
2. **Server IP Address**
3. **SSH Username** (e.g., `ubuntu`, `root`, `deploy`)
4. **SSH Private Key** (for authentication)
5. **Docker Hub Account** (for image registry)

---

## 🔑 Step 1: Generate SSH Key (If you don't have one)

### On Your Local Machine:
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_deploy
# Press Enter for no passphrase
```

This creates:
- **Private Key**: `~/.ssh/github_deploy` (keep secret)
- **Public Key**: `~/.ssh/github_deploy.pub` (add to server)

---

## 📝 Step 2: Add Public Key to Server

Log into your Ubuntu server and run:
```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key
echo "[PASTE_YOUR_PUBLIC_KEY_HERE]" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

**How to get your public key content:**
```bash
# Locally, cat the public key file:
cat ~/.ssh/github_deploy.pub
# Copy entire output
```

---

## 🐳 Step 3: Set Up Docker on Server

SSH into your Ubuntu server:
```bash
ssh -i ~/.ssh/github_deploy username@your-server-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker
docker --version
```

---

## 🔐 Step 4: Add GitHub Secrets

1. Go to your GitHub repository: https://github.com/amiththomasabraham2027-afk/complaint_management_website
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Click **New repository secret**

### Add these 7 secrets:

#### Secret 1: `DOCKER_USERNAME`
- **Value**: Your Docker Hub username
- **Get it**: https://hub.docker.com

#### Secret 2: `DOCKER_PASSWORD`
- **Value**: Your Docker Hub password (or access token)
- **⚠️ Important**: Use an access token, not your actual password
- **How to create token**: https://hub.docker.com/settings/security

#### Secret 3: `SERVER_HOST`
- **Value**: Your server's IP address or domain
- **Example**: `192.168.1.100` or `your-domain.com`

#### Secret 4: `SERVER_USER`
- **Value**: SSH username on your server
- **Example**: `ubuntu`, `root`, or `deploy`

#### Secret 5: `SSH_PRIVATE_KEY`
- **Value**: Your private SSH key content
- **How to get it:**
  ```bash
  cat ~/.ssh/github_deploy
  # Copy entire output including "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----"
  ```

#### Secret 6: `MONGODB_URI`
- **Value**: Your MongoDB Atlas connection string
- **Example**: `mongodb+srv://user:password@cluster.mongodb.net/resolvex`

#### Secret 7: `JWT_SECRET`
- **Value**: Your 64-character JWT secret
- **Keep it**: Secure and long (same as your .env.production)

#### Secret 8: `NEXTAUTH_SECRET`
- **Value**: Your 64-character NextAuth secret
- **Keep it**: Secure and long

#### Secret 9: `NEXTAUTH_URL` (optional)
- **Value**: Your server URL
- **Example**: `http://your-domain.com` or `http://192.168.1.100`

#### Secret 10: `NEXT_PUBLIC_API_URL` (optional)
- **Value**: Your API URL
- **Example**: `http://your-domain.com/api`

---

## ✅ Test the Workflow

1. Make a change to your code locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "test docker deployment"
   git push origin main
   ```

3. Go to GitHub → **Actions** tab
4. View the workflow run:
   - **build-and-push**: Builds Docker image and pushes to Docker Hub
   - **deploy**: Pulls image from Docker Hub and runs on server

5. Check server for running container:
   ```bash
   ssh -i ~/.ssh/github_deploy username@your-server-ip
   docker ps
   docker logs -f resolvex
   ```

---

## 📊 Workflow Execution Flow

```
GitHub Push to main
        ↓
Build Docker Image
        ↓
Push to Docker Hub
        ↓
SSH Connect to Server
        ↓
Pull Docker Image
        ↓
Stop Old Container
        ↓
Run New Container (with env vars)
        ↓
✅ Deployment Complete
```

---

## 🛠️ Troubleshooting

### Check Container Logs
```bash
ssh -i ~/.ssh/github_deploy username@your-server-ip
docker logs -f resolvex
docker ps
docker inspect resolvex
```

### Container Won't Start
```bash
# Check if port 3000 is in use
docker ps
sudo lsof -i :3000

# If port is in use, kill existing container
docker stop resolvex
docker rm resolvex

# Check Docker errors
docker logs resolvex
```

### SSH Connection Fails
```bash
# Test SSH connection
ssh -i ~/.ssh/github_deploy -v username@your-server-ip

# Fix key permissions
chmod 600 ~/.ssh/github_deploy
chmod 644 ~/.ssh/github_deploy.pub
```

### Docker Login Fails
```bash
# Test Docker Hub login on server
docker login -u your-username -p your-password

# If it fails, check credentials in GitHub secrets
# Make sure DOCKER_USERNAME and DOCKER_PASSWORD are correct
```

### Workflow Fails
1. Go to **Actions** tab
2. Click the failed workflow
3. Expand the failing step
4. Check error messages
5. Common issues:
   - Invalid Docker Hub credentials
   - Server SSH key incorrect
   - Docker not installed on server
   - Port 3000 already in use

---

## 🔄 Advanced: Customize Deployment

### Deploy Multiple Ports
Edit `.github/workflows/deploy.yml`:
```yaml
docker run -d \
  --name resolvex \
  -p 80:3000 \      # Forward port 80 -> 3000
  -p 443:3000 \     # Forward port 443 -> 3000
  # ... rest of config
```

### Add Health Check
Edit `.github/workflows/deploy.yml`:
```yaml
script: |
  # ... pull and run container
  
  # Wait for container to be healthy
  sleep 5
  curl -f http://localhost:3000 || exit 1
  echo "✅ Container is healthy"
```

### Use Nginx Reverse Proxy
```bash
ssh -i ~/.ssh/github_deploy username@your-server-ip

# Create nginx config pointing to localhost:3000
# Then run:
docker run -d \
  --name resolvex \
  -p 127.0.0.1:3000:3000 \
  # Only accessible via nginx proxy
```

---

## 📋 Manual Deployment (Fallback)

If GitHub Actions fails, manually deploy:

```bash
ssh -i ~/.ssh/github_deploy username@your-server-ip

# Login to Docker
docker login -u your-docker-username

# Pull image
docker pull your-docker-username/resolvex-complaint-system:latest

# Stop old container
docker stop resolvex
docker rm resolvex

# Run new container
docker run -d \
  --name resolvex \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e MONGODB_URI="your-mongodb-uri" \
  -e JWT_SECRET="your-jwt-secret" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  your-docker-username/resolvex-complaint-system:latest

# Check
docker ps
docker logs resolvex
```

---

## ✨ Next Steps

1. ✅ Install Docker on your Ubuntu server
2. ✅ Create Docker Hub account (https://hub.docker.com)
3. ✅ Add all 10 secrets to GitHub
4. ✅ Test SSH connection manually first
5. ✅ Push a change to main to trigger workflow
6. ✅ Monitor GitHub Actions for build and deployment
7. ✅ Check running container with `docker ps`

---

## 🎯 Benefits of Docker Deployment

✅ **No dependency conflicts** - Everything packaged in container
✅ **Faster deployments** - No npm install needed on server
✅ **Easier rollbacks** - Just run old image version
✅ **Consistent environments** - Local = Staging = Production
✅ **Better scalability** - Deploy to multiple servers easily
✅ **Automatic restarts** - `--restart unless-stopped` flag
✅ **Easy monitoring** - `docker logs` and `docker stats`

Need help? Check the GitHub Actions logs or the container logs!
