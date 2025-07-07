# Database Scripts

This folder contains all database-related scripts organized by purpose.

## Folder Structure

### `/setup/` - Initial Setup Scripts
- `create-*-table.js` - Create specific database tables
- `setup-*-*.js` - Complete setup procedures
- `add-hsc-templates.js` - Add HSC exam templates
- `complete-notifications-setup.js` - Setup notification system

### `/migrations/` - Database Migrations
- `add-*-column.js` - Add new columns to existing tables
- `fix-*-*.js` - Fix database schema issues
- `migrate-to-*.js` - Major migration procedures

### `/seeds/` - Sample Data
- `add-sample-*.js` - Add sample data for testing
- `seed-*.js` - Comprehensive data seeding

### `/utils/` - Utility Scripts
- `check-*.js` - Database verification scripts
- `test-*.js` - Connection and functionality tests
- `debug-*.js` - Debugging utilities

## Usage
Run scripts from the project root:
```bash
node scripts/setup/create-tables-direct.js
node scripts/migrations/add-missing-columns.js
node scripts/seeds/add-sample-data.js
node scripts/utils/test-connection.js
```

## Important Notes
- Always backup your database before running migration scripts
- Test scripts in development environment first
- Check script headers for specific requirements