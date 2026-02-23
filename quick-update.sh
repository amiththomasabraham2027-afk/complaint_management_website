#!/bin/bash
# Update docker containers without full rebuild (faster deployments)

set -e

SSH_KEY_PATH="${1:-.}/Complaint_manage.pem"
SERVER_USER="${2:-ubuntu}"
SERVER_HOST="${3:-13.200.254.173}"

echo "Starting quick update..."

ssh -i "$SSH_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_HOST" << 'REMOTE_COMMANDS'

cd ~/complaint-app

echo "Pulling latest code..."
git pull origin main

echo "Restarting containers..."
docker-compose -f docker-compose.prod.yml restart complaint-app

echo "Waiting for app to be ready..."
for i in {1..30}; do
    if curl -f http://localhost:3000 >/dev/null 2>&1; then
        echo "✓ Application is healthy"
        break
    fi
    echo "Attempt $i/30..."
    sleep 2
done

echo "Status:"
docker-compose -f docker-compose.prod.yml ps

REMOTE_COMMANDS

echo "✅ Update completed!"
