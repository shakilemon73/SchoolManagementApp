import { Request, Response, Express } from 'express';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

export function registerCreditBalanceTable(app: Express) {
  // Create credit balance table automatically
  app.post("/api/setup-credit-balance", async (req: Request, res: Response) => {
    try {
      console.log('Creating credit balance table...');

      // Create the credit balance table
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS credit_balance (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL UNIQUE,
          username TEXT NOT NULL,
          email TEXT,
          full_name TEXT,
          current_credits INTEGER DEFAULT 0 NOT NULL,
          bonus_credits INTEGER DEFAULT 0 NOT NULL,
          used_credits INTEGER DEFAULT 0 NOT NULL,
          status TEXT DEFAULT 'active',
          last_activity TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);

      // Create indexes
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_credit_balance_user_id ON credit_balance(user_id);
        CREATE INDEX IF NOT EXISTS idx_credit_balance_credits ON credit_balance(current_credits);
        CREATE INDEX IF NOT EXISTS idx_credit_balance_status ON credit_balance(status);
      `);

      // Create functions for credit management
      await db.execute(sql`
        CREATE OR REPLACE FUNCTION add_credits(
          p_user_id INTEGER,
          p_username TEXT,
          p_email TEXT DEFAULT NULL,
          p_full_name TEXT DEFAULT NULL,
          p_credits INTEGER DEFAULT 0
        ) RETURNS void AS $$
        BEGIN
          INSERT INTO credit_balance (
            user_id, username, email, full_name, current_credits, updated_at
          ) VALUES (
            p_user_id, p_username, 
            COALESCE(p_email, p_username || '@school.com'),
            COALESCE(p_full_name, p_username),
            p_credits, NOW()
          )
          ON CONFLICT (user_id) DO UPDATE SET
            username = EXCLUDED.username,
            current_credits = credit_balance.current_credits + EXCLUDED.current_credits,
            updated_at = NOW();
        END;
        $$ LANGUAGE plpgsql;
      `);

      // Populate with existing users if any
      const existingUsers = await db.execute(sql`
        SELECT id, username, email, name, COALESCE(credits, 0) as credits
        FROM app_users 
        LIMIT 10;
      `);

      if (existingUsers.length > 0) {
        for (const user of existingUsers) {
          await db.execute(sql`
            SELECT add_credits(
              ${user.id}, 
              ${user.username}, 
              ${user.email || user.username + '@school.com'}, 
              ${user.name || user.username}, 
              ${user.credits || 0}
            );
          `);
        }
      } else {
        // Insert sample data
        await db.execute(sql`
          INSERT INTO credit_balance (user_id, username, email, full_name, current_credits) VALUES
          (1, 'admin', 'admin@school.com', 'System Administrator', 1000),
          (2, 'teacher1', 'teacher1@school.com', 'Main Teacher', 500),
          (3, 'user1', 'user1@school.com', 'Test User', 250)
          ON CONFLICT (user_id) DO NOTHING;
        `);
      }

      res.json({
        success: true,
        message: 'Credit balance table created successfully',
        usersProcessed: existingUsers.length
      });

      console.log('Credit balance table setup completed');

    } catch (error) {
      console.error('Error creating credit balance table:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create credit balance table',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get user's current credit balance (authenticated)
  app.get("/api/user-credit-balance", async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user?.id || (req as any).supabaseUser?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const balance = await db.execute(sql`
        SELECT 
          user_id,
          username,
          email,
          full_name,
          current_credits,
          bonus_credits,
          used_credits,
          status,
          last_activity,
          created_at,
          updated_at
        FROM credit_balance 
        WHERE user_id = ${userId};
      `);

      if (balance.length === 0) {
        // Create credit balance for authenticated user if doesn't exist
        const userEmail = (req as any).user?.email || (req as any).supabaseUser?.email;
        const username = userEmail ? userEmail.split('@')[0] : 'user';
        
        await db.execute(sql`
          INSERT INTO credit_balance (
            user_id, username, email, full_name, current_credits
          ) VALUES (
            ${userId}, ${username}, ${userEmail}, ${username}, 500
          );
        `);

        const newBalance = await db.execute(sql`
          SELECT * FROM credit_balance WHERE user_id = ${userId};
        `);

        return res.json({
          success: true,
          data: newBalance[0],
          created: true
        });
      }

      res.json({
        success: true,
        data: balance[0]
      });

    } catch (error) {
      console.error('Error fetching user credit balance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch credit balance'
      });
    }
  });

  // Get all credit balances (admin only)
  app.get("/api/credit-balances", async (req: Request, res: Response) => {
    try {
      const balances = await db.execute(sql`
        SELECT 
          user_id,
          username,
          email,
          full_name,
          current_credits,
          bonus_credits,
          used_credits,
          status,
          last_activity,
          created_at,
          updated_at
        FROM credit_balance 
        ORDER BY current_credits DESC;
      `);

      res.json({
        success: true,
        data: balances,
        total: balances.length
      });

    } catch (error) {
      console.error('Error fetching credit balances:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch credit balances'
      });
    }
  });

  // Add credits to user
  app.post("/api/credit-balances/add", async (req: Request, res: Response) => {
    try {
      const { userId, username, email, fullName, credits } = req.body;

      await db.execute(sql`
        SELECT add_credits(
          ${userId}, 
          ${username}, 
          ${email}, 
          ${fullName}, 
          ${credits}
        );
      `);

      res.json({
        success: true,
        message: `Added ${credits} credits to ${username}`
      });

    } catch (error) {
      console.error('Error adding credits:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add credits'
      });
    }
  });

  // Get credit balance statistics
  app.get("/api/credit-balances/stats", async (req: Request, res: Response) => {
    try {
      const stats = await db.execute(sql`
        SELECT 
          COUNT(*) as total_users,
          SUM(current_credits) as total_credits,
          AVG(current_credits)::INTEGER as avg_credits,
          MAX(current_credits) as max_credits,
          MIN(current_credits) as min_credits
        FROM credit_balance;
      `);

      res.json({
        success: true,
        stats: stats[0] || {
          total_users: 0,
          total_credits: 0,
          avg_credits: 0,
          max_credits: 0,
          min_credits: 0
        }
      });

    } catch (error) {
      console.error('Error fetching credit stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch credit statistics'
      });
    }
  });
}