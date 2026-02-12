# 🚀 Production Deployment Guide

## Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database backups configured
- [ ] SSL certificates ready
- [ ] Monitoring alerts set up
- [ ] Security audit completed
- [ ] API documentation reviewed
- [ ] Performance testing done

## Environment Variables for Production

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/resolvex?retryWrites=true&w=majority

# Security
JWT_SECRET=your-extremely-secure-random-key-at-least-32-characters
JWT_EXPIRE=7d
NEXTAUTH_SECRET=your-extremely-secure-random-nextauth-secret

# Application
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
NEXTAUTH_URL=https://yourdomain.com

# Optional
LOG_LEVEL=info
SENTRY_DSN=your-sentry-url-for-error-tracking
```

## Docker Deployment

### Quick Start
```bash
# Pull latest code
git pull origin main

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Health Checks
```bash
# Check app health
curl http://localhost:3000

# Check MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

## Kubernetes Deployment (Optional)

### Create Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: resolvex-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: resolvex-app
  template:
    metadata:
      labels:
        app: resolvex-app
    spec:
      containers:
      - name: app
        image: resolvex:latest
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: resolvex-secrets
              key: mongodb-uri
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: resolvex-secrets
              key: jwt-secret
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 15
          periodSeconds: 20
```

## Cloud Provider Deployment

### Vercel (Recommended for Next.js)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add NEXTAUTH_SECRET
```

### AWS Deployment

1. **Elastic Container Registry (ECR)**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

# Build and push
docker build -t resolvex .
docker tag resolvex:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/resolvex:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/resolvex:latest
```

2. **ECS Task Definition**
```json
{
  "family": "resolvex-app",
  "containerDefinitions": [
    {
      "name": "resolvex-app",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/resolvex:latest",
      "memory": 512,
      "cpu": 256,
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 0,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "MONGODB_URI",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:resolvex/mongodb-uri"
        }
      ]
    }
  ]
}
```

### Google Cloud Deployment

```bash
# Authenticate
gcloud auth login

# Create Cloud Run service
gcloud run deploy resolvex \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars MONGODB_URI="<uri>",JWT_SECRET="<secret>"
```

### Azure Deployment

```bash
# Create resource group
az group create --name resolvex-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name resolvex-plan \
  --resource-group resolvex-rg \
  --sku B1 --is-linux

# Deploy
az webapp up --name resolvex-app --resource-group resolvex-rg --plan resolvex-plan
```

## Database Migration to Production MongoDB

### Atlas Setup
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster (M0 free tier for testing)
3. Create database user
4. Add IP whitelist
5. Get connection string

### Data Migration
```bash
# Export from local MongoDB
mongodump --db resolvex --out ./dump

# Import to Atlas
mongorestore --uri "mongodb+srv://user:pass@cluster.mongodb.net" ./dump

# Verify
mongosh "mongodb+srv://user:pass@cluster.mongodb.net/resolvex"
```

## SSL/HTTPS Configuration

### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000" always;
    add_header Content-Security-Policy "default-src 'self'" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Logging

### Sentry Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure in next.config.js
const withSentry = require("@sentry/nextjs/withSentry");
module.exports = withSentry({
  // ... rest of config
});
```

### PM2 Process Manager (Alternative to Docker)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "resolvex" -- start

# Monitor
pm2 monit

# Logs
pm2 logs resolvex

# Auto-restart on system reboot
pm2 startup
pm2 save
```

### Docker Resource Limits
```yaml
services:
  app:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

## Performance Tuning

### MongoDB Optimization
```javascript
// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.complaints.createIndex({ userId: 1 });
db.complaints.createIndex({ status: 1 });
db.complaints.createIndex({ createdAt: -1 });
db.complaints.createIndex({ title: "text", description: "text" });

// Analyze query performance
db.complaints.find({ status: "Pending" }).explain("executionStats")
```

### Next.js Optimization
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  productionBrowserSourceMaps: false,
  optimizeFonts: true,
  swcMinify: true,
};
```

## Backup Strategy

### Daily Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mongodump \
  --uri="mongodb+srv://user:pass@cluster/resolvex" \
  --out="$BACKUP_DIR/resolvex_$DATE"

# Upload to S3
aws s3 sync "$BACKUP_DIR/resolvex_$DATE" s3://backups-bucket/resolvex/$DATE/

# Keep last 30 days
find $BACKUP_DIR -mtime +30 -exec rm -rf {} \;
```

## Scaling Strategies

### Horizontal Scaling
1. Load balancer (Nginx, HAProxy)
2. Multiple app instances
3. Session sharing (via cookies)
4. Stateless API design ✓

### Vertical Scaling
1. Increase container resources
2. Optimize database queries
3. Add caching layer (Redis)
4. CDN for static assets

### Database Scaling
1. MongoDB replica sets
2. Database sharding
3. Read replicas for backups
4. Connection pooling

## Security Hardening

### DDoS Protection
- Use Cloudflare or similar CDN
- Rate limiting on API
- IP filtering

### SQL Injection Prevention
- Using MongoDB (not SQL)
- Mongoose schema validation
- Input sanitization

### CORS Configuration
```javascript
// Only allow specific domains
const allowedOrigins = [
  'https://yourdomain.com',
  'https://www.yourdomain.com'
];
```

### API Rate Limiting
```bash
# Using rate-limit package
npm install express-rate-limit
```

## Incident Response

### If Database Goes Down
```bash
# Failover to replica
# Update MONGODB_URI to replica endpoint
# Redeploy application
docker-compose restart app
```

### If Application Crashes
```bash
# View logs
docker-compose logs app

# Restart container
docker-compose restart app

# Full restart
docker-compose down
docker-compose up -d
```

### Rollback Procedure
```bash
# Go to previous version
git checkout <previous-commit>

# Rebuild
docker-compose build

# Restart
docker-compose up -d

# Verify
curl http://localhost:3000/api/complaints
```

## Post-Deployment Checklist

- [ ] Application loads without errors
- [ ] Database connectivity verified
- [ ] Authentication system working
- [ ] Complaint submission tested
- [ ] Admin dashboard accessible
- [ ] All endpoints responding properly
- [ ] SSL certificates valid
- [ ] Backups created successfully
- [ ] Monitoring dashboards showing data
- [ ] Team notified of deployment
- [ ] Documentation updated

## Common Production Issues

### High Memory Usage
- Check for memory leaks: `docker stats`
- Restart application
- Increase container memory limit

### Database Connection Issues
- Verify MongoDB connection string
- Check IP whitelist (Atlas)
- Restart MongoDB container
- Check network connectivity

### Slow API Responses
- Review database indices
- Check slow query logs
- Optimize MongoDB aggregations
- Scale application instances

---

For production questions or issues, consult the team and refer to the ARCHITECTURE.md for system design details.
