# 🚀 AWS EC2 Deployment Quick Reference

Your Complaint Management System is now fully containerized with Docker and ready for AWS EC2 deployment!

## 📦 What's Been Set Up

✅ **Docker Containerization**
- Multi-stage Dockerfile for optimized Next.js builds
- docker-compose.yml for development
- docker-compose.prod.yml for production

✅ **GitHub Actions CI/CD**
- Automated Docker image building
- Automated tests (linting, type checking)
- Automatic deployment to EC2 on `main` push

✅ **Deployment Scripts**
- **Windows**: `deploy.ps1` (PowerShell)
- **macOS/Linux**: `deploy.sh`, `setup-ec2.sh`, etc. (Bash)

✅ **Production Infrastructure**
- MongoDB database container
- Next.js application container
- Nginx reverse proxy with rate limiting
- Health checks and auto-restart

✅ **Security Features**
- Non-root Docker user
- Encrypted environment variables
- Firewall configuration
- Security headers in Nginx

## 🎯 Deployment Options

### Option 1: GitHub Actions (Recommended) - Automatic Deployment

1. **Set up GitHub Secrets** (one-time setup):
   ```
   Follow: GITHUB_SECRETS_SETUP.md
   ```

2. **Deploy with Git Push**:
   ```bash
   git push origin main
   # → Automatically builds & deploys!
   ```

3. **Monitor at**: GitHub Actions tab

### Option 2: Manual Script Deployment - For Immediate Testing

**Windows (PowerShell)**:
```powershell
.\deploy.ps1 setup-ec2
.\deploy.ps1 deploy
```

**macOS/Linux**:
```bash
./setup-ec2.sh ./Complaint_manage.pem ubuntu 13.200.254.173
./deploy.sh ./Complaint_manage.pem ubuntu 13.200.254.173
```

### Option 3: Direct SSH - Maximum Control

```bash
ssh -i Complaint_manage.pem ubuntu@13.200.254.173
cd ~/complaint-app
docker-compose -f docker-compose.prod.yml logs -f
```

## 📋 Initial Setup Checklist

- [ ] 1. Read `DOCKER_DEPLOYMENT.md` for full details
- [ ] 2. Read `GITHUB_SECRETS_SETUP.md` to configure GitHub Actions
- [ ] 3. Update `.env.production` with actual secret values
- [ ] 4. Test SSH connection: `ssh -i Complaint_manage.pem ubuntu@13.200.254.173`
- [ ] 5. Run setup: `./setup-ec2.sh` (first time only)
- [ ] 6. Deploy app: `./deploy.sh` or push to main
- [ ] 7. Verify at: `http://13.200.254.173:3000`
- [ ] 8. (Optional) Set up DNS + HTTPS

## 🔧 Useful Commands

| Action | Windows | macOS/Linux |
|--------|---------|------------|
| **Setup EC2** | `.\deploy.ps1 setup-ec2` | `./setup-ec2.sh` |
| **Deploy** | `.\deploy.ps1 deploy` | `./deploy.sh` |
| **Update** | `.\deploy.ps1 update` | `./quick-update.sh` |
| **View Logs** | `.\deploy.ps1 logs` | `./view-logs.sh` |
| **Check Status** | `.\deploy.ps1 status` | SSH + `docker ps` |
| **Restart App** | `.\deploy.ps1 restart` | SSH + `docker restart` |

## 🔑 GitHub Secrets Required

For GitHub Actions to work, these secrets must be set in GitHub:

```
SSH_PRIVATE_KEY       ← Complaint_manage.pem contents
SERVER_HOST           ← 13.200.254.173
SERVER_USER           ← ubuntu
MONGODB_URI           ← MongoDB connection string
JWT_SECRET            ← Random 32+ character string
NEXTAUTH_SECRET       ← Random 32+ character string
```

👉 **Setup Guide**: See `GITHUB_SECRETS_SETUP.md`

## 📁 New Files Added

### Docker Files
- `Dockerfile` - Container build recipe
- `docker-compose.yml` - Development setup
- `docker-compose.prod.yml` - Production setup with MongoDB
- `.dockerignore` - Exclude unnecessary files from image

### Deployment Scripts
- `deploy.sh` - Full deployment (Bash)
- `deploy.ps1` - Full deployment (PowerShell)
- `setup-ec2.sh` - EC2 initialization
- `quick-update.sh` - Fast updates
- `view-logs.sh` - Log viewer

### Configuration
- `nginx.conf` - Reverse proxy with SSL ready

### Documentation
- `DOCKER_DEPLOYMENT.md` - Complete deployment guide (80+ commands)
- `GITHUB_SECRETS_SETUP.md` - GitHub Actions setup guide

### GitHub Actions
- `.github/workflows/docker-deploy.yml` - CI/CD workflow

## 🌐 Access Your Application

After successful deployment:

```
http://13.200.254.173:3000
```

Production with HTTPS (after DNS setup):
```
https://yourdomain.com
```

## 📊 Application Architecture

```
GitHub Push → GitHub Actions builds Docker image
             ↓
    → Runs tests (linting, type-check)
             ↓
    → SSH to EC2 instance → Docker pull latest
             ↓
    → docker-compose starts containers:
        - MongoDB (database)
        - Node.js/Next.js (app)
        - Nginx (reverse proxy)
             ↓
    → Health checks pass
             ↓
    → Application ready at port 3000/80/443
```

## 🆘 Troubleshooting

**SSH Connection Failed**:
```bash
chmod 600 Complaint_manage.pem
ssh -vvv -i Complaint_manage.pem ubuntu@13.200.254.173
```

**App Won't Start**:
```bash
ssh -i Complaint_manage.pem ubuntu@13.200.254.173
cd ~/complaint-app
docker-compose -f docker-compose.prod.yml logs complaint-app
```

**Need More Help**:
→ See `DOCKER_DEPLOYMENT.md` Troubleshooting section (40+ solutions)

## 📚 Documentation Structure

```
📄 README.md (main project docs)
  ├─ 📄 DOCKER_DEPLOYMENT.md (80+ deployment commands)
  │   ├─ Prerequisites
  │   ├─ Quick Start (3 steps)
  │   ├─ GitHub Actions setup
  │   ├─ Manual SSH deployment
  │   ├─ Monitoring & maintenance
  │   ├─ Security best practices
  │   ├─ Performance tuning
  │   └─ Troubleshooting (40+ solutions)
  │
  └─ 📄 GITHUB_SECRETS_SETUP.md (secrets configuration)
      ├─ Key extraction
      ├─ Secret generation
      ├─ GitHub UI instructions
      ├─ Secret rotation
      └─ Security practices
```

## 🎓 Learning Resources

- [Next.js Docker Deployment](https://nextjs.org/docs/deployment)
- [Docker Compose Documentation](https://docs.docker.com/compose)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Nginx Reverse Proxy](https://nginx.org/en/docs/)
- [AWS EC2 Best Practices](https://docs.aws.amazon.com/AWSEC2/)

## 🚀 Next Steps

1. **Immediate** (15 minutes):
   - [ ] Read `DOCKER_DEPLOYMENT.md` sections 1-2
   - [ ] Set up GitHub Secrets from `GITHUB_SECRETS_SETUP.md`
   - [ ] Test deployment

2. **Short-term** (1 hour):
   - [ ] Verify application at `http://13.200.254.173:3000`
   - [ ] Test all deployment commands
   - [ ] Check MongoDB connection
   - [ ] Run health checks

3. **Long-term** (1-2 days):
   - [ ] Set up custom domain (Route 53)
   - [ ] Enable HTTPS/SSL certificate
   - [ ] Configure email notifications
   - [ ] Set up automated backups
   - [ ] Monitor logs and metrics
   - [ ] Load testing

## 💡 Pro Tips

- Use GitHub Actions for CI/CD (no manual deploys)
- Keep `.pem` file secure (`chmod 600`)
- Backup database weekly: `docker exec complaint-mongodb mongodump`
- Monitor disk space: `docker system df`
- View real-time logs: `docker-compose logs -f`
- Test locally first: `docker-compose up` then visit `http://localhost:3000`

## 📞 Need Help?

1. Check `DOCKER_DEPLOYMENT.md` (comprehensive guide)
2. Check `GITHUB_SECRETS_SETUP.md` (secrets troubleshooting)
3. Check workflow logs in GitHub Actions tab
4. Verify all secrets are set: `gh secret list`
5. Test SSH manually: `ssh -i Complaint_manage.pem ubuntu@13.200.254.173`

---

**Status**: ✅ Full Docker + AWS EC2 deployment infrastructure ready!

**Current EC2 Instance**: `13.200.254.173`
**App Port**: `:3000`
**Database**: MongoDB (internal container)
**Reverse Proxy**: Nginx (ready for HTTPS)

Happy deploying! 🎉
