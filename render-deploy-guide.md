# Render.com Deployment Guide

## Quick Setup Instructions

### 1. Create Render Account
- Go to [render.com](https://render.com) and create an account
- Connect your GitHub repository

### 2. Environment Variables
Set these in your Render dashboard under "Environment":

**Critical Variables:**
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
SESSION_SECRET=your-secure-random-string
```

### 3. Render Service Settings
- **Build Command:** `node build.js`
- **Start Command:** `node start.js`
- **Environment:** Node
- **Plan:** Starter (free tier)

### 4. Deploy
- Push your code to GitHub
- In Render, create a new "Web Service"
- Connect your GitHub repository
- Set the build and start commands above
- Add your environment variables
- Click "Deploy"

## Troubleshooting

### Common Issues:

**1. WebSocket Connection Errors**
- Fixed: App now works without WebSocket dependency
- No action needed

**2. Static Files Not Loading (502 Error)**
- Ensure build command runs successfully
- Check that `dist/public/index.html` exists after build

**3. Database Connection Issues**
- Verify DATABASE_URL is correct
- Test connection with your PostgreSQL database

**4. Environment Variable Issues**
- All variables must be set in Render dashboard
- Frontend variables must have `VITE_` prefix

### Logs and Monitoring
- Check Render dashboard for deployment logs
- Monitor application performance
- Review error logs for any issues

## Post-Deployment Verification

After deployment, verify:
1. ✅ App loads without errors
2. ✅ Database connection works
3. ✅ Authentication functions
4. ✅ All pages accessible
5. ✅ No console errors

Your app should now be live at: `https://your-app-name.onrender.com`