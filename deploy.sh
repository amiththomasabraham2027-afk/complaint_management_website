#!/bin/bash
# Deploy script for AWS EC2 using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY_PATH="${1:-.}/Complaint_manage.pem"
SERVER_USER="${2:-ubuntu}"
SERVER_HOST="${3:-13.200.254.173}"
DEPLOYMENT_DIR="~/complaint-app"
GITHUB_REPO="https://github.com/amiththomasabraham2027-afk/complaint_management_website.git"

# Validation
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${RED}❌ Error: SSH key not found at $SSH_KEY_PATH${NC}"
    exit 1
fi

echo -e "${YELLOW}Starting deployment...${NC}"
echo -e "SSH Key: $SSH_KEY_PATH"
echo -e "Server: $SERVER_USER@$SERVER_HOST"
echo -e "Deployment Dir: $DEPLOYMENT_DIR"

# Check SSH connectivity
echo -e "${YELLOW}Testing SSH connection...${NC}"
if ! ssh -i "$SSH_KEY_PATH" -o ConnectTimeout=5 -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'" >/dev/null 2>&1; then
    echo -e "${RED}❌ Failed to connect to server via SSH${NC}"
    exit 1
fi
echo -e "${GREEN}✓ SSH connection successful${NC}"

# Run deployment commands
echo -e "${YELLOW}Deploying application...${NC}"

ssh -i "$SSH_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_HOST" << 'REMOTE_COMMANDS'

set -e
. $HOME/.profile
. $HOME/.bashrc

echo "=== Deployment Started at $(date) ==="

# Create deployment directory
mkdir -p ~/complaint-app
cd ~/complaint-app

# Clone or update repository
if [ -d .git ]; then
    echo "Updating existing repository..."
    git pull origin main
else
    echo "Cloning repository..."
    git clone https://github.com/amiththomasabraham2027-afk/complaint_management_website.git .
fi

# Ensure Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo bash get-docker.sh
fi

# Add user to docker group
sudo usermod -aG docker $USER || true

# Ensure docker daemon is running
sudo systemctl start docker || true

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo "Creating .env.production..."
    cat > .env.production << 'EOF'
NODE_ENV=production
MONGODB_URI=mongodb://admin:production@mongodb:27017/resolvex?authSource=admin
JWT_SECRET=change-this-secret-in-production
JWT_EXPIRE=7d
NEXTAUTH_SECRET=change-this-nextauth-secret-in-production
NEXTAUTH_URL=http://13.200.254.173:3000
NEXT_PUBLIC_API_URL=http://13.200.254.173/api
EOF
    echo "⚠️  Please update .env.production with actual secrets!"
fi

# Build and start containers
echo "Building Docker image..."
docker build -t complaint-app:latest .

echo "Starting containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans || true
docker-compose -f docker-compose.prod.yml up -d

# Wait for application to be healthy
echo "Waiting for application to be ready..."
for i in {1..60}; do
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "✓ Application is healthy!"
        break
    fi
    if [ $i -eq 60 ]; then
        echo "❌ Application failed to start"
        docker-compose -f docker-compose.prod.yml logs
        exit 1
    fi
    echo "Waiting... ($i/60)"
    sleep 2
done

# Show status
echo ""
echo "=== Deployment Status ==="
docker-compose -f docker-compose.prod.yml ps
echo ""
echo "=== Container Logs (last 20 lines) ==="
docker-compose -f docker-compose.prod.yml logs --tail=20
echo ""
echo "=== Deployment Complete ==="
echo "Application URL: http://13.200.254.173:3000"

REMOTE_COMMANDS

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "Access your application at: http://$SERVER_HOST:3000"
