import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

export async function autoCreateCreditBalanceTable() {
  try {
    console.log('🔄 Creating credit balance table automatically...');

    // Drop existing table if it has wrong schema
    await db.execute(sql`DROP TABLE IF EXISTS credit_balance CASCADE;`);
    
    // Create the credit balance table with UUID support
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS credit_balance (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL UNIQUE,
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

    // Create the add_credits function with UUID support
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION add_credits_to_balance(
        p_user_id UUID,
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
          email = EXCLUDED.email,
          full_name = EXCLUDED.full_name,
          current_credits = credit_balance.current_credits + EXCLUDED.current_credits,
          updated_at = NOW();
      END;
      $$ LANGUAGE plpgsql;
    `);

    // Sync with real Supabase users from auth.users
    try {
      console.log('🔍 Syncing with Supabase auth.users...');
      
      const supabaseUsers = await db.execute(sql`
        SELECT 
          id,
          email,
          raw_user_meta_data->>'full_name' as full_name,
          created_at
        FROM auth.users 
        WHERE email IS NOT NULL
        ORDER BY created_at DESC;
      `);

      if (supabaseUsers.length > 0) {
        console.log(`📊 Found ${supabaseUsers.length} Supabase users, syncing to credit_balance...`);
        
        for (const user of supabaseUsers) {
          const userData = user as any;
          const userId = userData.id;
          const email = userData.email;
          const fullName = userData.full_name || email.split('@')[0];
          const username = email.split('@')[0];
          
          await db.execute(sql`
            INSERT INTO credit_balance (
              user_id, username, email, full_name, current_credits, created_at
            ) VALUES (
              ${userId}, ${username}, ${email}, ${fullName}, 500, NOW()
            )
            ON CONFLICT (user_id) DO UPDATE SET
              username = EXCLUDED.username,
              email = EXCLUDED.email,
              full_name = EXCLUDED.full_name,
              updated_at = NOW();
          `);
        }
        
        console.log(`✅ Synced ${supabaseUsers.length} real Supabase users to credit_balance table`);
      } else {
        console.log('⚠ No Supabase users found, checking other user tables...');
        
        // Try app_users table as fallback
        const appUsers = await db.execute(sql`
          SELECT id, username, email, name, COALESCE(credits, 0) as credits
          FROM app_users 
          WHERE id IS NOT NULL
          LIMIT 100;
        `);

        if (appUsers.length > 0) {
          console.log(`📊 Found ${appUsers.length} app users, syncing to credit_balance...`);
          
          for (const user of appUsers) {
            await db.execute(sql`
              SELECT add_credits_to_balance(
                ${(user as any).id}, 
                ${(user as any).username}, 
                ${(user as any).email || (user as any).username + '@school.com'}, 
                ${(user as any).name || (user as any).username}, 
                ${(user as any).credits || 500}
              );
            `);
          }
          
          console.log(`✅ Synced ${appUsers.length} app users to credit_balance table`);
        } else {
          console.log('⚠ No existing users found in any table');
        }
      }
    } catch (userError) {
      console.error('⚠ Error syncing users:', userError);
      console.log('Creating minimal admin user for testing...');
      
      await db.execute(sql`
        INSERT INTO credit_balance (user_id, username, email, full_name, current_credits) VALUES
        (gen_random_uuid(), 'admin', 'admin@school.com', 'System Administrator', 1000)
        ON CONFLICT (user_id) DO NOTHING;
      `);
    }

    // Get table statistics
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_users,
        SUM(current_credits) as total_credits,
        AVG(current_credits)::INTEGER as avg_credits,
        MAX(current_credits) as max_credits
      FROM credit_balance;
    `);

    const tableStats = stats[0] as any;
    console.log(`✅ Credit balance table ready:`);
    console.log(`   Users: ${tableStats.total_users}`);
    console.log(`   Total Credits: ${tableStats.total_credits}`);
    console.log(`   Average Credits: ${tableStats.avg_credits}`);
    console.log(`   Highest Balance: ${tableStats.max_credits}`);

    return {
      success: true,
      message: 'Credit balance table created successfully',
      stats: tableStats
    };

  } catch (error) {
    console.error('❌ Error creating credit balance table:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}