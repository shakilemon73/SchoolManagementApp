# Super Admin Panel - Standalone Deployment Guide

This guide will help you deploy the Super Admin Panel as a separate application that your users can access independently.

## Overview

The Super Admin Panel is a comprehensive multi-tenant control system for managing your school management platform. It includes:

- **Real-time Dashboard** - System overview with live metrics
- **Multi-tenant School Management** - Register and control multiple schools
- **User Management** - Control all users across all schools
- **Feature Toggles** - Enable/disable features per school
- **Template Management** - Control document templates
- **Credit & Billing System** - Manage payments and usage limits
- **Analytics & Monitoring** - System health and performance tracking

## Deployment Options

### Option 1: Separate Server Deployment

1. **Create a new project directory:**
```bash
mkdir super-admin-panel
cd super-admin-panel
```

2. **Initialize the project:**
```bash
npm init -y
```

3. **Install dependencies:**
```bash
npm install express cors dotenv
npm install typescript tsx @types/node @types/express --save-dev
```

### Option 2: Subdomain Deployment

Deploy at `admin.yourdomain.com` with the same codebase but separate entry point.

### Option 3: Docker Container

Create a containerized version for easy deployment across different environments.

## Environment Configuration

Create a `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/school_management

# Server Configuration
PORT=3001
NODE_ENV=production

# Admin Authentication
ADMIN_JWT_SECRET=your-super-secret-key
ADMIN_SESSION_SECRET=another-secret-key

# Supabase Configuration (if using)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key

# CORS Origins (your main app domains)
ALLOWED_ORIGINS=https://yourapp.com,https://www.yourapp.com
```

## Security Configuration

### 1. Database Access
- Use read-only database user for analytics
- Separate admin database user with limited permissions
- Enable row-level security in PostgreSQL

### 2. Authentication
- Implement separate JWT tokens for super admin
- Use strong session management
- Add IP allowlisting for admin access

### 3. API Security
- Rate limiting on all endpoints
- Request validation and sanitization
- Audit logging for all admin actions

## File Structure for Standalone Deployment

```
super-admin-panel/
├── src/
│   ├── server/
│   │   ├── index.ts          # Main server file
│   │   ├── auth.ts           # Admin authentication
│   │   ├── routes/
│   │   │   ├── schools.ts    # School management
│   │   │   ├── users.ts      # User management
│   │   │   ├── analytics.ts  # Analytics & reporting
│   │   │   ├── templates.ts  # Template management
│   │   │   └── credits.ts    # Credit system
│   │   └── middleware/
│   │       ├── auth.ts       # Auth middleware
│   │       └── validation.ts # Request validation
│   ├── client/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── components/   # React components
│   │   │   ├── pages/        # Admin pages
│   │   │   └── utils/        # Helper functions
│   │   └── package.json
├── database/
│   ├── migrations/           # Database migrations
│   └── seeds/               # Initial data
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
└── package.json
```

## Database Schema Extensions

Add these tables for super admin functionality:

```sql
-- Super admin users table
CREATE TABLE super_admins (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin sessions table
CREATE TABLE admin_sessions (
  id VARCHAR(255) PRIMARY KEY,
  admin_id INTEGER REFERENCES super_admins(id),
  data JSONB,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  admin_id INTEGER REFERENCES super_admins(id),
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100),
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE feature_flags (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- School feature settings
CREATE TABLE school_feature_settings (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES schools(id),
  feature_flag_id INTEGER REFERENCES feature_flags(id),
  is_enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(school_id, feature_flag_id)
);
```

## Deployment Steps

### 1. Build the Application
```bash
npm run build
```

### 2. Set up Process Manager (PM2)
```bash
npm install -g pm2
pm2 start dist/server/index.js --name "super-admin-panel"
pm2 startup
pm2 save
```

### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name admin.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 4. SSL Certificate
```bash
sudo certbot --nginx -d admin.yourdomain.com
```

## Access Control

### Default Super Admin Creation
```bash
npm run create-super-admin
# Will prompt for email, username, and password
```

### User Access Levels
1. **Super Admin** - Full system access
2. **Regional Admin** - Multiple schools in region
3. **Support** - Read-only access with limited controls
4. **Audit** - Analytics and reporting only

## Monitoring & Alerts

### Health Checks
- Database connectivity
- API response times
- System resource usage
- Active user sessions

### Alerts Configuration
- Email notifications for system issues
- Slack integration for critical alerts
- SMS alerts for downtime

## Backup & Recovery

### Database Backups
```bash
# Daily automated backups
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Application Backups
- Code repository backups
- Configuration file backups
- SSL certificate backups

## Performance Optimization

### Database Optimization
- Connection pooling
- Query optimization
- Index management
- Read replicas for analytics

### Caching Strategy
- Redis for session management
- API response caching
- Static asset caching

## Security Checklist

- [ ] Strong password requirements
- [ ] Two-factor authentication
- [ ] IP allowlisting
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure headers
- [ ] Regular security audits

## Maintenance

### Regular Tasks
- Update dependencies
- Monitor system metrics
- Review audit logs
- Backup verification
- Security patches
- Performance optimization

### Monthly Reviews
- User access audit
- System performance review
- Security assessment
- Backup testing
- Documentation updates

## Support & Documentation

### API Documentation
Auto-generated API docs available at `/api/docs`

### User Manual
Comprehensive user guide for all admin features

### Technical Support
- Issue tracking system
- Emergency contact procedures
- Escalation procedures