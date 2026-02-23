#!/bin/bash
# Setup environment variables for automated deployment

set -e

echo "=========================================="
echo "🔐 Deployment Configuration Setup"
echo "=========================================="
echo ""

if [ -f .env.local ]; then
    read -p "❓ .env.local exists. Update? (y/n) " -n 1 -r
    echo
    [[ ! $REPLY =~ ^[Yy]$ ]] && source .env.local && exit 0
fi

echo "Please provide the following secrets:"
echo ""

read -p "GitHub Personal Access Token: " GITHUB_TOKEN
[ -z "$GITHUB_TOKEN" ] && echo "❌ Token required" && exit 1

echo ""
read -p "MongoDB URI: " MONGODB_URI
[ -z "$MONGODB_URI" ] && echo "❌ URI required" && exit 1

echo ""
read -p "JWT Secret (Enter to generate): " JWT_SECRET
[ -z "$JWT_SECRET" ] && JWT_SECRET=$(openssl rand -base64 32) && echo "Generated: $JWT_SECRET"

echo ""
read -p "NextAuth Secret (Enter to generate): " NEXTAUTH_SECRET
[ -z "$NEXTAUTH_SECRET" ] && NEXTAUTH_SECRET=$(openssl rand -base64 32) && echo "Generated: $NEXTAUTH_SECRET"

cat > .env.local << EOF
export GITHUB_TOKEN='$GITHUB_TOKEN'
export MONGODB_URI='$MONGODB_URI'
export JWT_SECRET='$JWT_SECRET'
export NEXTAUTH_SECRET='$NEXTAUTH_SECRET'
export AWS_REGION='ap-south-1'
EOF

grep -q ".env.local" .gitignore 2>/dev/null || echo ".env.local" >> .gitignore
chmod 600 .env.local

echo ""
echo "✅ Configuration saved to .env.local"
echo ""
echo "To deploy, run:"
echo "  source .env.local"
echo "  python auto_deploy.py"
