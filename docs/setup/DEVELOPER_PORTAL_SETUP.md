# Developer Portal Setup Guide

## Overview

Your Developer Portal is a comprehensive self-hosted solution for managing multiple school management system instances. It provides centralized control over school registrations, API access, credit systems, and feature management.

## Architecture

```
Developer Portal (Master Control)
├── School Instance 1 (school123.yourapp.com)
├── School Instance 2 (school456.yourapp.com)
├── School Instance 3 (school789.yourapp.com)
└── ...
```

Each school gets:
- Unique School ID and subdomain
- Dedicated API keys for secure access
- Credit-based document generation limits
- Feature toggles (video portal, parent portal, etc.)
- Usage analytics and audit logging

## Server Requirements

### Minimum Requirements
- **OS**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: 4GB minimum, 8GB recommended
- **CPU**: 2 cores minimum, 4 cores recommended
- **Storage**: 50GB SSD minimum
- **Network**: Static IP with domain access

### Software Requirements
- Node.js 18+ or 20+
- PostgreSQL 14+ (or Supabase)
- Nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

## Database Setup Options

### Option 1: Supabase Cloud (Recommended)

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Create new project
   # Note down: Project URL, API Keys
   ```

2. **Get Database URL**
   ```bash
   # In Supabase dashboard:
   # Settings → Database → Connection string
   # Use "Transaction pooler" connection string
   # Replace [YOUR-PASSWORD] with your database password
   ```

### Option 2: Self-hosted PostgreSQL

1. **Install PostgreSQL**
   ```bash
   sudo apt update
   sudo apt install postgresql postgresql-contrib
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **Create Database and User**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE developer_portal;
   CREATE USER portal_admin WITH PASSWORD 'secure_password_here';
   GRANT ALL PRIVILEGES ON DATABASE developer_portal TO portal_admin;
   \q
   ```

## Server Installation

### 1. System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install process manager
sudo npm install -g pm2

# Create application user
sudo adduser --system --group schoolportal
sudo mkdir -p /var/www/schoolportal
sudo chown schoolportal:schoolportal /var/www/schoolportal
```

### 2. Application Deployment

```bash
# Switch to application user
sudo su - schoolportal

# Clone your repository
cd /var/www/schoolportal
git clone <your-repository-url> .

# Install dependencies
npm install

# Build application
npm run build
```

### 3. Environment Configuration

```bash
# Create production environment file
cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://username:password@host:5432/database_name

# Supabase Configuration (if using Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Security
JWT_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)

# Environment
NODE_ENV=production
PORT=5000

# Optional: Stripe for billing
STRIPE_SECRET_KEY=sk_live_your_stripe_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
EOF

# Secure the environment file
chmod 600 .env
```

### 4. Database Migration

```bash
# Run database migrations
npm run db:push

# Create initial portal admin
node -e "
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function createAdmin() {
  const hash = await bcrypt.hash('your_admin_password_here', 12);
  await pool.query(\`
    INSERT INTO portal_admins (email, password, full_name, role) 
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (email) DO UPDATE SET password = $2
  \`, ['admin@yourdomain.com', hash, 'Portal Administrator', 'super_admin']);
  console.log('Portal admin created successfully');
  process.exit(0);
}

createAdmin().catch(console.error);
"
```

### 5. Process Management

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'school-portal',
    script: 'server/index.ts',
    interpreter: 'npx',
    interpreter_args: 'tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_log: './logs/err.log',
    out_log: './logs/out.log',
    log_log: './logs/combined.log',
    time: true
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Nginx Configuration

```bash
# Install Nginx
sudo apt install nginx

# Create site configuration
sudo tee /etc/nginx/sites-available/schoolportal << EOF
server {
    listen 80;
    server_name yourdomain.com *.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com *.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Main application
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Enable site
sudo ln -s /etc/nginx/sites-available/schoolportal /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d *.yourdomain.com

# Set up auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## DNS Configuration

### Main Domain Setup
```
A Record: yourdomain.com → Your_Server_IP
CNAME: *.yourdomain.com → yourdomain.com
```

### School Subdomain Examples
```
school123.yourdomain.com → Automatically handled by wildcard
school456.yourdomain.com → Automatically handled by wildcard
```

## Security Configuration

### 1. Firewall Setup
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Database Security
```bash
# PostgreSQL security (if self-hosted)
sudo -u postgres psql
ALTER USER portal_admin WITH PASSWORD 'new_secure_password';
\q

# Update connection limits
sudo nano /etc/postgresql/14/main/postgresql.conf
# max_connections = 100
# shared_buffers = 256MB
```

### 3. Application Security
```bash
# Regular security updates
sudo apt update && sudo apt upgrade

# Monitor logs
sudo journalctl -u nginx -f
pm2 logs school-portal
```

## API Usage Examples

### 1. School Registration API
```bash
# Create new school instance
curl -X POST https://yourdomain.com/api/portal/schools \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Example High School",
    "contactEmail": "admin@exampleschool.edu",
    "planType": "pro"
  }'
```

### 2. School API Access
```bash
# Each school gets unique API keys
curl -X GET https://school123.yourdomain.com/api/school/info \
  -H "X-API-Key: pk_school_api_key_here"
```

### 3. Credit Management
```bash
# Add credits to school
curl -X POST https://yourdomain.com/api/portal/schools/1/credits \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "type": "purchase",
    "amount": 1000,
    "description": "Monthly credit allocation"
  }'
```

## Monitoring and Maintenance

### 1. Application Monitoring
```bash
# PM2 monitoring
pm2 monit

# Check application status
pm2 status
pm2 logs school-portal

# Restart if needed
pm2 restart school-portal
```

### 2. Database Monitoring
```bash
# Check database size
psql $DATABASE_URL -c "
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
```

### 3. Log Management
```bash
# Rotate logs
sudo logrotate -f /etc/logrotate.d/nginx

# Clean old PM2 logs
pm2 flush
```

## Backup Strategy

### 1. Database Backup
```bash
# Create backup script
cat > /home/schoolportal/backup.sh << EOF
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL | gzip > /backup/db_backup_\$DATE.sql.gz
find /backup -name "db_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /home/schoolportal/backup.sh

# Schedule daily backups
sudo crontab -e
# Add: 0 2 * * * /home/schoolportal/backup.sh
```

### 2. Application Backup
```bash
# Backup application files
tar -czf /backup/app_backup_$(date +%Y%m%d).tar.gz /var/www/schoolportal
```

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancer (HAProxy/Nginx)
- Database clustering (PostgreSQL replication)
- Redis for session storage

### 2. Performance Optimization
- Enable Nginx caching
- Database connection pooling
- CDN for static assets

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check database status
   sudo systemctl status postgresql
   # Verify connection string in .env
   ```

2. **Application Won't Start**
   ```bash
   # Check PM2 logs
   pm2 logs school-portal
   # Verify environment variables
   ```

3. **SSL Certificate Issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   # Check certificate status
   sudo certbot certificates
   ```

## Support and Updates

### Regular Maintenance
1. Weekly: Check application logs and performance
2. Monthly: Update dependencies and security patches
3. Quarterly: Database optimization and cleanup

### Update Process
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Run migrations
npm run db:push

# Restart application
pm2 restart school-portal
```

## Portal Access

Once deployed, access your Developer Portal at:
- **Portal Dashboard**: https://yourdomain.com/portal
- **Login**: admin@yourdomain.com / your_admin_password
- **API Documentation**: https://yourdomain.com/api/docs (if implemented)

Your Developer Portal is now ready to manage multiple school management system instances with full control over features, credits, and access management.