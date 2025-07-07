# SQL Scripts

This folder contains all SQL files organized by purpose.

## Folder Structure

### `/setup/` - Database Setup
- `SUPABASE_SETUP_SQL.sql` - Complete Supabase setup
- `SUPABASE_TABLE_CREATION.sql` - Create all tables
- `create-supabase-tables.sql` - Table creation scripts
- `add-2000-credits.sql` - Initial credit setup
- `create-credit-tables.sql` - Credit system tables
- `fixed-supabase-credit-tables.sql` - Updated credit tables

### `/functions/` - Database Functions
- `supabase-credit-functions.sql` - Credit management functions

### `/migrations/` - Schema Changes
- Place migration SQL files here for version control

## Usage
Execute SQL files in your database management tool:
1. Connect to your Supabase PostgreSQL database
2. Run setup scripts first
3. Then run functions
4. Apply migrations as needed

## Important Notes
- Always backup your database before running SQL scripts
- Run setup scripts in the correct order
- Test in development environment first