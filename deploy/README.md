# EZM0.5 – Run on Amazon (EC2)

Scripts to run the Next.js app on an Amazon EC2 instance (Amazon Linux 2, Amazon Linux 2023, or Ubuntu).

## 1. One-time server setup (on the EC2 instance)

SSH into your instance, then run:

```bash
# Clone or upload the project, then from project root:
bash deploy/setup-server.sh
```

This installs:

- Node.js 20 LTS  
- PM2 (process manager)  
- Opens firewall for HTTP/HTTPS (if firewalld/ufw is used; otherwise rely on Security Groups)

## 2. Environment variables

On the server, create `.env` from the example and set real values:

```bash
cp env.example .env
# Edit .env: DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, SMTP_*
```

Generate a secret:

```bash
openssl rand -base64 32
# Put result in NEXTAUTH_SECRET
```

## 3. Build and start the app

From the project root on the server:

```bash
npm ci
npx prisma generate
npm run build
bash deploy/start.sh
```

Or use PM2 directly:

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup   # follow the printed command to enable on boot
```

## 4. Optional: Nginx reverse proxy

To serve on port 80/443 with SSL, install nginx and use `deploy/nginx-ezm.conf` as a vhost template. Point `proxy_pass` to `http://127.0.0.1:3000` (Next.js default port).

## 5. EC2 Security Group

Allow inbound:

- **22** – SSH  
- **80** – HTTP  
- **443** – HTTPS  
- **3000** – Only if you are not using Nginx and want to access the app directly (not recommended for production)

## Useful commands

| Action              | Command                    |
|---------------------|----------------------------|
| Start app           | `pm2 start ecosystem.config.cjs` |
| Stop app            | `pm2 stop ezm`             |
| Restart app         | `pm2 restart ezm`          |
| View logs           | `pm2 logs ezm`             |
| Status              | `pm2 status`               |
| Persist after reboot| `pm2 save && pm2 startup`  |
