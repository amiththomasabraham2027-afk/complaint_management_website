#!/bin/bash
# Setup EC2 instance with Docker and prerequisites

set -e

SSH_KEY_PATH="${1:-.}/Complaint_manage.pem"
SERVER_USER="${2:-ubuntu}"
SERVER_HOST="${3:-13.200.254.173}"

echo "Setting up EC2 instance..."

ssh -i "$SSH_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_HOST" << 'REMOTE_COMMANDS'

set -e

echo "=== EC2 Setup Started ==="
echo "User: $(whoami)"
echo "Hostname: $(hostname)"
echo "Ubuntu version: $(lsb_release -d)"

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Docker
echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
    sudo bash /tmp/get-docker.sh
    rm /tmp/get-docker.sh
fi

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
echo "Configuring Docker group permissions..."
sudo usermod -aG docker $USER
sudo systemctl restart docker

# Install other useful tools
echo "Installing additional tools..."
sudo apt-get install -y \
    git \
    curl \
    wget \
    htop \
    net-tools \
    build-essential

# Setup directories
echo "Creating application directories..."
mkdir -p ~/complaint-app
mkdir -p ~/backups

# Install fail2ban for security
echo "Installing fail2ban..."
sudo apt-get install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Create swap space (recommended for small instances)
echo "Creating swap space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 2G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Configure firewall
echo "Configuring UFW firewall..."
sudo apt-get install -y ufw
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw --force enable

echo ""
echo "=== EC2 Setup Complete ==="
echo "Docker version: $(docker --version)"
echo "Docker Compose version: $(docker-compose --version)"
echo ""
echo "Next steps:"
echo "1. Run: ./deploy.sh"
echo "2. Access app at: http://$(hostname -I | awk '{print $1}'):3000"
echo ""

REMOTE_COMMANDS

echo "✅ EC2 instance setup completed!"
