# AWS EC2 + Docker CI/CD Deployment — Quick Start

## 🚀 What You're Building

A **fully automated deployment pipeline** that:
- ✅ Builds Docker image when you push to GitHub
- ✅ Pushes image to Docker Hub
- ✅ Deploys to AWS EC2 automatically
- ✅ Runs Nginx on port 80 + Next.js app on port 3000
- ✅ Connects to external MongoDB (Atlas or DocumentDB)

---

## 📋 30-Second Overview

**The Pipeline:**
```
You push code to GitHub
         ↓
GitHub Actions builds Docker image
         ↓
Image pushed to Docker Hub
         ↓
GitHub Actions SSHes into EC2
         ↓
Pulls image and runs: docker-compose up -d
         ↓
Nginx (port 80) → Next.js App (port 3000)
         ↓
Your app is live! ✨
```

---

## ✅ Pre-Deployment Checklist

### Local Machine (Windows)
- [ ] Have your EC2 `.pem` file saved locally
- [ ] Have Docker Hub account + access token ready
- [ ] Have MongoDB connection string (Atlas or DocumentDB)

### AWS Account
- [ ] EC2 instance launched (Ubuntu 22.04 LTS)
- [ ] Security Group opened port 80, 443, 22
- [ ] Copied EC2 **Public IP address**

### GitHub
- [ ] Repository ready
- [ ] Ready to add 8 secrets

---

## 🚦 Ready to Start?

### Next Steps (In Order):

1. **AWS EC2 Setup** (15 min)
   - Launch instance + open ports
   - SSH in and install Docker
   - Test with `docker run hello-world`

2. **Docker Hub Setup** (5 min)
   - Create account + generate access token
   - Note your username

3. **GitHub Secrets** (10 min)
   - Add all 8 required secrets

4. **Push & Deploy** (5 min)
   - Push code to main branch
   - Watch GitHub Actions
   - Visit `http://YOUR_EC2_IP` ✨

---

## 📖 Full Guides

- **[CI_CD_SETUP_GUIDE.md](CI_CD_SETUP_GUIDE.md)** — Complete step-by-step with commands
- **[GITHUB_SECRETS_REFERENCE.md](GITHUB_SECRETS_REFERENCE.md)** — How to get each secret

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Connection refused" on browser | Check Security Group port 80 is open |
| Docker image build fails | Verify DOCKER_USERNAME and DOCKER_PASSWORD |
| SSH deploy fails | Verify HOST, USERNAME, SSH_PRIVATE_KEY |
| App not healthy after deploy | SSH to EC2, run `docker logs complaint-app` |

---

## 🎯 Key Files Created/Updated

| File | Purpose |
|------|---------|
| `.github/workflows/deploy.yml` | GitHub Actions workflow (builds, pushes, deploys) |
| `docker-compose.prod.yml` | Production stack definition |
| `nginx/prod.conf` | Nginx reverse proxy configuration |
| `Dockerfile` | Docker build instructions (already existed) |

---

## 💡 Pro Tips

1. **Local Testing First**
   ```bash
   docker-compose build
   docker-compose up -d
   # Visit http://localhost
   ```

2. **Monitor Deployments**
   - Go to GitHub → Actions tab
   - Click latest run to watch live progress

3. **View EC2 Logs**
   ```bash
   ssh -i key.pem ubuntu@YOUR_EC2_IP
   docker logs complaint-app -f  # Follow logs
   docker-compose -f docker-compose.prod.yml ps
   ```

4. **Rollback If Needed**
   ```bash
   # On EC2
   cd ~/complaint-app
   docker-compose -f docker-compose.prod.yml down
   # Fix issue locally
   git push origin main
   # Redeploy automatically
   ```

---

## 📚 Learning Resources

- **Docker Docs:** https://docs.docker.com/
- **Nginx Reverse Proxy:** https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/
- **GitHub Actions:** https://docs.github.com/en/actions
- **AWS EC2:** https://docs.aws.amazon.com/ec2/

---

## ⏱️ Time Breakdown

| Step | Time |
|------|------|
| AWS EC2 setup + Docker install | 15-20 min |
| Docker Hub account + token | 5 min |
| Add GitHub secrets | 5-10 min |
| First deployment | 5-10 min |
| **Total** | **~45 min** |

---

## 🎉 After First Successful Deployment

**From now on, just do this:**

```bash
# Make changes
# ...edit files...

git add .
git commit -m "Your message"
git push origin main

# Wait 3-5 minutes
# Check GitHub Actions
# Your changes are live! ✨
```

---

## 📞 Need Help?

1. Check `CI_CD_SETUP_GUIDE.md` for detailed steps
2. Check `GITHUB_SECRETS_REFERENCE.md` for secret help
3. Review logs:
   - GitHub Actions: repo → Actions tab
   - EC2 app: `docker logs complaint-app`
   - EC2 nginx: `docker logs complaint-nginx`

---

**Ready? Start with [CI_CD_SETUP_GUIDE.md](CI_CD_SETUP_GUIDE.md)** 🚀
