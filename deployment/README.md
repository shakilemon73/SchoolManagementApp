# Deployment Configuration

This folder contains all deployment-related files and configurations.

## Files

### `Dockerfile`
- Docker container configuration for the application
- Builds both frontend and backend in a single container

### `docker-compose.yml`
- Multi-container setup for development/staging
- Includes database, application, and other services

### `deploy.json`
- Deployment configuration for various platforms
- Contains environment-specific settings

### `netlify.toml`
- Netlify deployment configuration
- Build settings and redirects

## Usage

### Docker Deployment
```bash
# Build and run with Docker
docker build -t school-management .
docker run -p 5000:5000 school-management

# Or use Docker Compose
docker-compose up -d
```

### Replit Deployment
- The application is configured for Replit Autoscale
- Use the Deploy button in Replit interface

## Environment Variables
Make sure to set these environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service key
- `SESSION_SECRET` - Session encryption secret