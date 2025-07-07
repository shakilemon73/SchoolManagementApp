# Deployment Guide for School Management System

## Render.com Deployment

### 1. Environment Variables Setup

Set these environment variables in your Render dashboard:

**Required:**
- `NODE_ENV`: `production`
- `DATABASE_URL`: Your PostgreSQL connection string
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Your Supabase service key
- `SESSION_SECRET`: A secure random string for session encryption

**Optional:**
- `SMTP_HOST`: Email server hostname
- `SMTP_PORT`: Email server port
- `SMTP_USER`: Email username
- `SMTP_PASS`: Email password
- `STRIPE_SECRET_KEY`: Stripe secret key for payments
- `SSLCOMMERZ_STORE_ID`: SSLCommerz store ID
- `SSLCOMMERZ_STORE_PASSWORD`: SSLCommerz store password

### 2. Build and Deploy Settings

**Build Command:**
```bash
node build.js
```

**Start Command:**
```bash
node start.js
```

### 3. Database Setup

Your PostgreSQL database should be accessible via the `DATABASE_URL` environment variable. The application will automatically:
- Create necessary tables
- Run migrations
- Seed initial data

### 4. Deployment Steps

1. **Connect your repository** to Render
2. **Set environment variables** in Render dashboard
3. **Configure build settings**:
   - Build Command: `node build.js`
   - Start Command: `node start.js`
4. **Deploy** - Render will automatically build and deploy your app

### 5. Post-Deployment Verification

After deployment, verify:
- App loads without errors
- Database connection works
- Authentication system functions
- Document generation works
- All API endpoints respond correctly

### 6. Common Issues and Solutions

**Issue: WebSocket connection errors**
- Solution: The app is configured to work without WebSockets in production

**Issue: Static files not loading**
- Solution: Ensure `vite build` completed successfully and `dist/public` directory exists

**Issue: Database connection fails**
- Solution: Verify `DATABASE_URL` is correct and database is accessible

**Issue: 502 Bad Gateway**
- Solution: Check server logs for startup errors, verify all environment variables are set

### 7. Monitoring and Maintenance

- Monitor application logs in Render dashboard
- Check database connection health
- Monitor API response times
- Review error logs for any issues

## Alternative Deployment Platforms

### Heroku
- Use `Procfile`: `web: node start.js`
- Set environment variables in Heroku dashboard
- Enable PostgreSQL add-on

### Railway
- Use `railway.json` configuration
- Set environment variables in Railway dashboard
- Connect PostgreSQL database

### Docker Deployment
- Use included `Dockerfile`
- Build: `docker build -t school-management .`
- Run: `docker run -p 5000:5000 school-management`

## Security Considerations

- Always use HTTPS in production
- Set secure session secrets
- Use environment variables for sensitive data
- Regular security updates
- Monitor for suspicious activity