#!/usr/bin/env bash
# Build and start EZM0.5 on Amazon server (production).
# Run from project root: bash deploy/start.sh
# Or use PM2: pm2 start ecosystem.config.cjs

set -e

cd "$(dirname "$0")/.."
APP_ROOT=$(pwd)

echo "==> Building EZM0.5..."
npm run build

echo "==> Prisma generate (if needed)..."
npx prisma generate

# Create logs dir for PM2 if using ecosystem.config.cjs
mkdir -p logs

if command -v pm2 &>/dev/null; then
  echo "==> Starting with PM2..."
  pm2 delete ezm 2>/dev/null || true
  pm2 start ecosystem.config.cjs
  echo "==> Run 'pm2 save' and 'pm2 startup' to persist across reboots."
else
  echo "==> Starting with npm (no PM2)..."
  export NODE_ENV=production
  exec npm run start
fi
