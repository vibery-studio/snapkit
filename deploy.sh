#!/bin/bash
# Deploy SnapKit to VPS (51.79.176.217)
# Usage: ./deploy.sh

set -e

SERVER="ubuntu@51.79.176.217"
APP_DIR="/opt/snapkit"

echo "=== Pushing to GitHub ==="
git push origin main

echo "=== Syncing brands assets ==="
rsync -avz --delete brands/ $SERVER:$APP_DIR/brands/

echo "=== Building on server ==="
ssh -o ServerAliveInterval=5 $SERVER "cd $APP_DIR && git pull && docker build -t snapkit:latest ."

echo "=== Restarting container ==="
ssh -o ServerAliveInterval=5 $SERVER "docker rm -f snapkit 2>/dev/null; docker run -d --name snapkit \
  --network dokploy-network \
  -v $APP_DIR/brands:/app/brands \
  -v /opt/snapkit-data:/app/data \
  --restart unless-stopped \
  --label 'traefik.enable=true' \
  --label 'traefik.http.routers.snapkit.rule=Host(\`snapkit.vibery.app\`)' \
  --label 'traefik.http.routers.snapkit.entrypoints=websecure' \
  --label 'traefik.http.routers.snapkit.tls.certresolver=letsencrypt' \
  --label 'traefik.http.services.snapkit.loadbalancer.server.port=8080' \
  snapkit:latest"

echo "=== Verifying ==="
sleep 3
STATUS=$(curl -sk -o /dev/null -w "%{http_code}" https://snapkit.vibery.app/api/sizes)
if [ "$STATUS" = "200" ]; then
  echo "Deploy OK — https://snapkit.vibery.app"
else
  echo "Deploy FAILED (status: $STATUS)"
  ssh $SERVER "docker logs snapkit 2>&1 | tail -10"
  exit 1
fi
