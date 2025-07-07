import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addMissingColumns() {
  try {
    console.log('Adding missing columns to notifications table...');
    
    // Test inserting with is_live column to see if it exists
    const { data: testData, error: testError } = await supabase
      .from('notifications')
      .insert({
        title: 'Test Live',
        title_bn: 'টেস্ট লাইভ',
        message: 'Test live message',
        message_bn: 'টেস্ট লাইভ বার্তা',
        type: 'info',
        priority: 'medium',
        category: 'Test',
        category_bn: 'টেস্ট',
        is_live: true
      })
      .select();
    
    if (testError) {
      if (testError.message.includes('is_live')) {
        console.log('❌ is_live column does not exist');
        console.log('Need to add is_live column manually in Supabase dashboard');
      }
    } else {
      console.log('✓ is_live column exists and working');
      // Clean up test data
      if (testData && testData[0]) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', testData[0].id);
      }
    }
    
    // Test inserting with sender column
    const { data: testData2, error: testError2 } = await supabase
      .from('notifications')
      .insert({
        title: 'Test Sender',
        title_bn: 'টেস্ট পাঠানো',
        message: 'Test sender message',
        message_bn: 'টেস্ট পাঠানোর বার্তা',
        type: 'info',
        priority: 'medium',
        category: 'Test',
        category_bn: 'টেস্ট',
        sender: 'Test Sender'
      })
      .select();
    
    if (testError2) {
      if (testError2.message.includes('sender')) {
        console.log('❌ sender column does not exist');
        console.log('Need to add sender column manually in Supabase dashboard');
      }
    } else {
      console.log('✓ sender column exists and working');
      // Clean up test data
      if (testData2 && testData2[0]) {
        await supabase
          .from('notifications')
          .delete()
          .eq('id', testData2[0].id);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addMissingColumns();