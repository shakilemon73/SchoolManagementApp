import { Express, Request, Response } from "express";
import { db } from "../db/index";
import { sql } from "drizzle-orm";

export function registerSimpleCreditRoutes(app: Express) {
  
  // Simple credit balance endpoint that works with any authenticated user
  app.get("/api/simple-credit-balance/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log('Simple credit balance request for user:', userId);

      // Get user's credit balance from credit_balance table
      const result = await db.execute(sql`
        SELECT 
          user_id,
          username,
          email,
          current_credits,
          bonus_credits,
          used_credits,
          status
        FROM credit_balance 
        WHERE user_id = ${userId}::uuid
        LIMIT 1;
      `);

      if (result.length === 0) {
        // Create new balance for user
        const email = `user_${userId.substring(0, 8)}@school.edu`;
        const username = `user_${userId.substring(0, 8)}`;
        
        await db.execute(sql`
          INSERT INTO credit_balance (
            user_id, username, email, current_credits, bonus_credits, used_credits, status
          ) VALUES (
            ${userId}::uuid, ${username}, ${email}, 500, 0, 0, 'active'
          );
        `);

        return res.json({
          user_id: userId,
          username,
          email,
          current_credits: 500,
          bonus_credits: 0,
          used_credits: 0,
          status: 'active'
        });
      }

      const balance = result[0] as any;
      console.log('Found balance for user:', balance);

      res.json({
        user_id: balance.user_id,
        username: balance.username,
        email: balance.email,
        current_credits: balance.current_credits || 0,
        bonus_credits: balance.bonus_credits || 0,
        used_credits: balance.used_credits || 0,
        status: balance.status || 'active'
      });

    } catch (error) {
      console.error('Simple credit balance error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update credit balance (for purchases/usage)
  app.post("/api/simple-credit-balance/:userId/update", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { credits, operation } = req.body; // operation: 'add' or 'deduct'
      
      if (!userId || !credits || !operation) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      let updateQuery = '';
      if (operation === 'add') {
        updateQuery = sql`
          UPDATE credit_balance 
          SET current_credits = current_credits + ${credits},
              updated_at = NOW()
          WHERE user_id = ${userId}::uuid
          RETURNING current_credits;
        `;
      } else if (operation === 'deduct') {
        updateQuery = sql`
          UPDATE credit_balance 
          SET current_credits = GREATEST(current_credits - ${credits}, 0),
              used_credits = used_credits + ${credits},
              updated_at = NOW()
          WHERE user_id = ${userId}::uuid
          RETURNING current_credits;
        `;
      }

      const result = await db.execute(updateQuery);
      const newBalance = result[0] as any;

      res.json({
        success: true,
        current_credits: newBalance.current_credits,
        operation,
        credits_changed: credits
      });

    } catch (error) {
      console.error('Credit update error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get credit statistics for dashboard
  app.get("/api/simple-credit-stats/:userId", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Get credit balance
      const balanceResult = await db.execute(sql`
        SELECT current_credits, used_credits, bonus_credits
        FROM credit_balance 
        WHERE user_id = ${userId}::uuid;
      `);

      if (balanceResult.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const balance = balanceResult[0] as any;

      // Calculate this month's usage (simplified)
      const thisMonthUsage = Math.floor(balance.used_credits * 0.3); // Approximate

      res.json({
        currentBalance: balance.current_credits || 0,
        totalUsed: balance.used_credits || 0,
        totalPurchased: (balance.current_credits || 0) + (balance.used_credits || 0),
        thisMonthUsage: thisMonthUsage,
        efficiency: balance.used_credits > 0 ? Math.round((balance.used_credits / ((balance.current_credits || 0) + (balance.used_credits || 0))) * 100) : 0
      });

    } catch (error) {
      console.error('Simple credit stats error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}