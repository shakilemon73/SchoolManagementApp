import { Express, Request, Response } from 'express';
import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

export function registerSimpleCreditBalance(app: Express) {
  // Simple credit balance endpoint that works without complex authentication
  app.get("/api/simple-credit-balance/:userId", async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      console.log('Simple credit balance request for user:', userId);

      const balance = await db.execute(sql`
        SELECT 
          user_id,
          username,
          email,
          current_credits,
          bonus_credits,
          used_credits,
          status
        FROM credit_balance 
        WHERE user_id = ${userId}::uuid;
      `);

      if (balance.length === 0) {
        return res.json({
          success: false,
          message: 'User not found',
          balance: 0
        });
      }

      const userBalance = balance[0] as any;
      
      console.log('Found balance for user:', userBalance);

      res.json({
        success: true,
        userId: userBalance.user_id,
        username: userBalance.username,
        email: userBalance.email,
        currentCredits: userBalance.current_credits || 0,
        bonusCredits: userBalance.bonus_credits || 0,
        usedCredits: userBalance.used_credits || 0,
        status: userBalance.status || 'active'
      });

    } catch (error) {
      console.error('Simple credit balance error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch credit balance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get all credit balances (admin view)
  app.get("/api/all-credit-balances", async (req: Request, res: Response) => {
    try {
      const balances = await db.execute(sql`
        SELECT 
          user_id,
          username,
          email,
          current_credits,
          bonus_credits,
          used_credits,
          status,
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
      console.error('All credit balances error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch all credit balances'
      });
    }
  });
}