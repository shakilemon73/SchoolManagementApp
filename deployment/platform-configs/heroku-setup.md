# Heroku Deployment Guide

## Quick Deploy Button
[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

## Manual Deployment Steps

### 1. Prerequisites
- Heroku CLI installed
- Git repository 
- Supabase account with database

### 2. Create Heroku App
```bash
heroku create your-school-management-app
```

### 3. Set Environment Variables
```bash
heroku config:set DATABASE_URL="postgresql://username:password@host:port/database"
heroku config:set SUPABASE_URL="https://your-project.supabase.co"
heroku config:set SUPABASE_ANON_KEY="your_anon_key"
heroku config:set SESSION_SECRET="your-32-char-secret"
heroku config:set NODE_ENV="production"
```

### 4. Deploy
```bash
git push heroku main
```

### 5. Scale and Monitor
```bash
heroku ps:scale web=1
heroku logs --tail
heroku open
```

## Health Check
- Health endpoint: `https://your-app.herokuapp.com/api/health`
- Full health: `https://your-app.herokuapp.com/api/system/health`

## Post-Deploy Checklist
- [ ] Application loads successfully
- [ ] Database connection working
- [ ] Authentication functional
- [ ] All APIs responding
- [ ] Document generation working