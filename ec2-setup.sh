#!/bin/bash

# =============================================================
# AWS EC2 Automated Setup Script for Complaint Management App
# =============================================================
# This script fully automates EC2 setup with Docker, Docker Compose,
# and all prerequisites for CI/CD deployment

set -e

echo ""
echo "=========================================="
echo "🚀 EC2 Automated Setup Script"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_step() {
    echo -e "${YELLOW}→ $1${NC}"
}

# ============================================================
# Step 1: System Updates
# ============================================================
print_header "Step 1: System Updates"

print_step "Updating package manager..."
sudo apt-get update -y
sudo apt-get upgrade -y
print_success "System updated"

# ============================================================
# Step 2: Install Prerequisites
# ============================================================
print_header "Step 2: Installing Prerequisites"

print_step "Installing curl, git, wget..."
sudo apt-get install -y \
    curl \
    git \
    wget \
    ca-certificates \
    gnupg \
    lsb-release

print_success "Prerequisites installed"

# ============================================================
# Step 3: Install Docker
# ============================================================
print_header "Step 3: Installing Docker Engine"

print_step "Removing old Docker installations..."
sudo apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

print_step "Adding Docker GPG key..."
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

print_step "Adding Docker repository..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
    sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

print_step "Installing Docker & Docker Compose..."
sudo apt-get update
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-compose-plugin

print_success "Docker installed"

# ============================================================
# Step 4: Configure Docker User
# ============================================================
print_header "Step 4: Configuring Docker User"

print_step "Adding ubuntu user to docker group..."
sudo usermod -aG docker ubuntu

print_success "Docker group configured"

# ============================================================
# Step 5: Enable Docker Services
# ============================================================
print_header "Step 5: Enabling Services"

print_step "Enabling Docker..."
sudo systemctl enable docker
sudo systemctl start docker

print_step "Restarting Docker..."
sudo systemctl restart docker

print_success "Services enabled and running"

# ============================================================
# Step 6: Verify Installation
# ============================================================
print_header "Step 6: Verification"

print_step "Checking Docker version..."
docker --version

print_step "Checking Docker Compose version..."
docker compose version

print_step "Testing Docker daemon..."
docker run --rm hello-world > /dev/null 2>&1 && print_success "Docker daemon working" || echo "❌ Docker test failed"

# ============================================================
# Step 7: Create Deployment Directory
# ============================================================
print_header "Step 7: Preparing Deployment Directory"

print_step "Creating ~/complaint-app directory..."
mkdir -p ~/complaint-app
mkdir -p ~/complaint-app/nginx

print_success "Deployment directory ready"

# ============================================================
# Step 8: System Configuration
# ============================================================
print_header "Step 8: System Configuration"

print_step "Setting up log rotation..."
sudo tee /etc/logrotate.d/docker-app > /dev/null <<EOF
/var/lib/docker/containers/*/*.log {
    max-size 10m
    max-file 3
    rotate 5
    missingok
    delaycompress
    copytruncate
}
EOF

print_success "Log rotation configured"

# ============================================================
# Final Status
# ============================================================
print_header "✅ EC2 Setup Complete!"

echo ""
echo "📋 System Information:"
echo "  OS: $(lsb_release -d | cut -f2)"
echo "  Docker: $(docker --version)"
echo "  Docker Compose: $(docker compose version --short)"
echo ""
echo "📂 Deployment Directory: ~/complaint-app"
echo ""
echo "🎯 Next Steps:"
echo "  1. GitHub should have already pushed deployment code"
echo "  2. Next push to GitHub will trigger automatic deployment"
echo "  3. Check containers: docker ps"
echo "  4. Check logs: docker logs complaint-app"
echo ""
echo "=========================================="
echo ""
