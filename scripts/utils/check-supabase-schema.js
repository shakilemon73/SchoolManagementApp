import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNotificationsSchema() {
  try {
    console.log('Checking notifications table schema...');
    
    // Try to fetch a single row to see available columns
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error fetching notifications:', error);
    } else {
      console.log('Available data structure:', data);
      if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
      } else {
        console.log('No data in notifications table');
      }
    }
    
    // Also try to insert a test row to see what columns are expected
    console.log('\nTrying to insert test notification...');
    const { data: insertData, error: insertError } = await supabase
      .from('notifications')
      .insert({
        title: 'Test',
        title_bn: 'টেস্ট',
        message: 'Test message',
        message_bn: 'টেস্ট বার্তা',
        type: 'info',
        priority: 'medium',
        category: 'Test',
        category_bn: 'টেস্ট'
      })
      .select();
    
    if (insertError) {
      console.log('Insert error (this shows required/available columns):', insertError);
    } else {
      console.log('Successfully inserted test data:', insertData);
      // Clean up
      if (insertData && insertData[0]) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', insertData[0].id);
        console.log('Cleaned up test data');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkNotificationsSchema();