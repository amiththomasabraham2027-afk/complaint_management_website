#!/bin/bash
# View application logs from EC2

set -e

SSH_KEY_PATH="${1:-.}/Complaint_manage.pem"
SERVER_USER="${2:-ubuntu}"
SERVER_HOST="${3:-13.200.254.173}"
LINES="${4:-50}"

echo "Fetching logs from $SERVER_USER@$SERVER_HOST (last $LINES lines)..."

ssh -i "$SSH_KEY_PATH" \
    -o StrictHostKeyChecking=no \
    "$SERVER_USER@$SERVER_HOST" \
    "cd ~/complaint-app && docker-compose -f docker-compose.prod.yml logs --tail=$LINES $5"
