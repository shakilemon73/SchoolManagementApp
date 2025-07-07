import type { Express, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerDatabaseSchemaFix(app: Express) {
  app.post('/api/fix-database-schema', async (req: Request, res: Response) => {
    try {
      const fixes = [];
      
      // Check and create missing tables/columns
      const tableChecks = [
        {
          name: 'schools',
          columns: [
            { name: 'id', type: 'serial PRIMARY KEY' },
            { name: 'name', type: 'text NOT NULL' },
            { name: 'address', type: 'text' },
            { name: 'phone', type: 'text' },
            { name: 'email', type: 'text' },
            { name: 'website', type: 'text' },
            { name: 'principal_name', type: 'text' },
            { name: 'established_year', type: 'integer' },
            { name: 'created_at', type: 'timestamp DEFAULT now() NOT NULL' }
          ]
        },
        {
          name: 'app_users',
          columns: [
            { name: 'id', type: 'serial PRIMARY KEY' },
            { name: 'username', type: 'text UNIQUE NOT NULL' },
            { name: 'name', type: 'text NOT NULL' },
            { name: 'email', type: 'text UNIQUE NOT NULL' },
            { name: 'password_hash', type: 'text NOT NULL' },
            { name: 'role', type: 'text DEFAULT \'user\' NOT NULL' },
            { name: 'school_id', type: 'integer' },
            { name: 'student_id', type: 'integer' },
            { name: 'credits', type: 'integer DEFAULT 0' },
            { name: 'is_active', type: 'boolean DEFAULT true' },
            { name: 'is_admin', type: 'boolean DEFAULT false' },
            { name: 'last_login', type: 'timestamp' },
            { name: 'profile_picture', type: 'text' },
            { name: 'phone_number', type: 'text' },
            { name: 'created_at', type: 'timestamp DEFAULT now() NOT NULL' },
            { name: 'updated_at', type: 'timestamp DEFAULT now()' }
          ]
        }
      ];

      for (const table of tableChecks) {
        try {
          // Try to create table if it doesn't exist
          const createTableQuery = `
            CREATE TABLE IF NOT EXISTS ${table.name} (
              ${table.columns.map(col => `${col.name} ${col.type}`).join(', ')}
            )
          `;
          
          await db.execute(sql.raw(createTableQuery));
          fixes.push(`✓ Table ${table.name} created/verified`);
          
          // Add missing columns
          for (const column of table.columns) {
            try {
              const addColumnQuery = `
                ALTER TABLE ${table.name} 
                ADD COLUMN IF NOT EXISTS ${column.name} ${column.type}
              `;
              await db.execute(sql.raw(addColumnQuery));
            } catch (columnError: any) {
              // Column might already exist, that's fine
              if (!columnError.message.includes('already exists')) {
                fixes.push(`⚠ Column ${table.name}.${column.name}: ${columnError.message}`);
              }
            }
          }
        } catch (error: any) {
          fixes.push(`❌ Table ${table.name} error: ${error.message}`);
        }
      }

      // Insert sample data if tables are empty
      try {
        const schoolsCount = await db.execute(sql`SELECT COUNT(*) FROM schools`);
        if (schoolsCount[0]?.count === '0' || schoolsCount.length === 0) {
          await db.execute(sql`
            INSERT INTO schools (name, address, phone, email, principal_name, established_year)
            VALUES 
              ('Demo High School', 'Dhaka, Bangladesh', '+880123456789', 'info@demohigh.edu.bd', 'Principal Ahmed', 1995),
              ('Model Secondary School', 'Chittagong, Bangladesh', '+880987654321', 'contact@modelsec.edu.bd', 'Principal Rahman', 2000)
          `);
          fixes.push('✓ Sample schools data inserted');
        }
      } catch (error: any) {
        fixes.push(`⚠ Sample data insertion: ${error.message}`);
      }

      res.json({
        success: true,
        message: 'Database schema fix completed',
        fixes: fixes,
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      res.status(500).json({
        error: 'Database schema fix failed',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
}