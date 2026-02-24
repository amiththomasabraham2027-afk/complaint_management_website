# 🚀 Complete CI/CD Automation Setup

## Overview

This project uses a fully automated CI/CD pipeline with:
- **GitHub Actions** for build orchestration
- **Docker** for containerization
- **AWS EC2** for hosting
- **Docker Compose** for container management

## Current Status

✅ **Completed:**
- Docker image builds successfully
- Docker Hub integration configured
- GitHub Actions workflow created
- 8 GitHub Secrets configured
- EC2 instance provisioned (ap-south-1)
- Nginx reverse proxy configured
- HTTPS/SSL ready

⚠️ **Pending:**
- SSH Key authorization on EC2 (one-time setup)
- Initial deployment trigger

## SSH Key Authorization (Critical First Step)

Before automation can work, the SSH key must be authorized on the EC2 instance.

### Option A: Using EC2 Console (Easiest - Recommended)

1. Go to [AWS EC2 Console](https://console.aws.amazon.com/ec2/)
2. Select region: **ap-south-1**
3. Find instance: **i-0220380d98646d5ea**
4. Click **Connect** button
5. Select tab: **EC2 Instance Connect**
6. Click **Connect** to open web terminal
7. In the terminal, run this command:

```bash
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQC3HiHuf/+7zGuJd4Df6fInoYqJkMPkvUJqUl69WCMtih21HljWrHdZxcykdrmdF8xsIdX9kd7BLDXWrfz7HUjehDG4e2pTO1XJoryCAafhC4rOEjpkUR3WnbYCojv94qOZ5vRTbps/e1qgiNIh+hJOJVq3GiuFBIbqn3WBeQXeypPaHr88d3Y0rKjZRivC+Ty8ZecjvqaAIwO2C3ugqRqZNAtgjPMqo/et97lMHY9U+JweWumuHZAmjxuwrg8wLGqHNc4hynLIElEVW5wpJqVYPKaQ/mh9hW9iKVibhtvECcOLECXqQj3zdsenQ+Go6lXtPzGRyb8cnAkM+v+4wtGN" >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys
```

8. Verify it worked:
```bash
echo "✓ Key authorized!" && wc -l ~/.ssh/authorized_keys
```

### Option B: Using AWS Systems Manager

```bash
# Install AWS CLI if needed
# Then run:
aws ssm start-session --target i-0220380d98646d5ea --region ap-south-1

# In the session, run the echo command from Option A
```

### Option C: Using Original EC2 Launch Key

```bash
# Connect with your original EC2 key
ssh -i your-original-key.pem ubuntu@13.200.254.173

# Add the new key
echo "ssh-rsa AAAAB3NzaC1yc2E..." >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

## Verify SSH Key Authorization

Once authorized, verify with:

```bash
ssh -i resolvex_deploy.pem ubuntu@13.200.254.173 "whoami"
```

Expected output:
```
ubuntu
```

## GitHub Secrets Configuration

All secrets are already configured:

| Secret Name | Purpose | Status |
|---|---|---|
| `DOCKER_USERNAME` | Docker Hub account | ✅ |
| `DOCKER_PASSWORD` | Docker Hub token | ✅ |
| `HOST` | EC2 public IP | ✅ |
| `USERNAME` | EC2 SSH user (ubuntu) | ✅ |
| `SSH_PRIVATE_KEY` | SSH key for deployment | ✅ |
| `MONGODB_URI` | Database connection | ✅ |
| `JWT_SECRET` | Authentication token | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret | ✅ |

## Automated Deployment Flow

Once SSH is authorized, the complete pipeline is:

```
┌──────────────────┐
│  Push to main    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────┐
│  GitHub Actions Triggered        │
│  Build Docker Image              │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Push to Docker Hub              │
│  amiththomasabraham/complaint-app │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  SSH to EC2                      │
│  Pull & Deploy Container         │
│  Start docker-compose            │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  ✅ Application Live             │
│  http://13.200.254.173           │
└──────────────────────────────────┘
```

## Triggering Deployment

### Automatic (Recommended)

Simply push to main branch:

```bash
git add .
git commit -m "feature: update app"
git push origin main
```

GitHub Actions will automatically:
1. Build Docker image
2. Push to Docker Hub
3. Deploy to EC2

### Manual Trigger

Via GitHub UI:
1. Go to repository
2. Click **Actions**
3. Select **Build, Push & Deploy to EC2**
4. Click **Run workflow**

Or via GitHub CLI:
```bash
gh workflow run automated-deploy.yml
```

## Monitoring Deployment

### Watch Live

[GitHub Actions Console](https://github.com/amiththomasabraham2027-afk/complaint_management_website/actions)

### SSH into EC2

```bash
ssh -i resolvex_deploy.pem ubuntu@13.200.254.173

# View container status
docker-compose -f ~/complaint-app/docker-compose.prod.yml ps

# Watch logs
docker-compose -f ~/complaint-app/docker-compose.prod.yml logs -f complaint-app

# Check health
curl http://localhost/health
```

### Check Application

```bash
# Test API
curl http://13.200.254.173/api/health

# View in browser
http://13.200.254.173
```

## Troubleshooting

### SSH Connection Fails

```bash
# Verify key file permissions
ls -la resolvex_deploy.pem
chmod 600 resolvex_deploy.pem

# Test connection
ssh -v -i resolvex_deploy.pem ubuntu@13.200.254.173

# Check key is in authorized_keys (from EC2 console)
cat ~/.ssh/authorized_keys
```

### Docker Not Found on EC2

```bash
# SSH into instance
ssh -i resolvex_deploy.pem ubuntu@13.200.254.173

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git

# Add ubuntu to docker group
sudo usermod -aG docker ubuntu

# Test
docker --version
```

### Container Won't Start

```bash
# Check logs
docker-compose -f ~/complaint-app/docker-compose.prod.yml logs complaint-app

# Check environment file
cat ~/complaint-app/.env.production

# Restart
docker-compose -f ~/complaint-app/docker-compose.prod.yml restart
```

### GitHub Actions Fails

1. Check **Actions** tab → failed workflow
2. View step logs for error details
3. Common issues:
   - SSH authentication failed → Check SSH key authorization
   - Docker login failed → Check DOCKER_USERNAME/PASSWORD secrets
   - Deployment script error → Check EC2 has Docker installed

## Environment Configuration

The application uses these environment variables (auto-configured):

```
NODE_ENV=production
MONGODB_URI=<from GitHub secrets>
JWT_SECRET=<from GitHub secrets>
NEXTAUTH_SECRET=<from GitHub secrets>
NEXTAUTH_URL=http://13.200.254.173
NEXT_PUBLIC_API_URL=http://13.200.254.173/api
```

## Container Architecture

```
nginx:alpine (port 80)
    ↓ proxies to
complaint-app (Next.js, port 3000)
    ↓
docker-compose network
    ↓
docker volume (persistent storage)
```

## Production URLs

- **Application**: http://13.200.254.173
- **API**: http://13.200.254.173/api
- **Health Check**: http://13.200.254.173/health
- **Docker Registry**: docker.io/amiththomasabraham/complaint-app

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
# ... edit files ...

# Commit
git add .
git commit -m "feature: description"

# Push to main (triggers deployment)
git push origin main

# Or, merge through PR first
git push origin feature/your-feature
# Create PR on GitHub
# Merge when approved
```

## Maintenance

### Update Application

1. Make code changes locally
2. Test locally with: `npm run dev`
3. Commit and push to main
4. GitHub Actions automatically deploys

### Update Dependencies

```bash
npm update
npm install <new-package>
git add package*.json
git commit -m "chore: update dependencies"
git push origin main
```

### Rebuild Docker Image

```bash
# Force rebuild (skip cache)
git commit --allow-empty -m "ci: force docker rebuild"
git push origin main
```

### View Application Logs

```bash
ssh -i resolvex_deploy.pem ubuntu@13.200.254.173
docker-compose -f ~/complaint-app/docker-compose.prod.yml logs -f complaint-app --tail=100
```

### Restart Application

```bash
ssh -i resolvex_deploy.pem ubuntu@13.200.254.173
docker-compose -f ~/complaint-app/docker-compose.prod.yml restart complaint-app
```

## Scaling

### Increase Resources

1. Go to AWS EC2 Console
2. Stop instance
3. Change instance type (t2.micro → t2.small, etc.)
4. Start instance (IP may change)
5. Update `HOST` secret if IP changed

### Multiple Regions

Create separate GitHub Actions workflows with different:
- `secrets.HOST` (different EC2 IP)
- Branch triggers (e.g., deploy-us vs deploy-eu)

## Security

✅ **Implemented:**
- SSH key-based authentication
- GitHub Secrets for sensitive data
- Environment variables in .env.production
- Docker authentication with token
- Private EC2 security group (if configured)

🔒 **Next Steps:**
- Enable HTTPS/SSL certificates
- Configure WAF (Web Application Firewall)
- Set up RDS for database (instead of external MongoDB)
- Enable CloudFront CDN

## Support & Documentation

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)
- [Next.js Documentation](https://nextjs.org/docs)

## Next Steps

1. ✅ Authorize SSH key using Option A above
2. 🔄 Trigger deployment with: `git commit --allow-empty -m "ci: initial deployment" && git push origin main`
3. 📊 Monitor at: [GitHub Actions](https://github.com/amiththomasabraham2027-afk/complaint_management_website/actions)
4. 🌐 Access application: http://13.200.254.173

---

**Setup Date:** 2026-02-24  
**CI/CD Status:** Ready (Pending SSH Authorization)  
**Application Status:** Ready for Deployment  
**Next Review:** After first successful deployment
