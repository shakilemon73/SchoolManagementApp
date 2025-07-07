# Setting Up New Supabase Account with Existing Data

## Step 1: Create New Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account
2. Create a new project with these settings:
   - **Name**: Your School Management System
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your location

## Step 2: Get Your New Database Credentials

After your project is created, go to:
- **Settings** → **Database** → **Connection string**
- Copy the **URI** format connection string
- **Settings** → **API** → Copy your **URL** and **anon public** key
- **Settings** → **API** → Copy your **service_role** key

## Step 3: Prepare Environment Variables

Create a backup of your current `.env` file:
```bash
cp .env .env.backup
```

Then update your `.env` file with the new credentials:
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_KEY=[YOUR_SERVICE_KEY]

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Environment
NODE_ENV=development
VITE_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
```

## Step 4: Set Up Database Schema

Run these commands to set up your database structure:

```bash
# Push the schema to your new database
npm run db:push

# Verify the schema was created
npm run db:studio
```

## Step 5: Migrate Your Data (Option A - Using Migration Script)

If you want to migrate data programmatically:

1. Add your new Supabase credentials to environment variables:
```bash
export NEW_DATABASE_URL="your_new_database_url"
export NEW_SUPABASE_URL="your_new_supabase_url"
export NEW_SUPABASE_SERVICE_KEY="your_new_service_key"
```

2. Run the migration script:
```bash
npx tsx migrate-to-new-supabase.ts
```

## Step 6: Manual Data Migration (Option B - Using SQL Export/Import)

1. **Export from old database**:
   - Go to your old Supabase dashboard
   - **Settings** → **Database** → **Backups**
   - Or use pg_dump command

2. **Import to new database**:
   - Connect to your new database using the connection string
   - Run the SQL import

## Step 7: Configure Storage Buckets

Your application uses these storage buckets:
- `school-files` (public)
- `student-photos` (public)
- `certificates` (private)
- `documents` (private)

Go to **Storage** in your new Supabase dashboard and create these buckets.

## Step 8: Set Up Authentication Policies

In your new Supabase dashboard:
1. Go to **Authentication** → **Policies**
2. Enable Row Level Security (RLS) for your tables if needed
3. Create policies based on your application's requirements

## Step 9: Test Your Application

1. Start your application:
```bash
npm run dev
```

2. Test key features:
   - User login/registration
   - Document generation
   - Data retrieval
   - File uploads

## Step 10: Update Production Settings

When ready for production:
1. Update your Supabase project settings for production use
2. Configure custom domain if needed
3. Set up proper backup schedules
4. Configure monitoring and alerts

## Troubleshooting

### Common Issues:

1. **Connection Errors**: Verify your DATABASE_URL format and credentials
2. **Schema Errors**: Run `npm run db:push` to sync schema
3. **Authentication Issues**: Check your SUPABASE_URL and keys
4. **Storage Issues**: Ensure buckets are created with correct permissions

### Getting Help:

- Check Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
- Your current data structure is defined in `shared/schema.ts`
- All API routes are in the `server/` directory

## Important Notes:

- Your application uses a custom authentication system alongside Supabase
- The database uses PostgreSQL with Drizzle ORM
- All environment variables must be updated for the application to work
- Test thoroughly before switching to production use