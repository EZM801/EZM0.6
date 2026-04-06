#!/usr/bin/env bash
# EZM0.5 - One-time Amazon Linux 2 / Amazon Linux 2023 / Ubuntu EC2 setup
# Run as: bash deploy/setup-server.sh
# Optional: run with sudo for system-wide Node/PM2, or without for user install

set -e

echo "==> EZM0.5 Amazon server setup"

# Detect OS
if [ -f /etc/os-release ]; then
  . /etc/os-release
  OS=$ID
  VER=$VERSION_ID
else
  echo "Cannot detect OS. Supported: Amazon Linux 2, Amazon Linux 2023, Ubuntu."
  exit 1
fi

# Install Node.js 20 LTS (Amazon Linux 2/2023 or Ubuntu)
install_node() {
  if command -v node &>/dev/null; then
    NODE_VER=$(node -v)
    echo "Node.js already installed: $NODE_VER"
    return
  fi

  if [ "$OS" = "amzn" ]; then
    echo "==> Installing Node.js 20 (Amazon Linux)"
    curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
    sudo yum install -y nodejs
  elif [ "$OS" = "ubuntu" ]; then
    echo "==> Installing Node.js 20 (Ubuntu)"
    sudo apt-get update -qq
    sudo apt-get install -y ca-certificates curl gnupg
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
  else
    echo "Unsupported OS: $OS. Install Node.js 20 manually."
    exit 1
  fi
}

# Install PM2 globally for process management
install_pm2() {
  if command -v pm2 &>/dev/null; then
    echo "PM2 already installed: $(pm2 -v)"
    return
  fi
  echo "==> Installing PM2"
  sudo npm install -g pm2
  pm2 startup | tail -1
}

# Optional: open firewall for HTTP/HTTPS (adjust if using Security Groups only)
setup_firewall() {
  if command -v firewall-cmd &>/dev/null; then
    echo "==> Opening firewall for HTTP/HTTPS (firewalld)"
    sudo firewall-cmd --permanent --add-service=http 2>/dev/null || true
    sudo firewall-cmd --permanent --add-service=https 2>/dev/null || true
    sudo firewall-cmd --reload 2>/dev/null || true
  elif command -v ufw &>/dev/null; then
    echo "==> Opening firewall for HTTP/HTTPS (ufw)"
    sudo ufw allow 22
    sudo ufw allow 80
    sudo ufw allow 443
    sudo ufw --force enable 2>/dev/null || true
  else
    echo "No firewalld/ufw found. Ensure EC2 Security Group allows inbound 80, 443, 22."
  fi
}

install_node
install_pm2
setup_firewall

echo ""
echo "==> Setup complete. Next steps:"
echo "  1. Copy your project to this server (e.g. git clone or rsync)."
echo "  2. Create .env from .env.example and set DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, SMTP_*."
echo "  3. In project root: npm ci && npx prisma generate && npm run build"
echo "  4. Start app: npm run deploy:start  (or: pm2 start ecosystem.config.cjs)"
echo "  5. Save PM2 process list: pm2 save"
echo ""
