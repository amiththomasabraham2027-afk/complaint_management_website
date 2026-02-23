# AWS EC2 Docker Deployment Guide

This guide explains how to deploy the Complaint Management System to AWS EC2 using Docker containers.

## 📋 Prerequisites

### Local Machine (Windows/macOS/Linux)
- SSH client configured
- `Complaint_manage.pem` key file in the project root
- Bash or PowerShell for running deployment scripts
- (Optional) Git installed for version control

### AWS EC2 Instance
- Ubuntu 20.04 or later AMI
- t2.micro or larger instance type
- Security group with ports open:
  - **22/TCP** - SSH access
  - **80/TCP** - HTTP
  - **443/TCP** - HTTPS
  - **3000/TCP** - Application (if not using Nginx reverse proxy)

## 🚀 Quick Start (3 Steps)

### Step 1: Prepare Environment Variables

Create a `.env.production` file on your EC2 instance (the deployment script will help you):

```bash
NODE_ENV=production
MONGODB_URI=mongodb://admin:secure-password@mongodb:27017/resolvex?authSource=admin
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRE=7d
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars
NEXTAUTH_URL=http://your-ec2-ip:3000
NEXT_PUBLIC_API_URL=http://your-ec2-ip/api
```

### Step 2: Setup EC2 Instance (First Time Only)

Run the setup script to install Docker, Docker Compose, and dependencies:

**Windows (PowerShell):**
```powershell
.\deploy.ps1 setup-ec2 -KeyPath ".\Complaint_manage.pem" -ServerHost "13.200.254.173"
```

**macOS/Linux (Bash):**
```bash
chmod +x setup-ec2.sh
./setup-ec2.sh ./Complaint_manage.pem ubuntu 13.200.254.173
```

### Step 3: Deploy Application

**Windows (PowerShell):**
```powershell
.\deploy.ps1 deploy -KeyPath ".\Complaint_manage.pem" -ServerHost "13.200.254.173"
```

**macOS/Linux (Bash):**
```bash
chmod +x deploy.sh
./deploy.sh ./Complaint_manage.pem ubuntu 13.200.254.173
```

Your application will be available at `http://13.200.254.173:3000`

## 📦 Docker Containers Overview

The deployment creates these containers:

| Container | Purpose | Port | Health Check |
|-----------|---------|------|--------------|
| **mongodb** | MongoDB database | 27017 | Ping command |
| **complaint-app** | Next.js application | 3000 | HTTP GET / |
| **nginx** | Reverse proxy & TLS | 80, 443 | N/A |

## 📝 Available Commands

### PowerShell (Windows)

```powershell
# Setup EC2 on first deployment
.\deploy.ps1 setup-ec2

# Full deployment
.\deploy.ps1 deploy

# Quick update (pull latest + restart)
.\deploy.ps1 update

# Check container status
.\deploy.ps1 status

# View last 50 lines of logs
.\deploy.ps1 logs

# Restart containers
.\deploy.ps1 restart

# Stop all containers
.\deploy.ps1 stop

# Clean up Docker resources
.\deploy.ps1 clean
```

### Bash (macOS/Linux)

```bash
# Setup EC2 on first deployment
./setup-ec2.sh ./Complaint_manage.pem ubuntu 13.200.254.173

# Full deployment
./deploy.sh ./Complaint_manage.pem ubuntu 13.200.254.173

# Quick update
./quick-update.sh ./Complaint_manage.pem ubuntu 13.200.254.173

# View logs
./view-logs.sh ./Complaint_manage.pem ubuntu 13.200.254.173
```

## 🔄 Continuous Deployment with GitHub Actions

The `.github/workflows/docker-deploy.yml` workflow automatically:

1. Builds Docker image on every push to `main`
2. Runs tests (linting, type checking)
3. Deploys to EC2 if all checks pass

### Setup GitHub Actions Secrets

Add these secrets to your GitHub repository (`Settings > Secrets`):

```
SSH_PRIVATE_KEY          # Contents of Complaint_manage.pem
SERVER_HOST              # Your EC2 IP or domain (e.g., 13.200.254.173)
SERVER_USER              # SSH user (default: ubuntu)
MONGODB_URI              # MongoDB connection string
JWT_SECRET               # JWT secret key
NEXTAUTH_SECRET          # NextAuth secret key
```

**To extract the private key for GitHub:**

Windows (PowerShell):
```powershell
$key = Get-Content -Raw "Complaint_manage.pem"
$key | Set-Clipboard
# Now paste into GitHub secrets
```

macOS/Linux (Bash):
```bash
cat Complaint_manage.pem | pbcopy  # macOS
cat Complaint_manage.pem | xclip -selection clipboard  # Linux
```

## 🛠️ Manual Deployment via SSH

SSH directly into your instance and run:

```bash
# Create app directory
mkdir -p ~/complaint-app
cd ~/complaint-app

# Clone repository
git clone https://github.com/amiththomasabraham2027-afk/complaint_management_website.git .

# Create environment file
cat > .env.production << 'EOF'
NODE_ENV=production
MONGODB_URI=mongodb://admin:password@mongodb:27017/resolvex?authSource=admin
JWT_SECRET=your-secret
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://13.200.254.173:3000
NEXT_PUBLIC_API_URL=http://13.200.254.173/api
EOF

# Build and start
docker build -t complaint-app:latest .
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

## 📊 Monitoring & Maintenance

### View Live Logs

```bash
# Application logs
docker logs -f complaint-app

# MongoDB logs
docker logs -f complaint-mongodb

# Last 100 lines
docker logs --tail 100 complaint-app
```

### Check Application Health

```bash
# Docker status
docker-compose -f docker-compose.prod.yml ps

# Container stats (CPU, memory, network)
docker stats

# Disk usage
docker system df
```

### Database Management

```bash
# Access MongoDB shell
docker exec -it complaint-mongodb mongosh mongodb://admin@localhost:27017

# Database backup
docker exec complaint-mongodb mongodump --out /tmp/backup --authenticationDatabase admin

# Restore from backup
docker exec -i complaint-mongodb mongorestore --drop /tmp/backup
```

## 🔒 Security Best Practices

### 1. Update Environment Variables

**DO NOT use default values in production!**

- Change `JWT_SECRET` to a strong random string (min 32 chars)
- Change `NEXTAUTH_SECRET` to a strong random string (min 32 chars)
- Change MongoDB password from default `production`

Generate secure secrets:

**Windows (PowerShell):**
```powershell
$bytes = [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
[System.Convert]::ToBase64String($bytes)
```

**macOS/Linux (Bash):**
```bash
openssl rand -base64 32
```

### 2. Enable HTTPS/TLS

1. Get a domain (Route 53, Namecheap, etc.)
2. Point domain to your EC2 IP
3. Install Let's Encrypt certificate:

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d your-domain.com
```

4. Update `docker-compose.prod.yml` with certificate paths
5. Uncomment SSL configuration in `nginx.conf`

### 3. Firewall Configuration

The setup script configures UFW (Ubuntu Firewall). Verify:

```bash
sudo ufw status
# Should show:
# To                         Action      From
# --                         ------      ----
# 22/tcp                     ALLOW       Anywhere
# 80/tcp                     ALLOW       Anywhere
# 443/tcp                    ALLOW       Anywhere
```

### 4. Regular Backups

### 5. SSH Key Security

- Never commit `Complaint_manage.pem` to version control
- Add to `.gitignore` (already done)
- Restrict key permissions: `chmod 600 Complaint_manage.pem`
- Rotate keys periodically

## 🐛 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs complaint-app

# Check resource limits
docker stats

# Restart all containers
docker-compose -f docker-compose.prod.yml restart
```

### SSH Connection Refused

```bash
# Verify key permissions
ls -la Complaint_manage.pem
chmod 600 Complaint_manage.pem

# Test connectivity
ssh -vvv -i Complaint_manage.pem ubuntu@13.200.254.173
```

### MongoDB Connection Failed

```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check MongoDB logs
docker logs complaint-mongodb

# Reconnect
docker-compose -f docker-compose.prod.yml restart mongodb complaint-app
```

### Port Already in Use

```bash
# Check what's using port 3000
sudo lsof -i :3000

# Or using netstat
sudo netstat -tlnp | grep 3000

# Free up port by killing process
sudo kill -9 <PID>
```

### Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -af

# Remove dangling images
docker image prune -f
```

## 📈 Performance Tuning

### Increase Node Memory Limit

Edit `docker-compose.prod.yml` and change:
```yaml
NODE_OPTIONS: --max-old-space-size=2048
```

### Database Optimization

```javascript
// Create indexes in MongoDB
db.complaints.createIndex({ status: 1 })
db.complaints.createIndex({ createdAt: -1 })
db.users.createIndex({ email: 1 }, { unique: true })
```

### Nginx Caching

Already configured in `nginx.conf`:
- Static assets cached for 1 day
- API responses not cached
- Rate limiting enabled (10 req/s for API, 30 req/s general)

## 🚨 Emergency Procedures

### Rollback to Previous Version

```bash
git log --oneline
git checkout <commit-hash>
docker build -t complaint-app:latest .
docker-compose -f docker-compose.prod.yml restart
```

### Emergency Stop

```bash
docker-compose -f docker-compose.prod.yml down
# This stops all containers but preserves data
```

### Full Reset (Dangerous!)

```bash
# Stop everything
docker-compose -f docker-compose.prod.yml down -v

# This removes containers AND volumes (data!)
# Only do this if you have backups
```

## 📞 Support & Resources

- **Docker Documentation**: https://docs.docker.com
- **Docker Compose**: https://docs.docker.com/compose
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **MongoDB**: https://docs.mongodb.com
- **AWS EC2**: https://aws.amazon.com/ec2

## 📄 Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Builds Next.js application image |
| `docker-compose.yml` | Local development setup |
| `docker-compose.prod.yml` | Production setup with MongoDB |
| `nginx.conf` | Reverse proxy configuration |
| `.github/workflows/docker-deploy.yml` | GitHub Actions CI/CD |
| `deploy.sh` | Full deployment script (Bash) |
| `deploy.ps1` | Full deployment script (PowerShell) |
| `setup-ec2.sh` | EC2 prerequisites setup |
| `quick-update.sh` | Fast update script |
| `view-logs.sh` | Log viewer utility |

## 🎉 Success!

Your complaint management system is now deployed on AWS EC2 with Docker. Access it at:

```
http://13.200.254.173:3000
```

For external access, set up a domain and enable HTTPS following the security section.
