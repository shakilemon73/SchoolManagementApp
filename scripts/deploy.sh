#!/bin/bash

# School Management System Deployment Script
# For use with Render.com and other hosting platforms

set -e

echo "🚀 Starting deployment build process..."

# Set production environment
export NODE_ENV=production

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

# Build the frontend
echo "🏗️ Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist/public" ]; then
    echo "❌ Frontend build failed - dist/public directory not found"
    exit 1
fi

echo "✅ Frontend build completed successfully"

# Push database schema (if DATABASE_URL is available)
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️ Pushing database schema..."
    npm run db:push
    echo "✅ Database schema updated"
else
    echo "⚠️ DATABASE_URL not set, skipping database setup"
fi

# Verify essential files exist
echo "🔍 Verifying build files..."
if [ ! -f "dist/public/index.html" ]; then
    echo "❌ Critical file missing: dist/public/index.html"
    exit 1
fi

echo "✅ Build verification completed"
echo "🎉 Deployment build process completed successfully"

# Print deployment information
echo ""
echo "📋 Deployment Information:"
echo "   - Frontend: Built and ready in dist/public/"
echo "   - Backend: Server ready to start"
echo "   - Database: Schema pushed (if configured)"
echo "   - Environment: $NODE_ENV"
echo ""
echo "🌐 Ready for deployment!"