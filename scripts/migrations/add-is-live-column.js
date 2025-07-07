import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addIsLiveColumn() {
  try {
    console.log('Adding is_live column to notifications table...');
    
    // First, check if the column already exists
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', { table_name: 'notifications' });
    
    if (columnsError) {
      console.log('Cannot check existing columns, attempting to add column directly...');
    } else {
      const hasIsLive = columns?.some(col => col.column_name === 'is_live');
      if (hasIsLive) {
        console.log('✓ is_live column already exists');
        return;
      }
    }
    
    // Add the column using SQL
    const { data, error } = await supabase
      .rpc('execute_sql', { 
        sql: 'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false;' 
      });
    
    if (error) {
      console.error('Error adding column:', error);
      
      // Try alternative approach - direct table modification
      console.log('Trying alternative approach...');
      const { error: altError } = await supabase
        .from('notifications')
        .select('is_live')
        .limit(1);
      
      if (altError && altError.code === '42703') {
        console.log('Column does not exist, manual addition needed');
        console.log('Please add the is_live column manually in Supabase dashboard:');
        console.log('1. Go to Table Editor');
        console.log('2. Select notifications table');
        console.log('3. Add new column: is_live (boolean, default: false)');
      }
    } else {
      console.log('✓ Successfully added is_live column');
    }
    
    // Test the column by inserting a sample notification
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .insert({
        title: 'Test Live Notification',
        title_bn: 'টেস্ট লাইভ নোটিফিকেশন',
        message: 'This is a test live notification',
        message_bn: 'এটি একটি টেস্ট লাইভ নোটিফিকেশন',
        type: 'info',
        priority: 'medium',
        category: 'Test',
        category_bn: 'টেস্ট',
        is_live: true
      })
      .select();
    
    if (testError) {
      console.error('Error testing is_live column:', testError);
    } else {
      console.log('✓ Successfully tested is_live column with sample data');
      
      // Clean up test data
      if (testData && testData[0]) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', testData[0].id);
        console.log('✓ Cleaned up test data');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addIsLiveColumn();