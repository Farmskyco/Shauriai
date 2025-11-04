# Deployment Guide - AI Agronomic Chatbot

This guide provides step-by-step instructions for deploying the chatbot to production in Kenya.

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Server Setup](#server-setup)
3. [Africa's Talking Configuration](#africas-talking-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [SSL/HTTPS Setup](#sslhttps-setup)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Scaling](#scaling)

## Pre-Deployment Checklist

### Required Accounts & Credentials

- [ ] Africa's Talking account with toll-free number
- [ ] Anthropic API key for Claude
- [ ] Azure Cognitive Services account (Speech)
- [ ] OpenWeather API key
- [ ] Domain name with DNS access
- [ ] Server (VPS/Cloud) with public IP
- [ ] M-Pesa integration (optional for payments)

### Recommended Server Specifications

**Minimum (Testing/Small Scale)**
- 2 vCPU
- 4 GB RAM
- 50 GB SSD
- Ubuntu 22.04 LTS

**Production (100+ concurrent calls)**
- 4 vCPU
- 8 GB RAM
- 100 GB SSD
- Load balancer
- Auto-scaling

**Recommended Providers in Kenya**
- AWS (Africa - Cape Town region)
- Google Cloud Platform
- Digital Ocean
- Linode
- Local: Liquid Intelligent Technologies, Safaricom Cloud

## Server Setup

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git build-essential

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install PostgreSQL

```bash
# Install PostgreSQL 14
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL console:

```sql
CREATE DATABASE agronomic_chatbot;
CREATE USER chatbot_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE agronomic_chatbot TO chatbot_user;
\q
```

### 3. Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Configure Redis for production
sudo nano /etc/redis/redis.conf

# Set maxmemory policy
# maxmemory 256mb
# maxmemory-policy allkeys-lru

# Start and enable Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test Redis
redis-cli ping
# Should respond: PONG
```

### 4. Install Nginx (Reverse Proxy)

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Africa's Talking Configuration

### 1. Get Toll-Free Number

1. Log in to Africa's Talking dashboard
2. Go to **Voice** > **Numbers**
3. Request a toll-free number for Kenya
4. Wait for approval (usually 1-3 business days)

### 2. Configure Voice API

1. Go to **Voice** > **Settings**
2. Set **Voice Callback URL**: `https://your-domain.com/webhooks/at/voice`
3. Enable **Recording**
4. Set **Recording Callback URL**: `https://your-domain.com/webhooks/at/recording-complete`
5. Save settings

### 3. Configure SMS API

1. Go to **SMS** > **Settings**
2. Note your **Sender ID** (short code)
3. Top up account with credits

### 4. Test Configuration

```bash
# Test voice API
curl -X POST https://your-domain.com/webhooks/health
# Should return: {"status": "ok"}
```

## Database Setup

### 1. Clone Application

```bash
# Create application directory
sudo mkdir -p /var/www/agronomic-chatbot
cd /var/www/agronomic-chatbot

# Clone repository
sudo git clone <your-repo-url> .

# Set permissions
sudo chown -R $USER:$USER /var/www/agronomic-chatbot
```

### 2. Install Dependencies

```bash
# Install Node packages
npm install

# Build TypeScript
npm run build
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit with production values
nano .env
```

**Production .env Example:**

```env
NODE_ENV=production
PORT=3000
HOST=localhost

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=agronomic_chatbot
DB_USER=chatbot_user
DB_PASSWORD=your_secure_password

# Redis
REDIS_URL=redis://localhost:6379

# Africa's Talking
AT_USERNAME=your_username
AT_API_KEY=your_production_api_key
AT_SHORT_CODE=your_shortcode

# Claude AI
ANTHROPIC_API_KEY=sk-ant-xxx

# Azure Speech
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=southafricanorth

# Weather
OPENWEATHER_API_KEY=your_weather_key

# Application
BASE_URL=https://your-domain.com
WEBHOOK_URL=https://your-domain.com/webhooks/at
LOG_LEVEL=info
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Seed Database

```bash
ts-node src/database/seed.ts
```

## Application Deployment

### 1. Install PM2 (Process Manager)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start application
pm2 start dist/index.js --name agronomic-chatbot

# Configure PM2 to start on boot
pm2 startup systemd
pm2 save
```

### 2. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/agronomic-chatbot
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /audio/ {
        alias /var/www/agronomic-chatbot/audio_cache/;
        expires 1h;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/agronomic-chatbot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Free)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is configured automatically
# Test renewal
sudo certbot renew --dry-run
```

## Monitoring & Maintenance

### 1. Monitor Application

```bash
# View application logs
pm2 logs agronomic-chatbot

# Monitor resources
pm2 monit

# Application status
pm2 status
```

### 2. Set Up Log Rotation

```bash
sudo nano /etc/logrotate.d/agronomic-chatbot
```

Add:

```
/var/www/agronomic-chatbot/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 3. Database Backups

```bash
# Create backup script
sudo nano /usr/local/bin/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/agronomic-chatbot"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U chatbot_user agronomic_chatbot | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
```

Make executable and schedule:

```bash
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-db.sh
```

### 4. Monitoring Tools

**Install monitoring stack:**

```bash
# Install Node.js monitoring
npm install -g pm2-prometheus-exporter

# Or use external services:
# - Datadog
# - New Relic
# - Sentry (for error tracking)
```

## Scaling

### Horizontal Scaling (Multiple Instances)

**1. Set up Load Balancer**

Update Nginx configuration:

```nginx
upstream agronomic_backend {
    least_conn;
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://agronomic_backend;
        # ... rest of proxy settings
    }
}
```

**2. Start Multiple Instances**

```bash
pm2 start dist/index.js -i 4 --name agronomic-chatbot
```

### Database Scaling

**Read Replicas:**

```bash
# Configure PostgreSQL replication
# Update connection pooling in application
```

### Caching Strategy

```bash
# Use Redis for:
# - Session storage (already configured)
# - Weather data caching
# - Common TTS audio caching
# - Market price caching
```

## Troubleshooting

### Check Application Status

```bash
pm2 status
pm2 logs --lines 100
```

### Check Nginx Status

```bash
sudo systemctl status nginx
sudo nginx -t
tail -f /var/log/nginx/error.log
```

### Check Database Connection

```bash
psql -U chatbot_user -d agronomic_chatbot -h localhost
```

### Test Webhooks

```bash
curl -X POST https://your-domain.com/webhooks/health
```

## Security Checklist

- [ ] Firewall configured (only ports 80, 443, 22 open)
- [ ] SSH key-based authentication
- [ ] Database not exposed to internet
- [ ] Environment variables secured
- [ ] SSL/HTTPS enabled
- [ ] Regular security updates
- [ ] Webhook signature verification
- [ ] Rate limiting enabled
- [ ] DDoS protection (Cloudflare)

## Kenya-Specific Considerations

### Network Reliability

- Implement retry logic for API calls
- Use Africa's Talking's Kenya infrastructure
- Consider local CDN (e.g., Cloudflare)

### Payment Integration

For M-Pesa integration:
1. Register for Safaricom M-Pesa API
2. Implement STK Push for payments
3. Handle M-Pesa callbacks

### Compliance

- Register with Data Protection Commissioner (Kenya)
- Comply with Kenya Data Protection Act (2019)
- Terms of Service in local languages
- Privacy policy

## Support

For deployment assistance, contact:
- Africa's Talking Support: support@africastalking.com
- Technical issues: [Create an issue]

## Maintenance Schedule

- **Daily**: Check logs and error rates
- **Weekly**: Review system metrics
- **Monthly**: Security updates, dependency updates
- **Quarterly**: Disaster recovery testing

---

**Last Updated**: 2025
**Version**: 1.0.0
