import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addSampleLiveNotifications() {
  try {
    console.log('Adding sample live notifications to Supabase...');
    
    const sampleNotifications = [
      {
        title: 'Live Class Alert',
        title_bn: 'লাইভ ক্লাস সতর্কতা',
        message: 'Mathematics class starting in 10 minutes - Room 205',
        message_bn: 'গণিত ক্লাস ১০ মিনিটে শুরু হবে - রুম ২০৫',
        type: 'warning',
        priority: 'high',
        category: 'Academic',
        category_bn: 'শিক্ষাগত',
        action_required: true,
        is_read: false
      },
      {
        title: 'Emergency Alert',
        title_bn: 'জরুরি সতর্কতা',
        message: 'School closing early due to weather conditions',
        message_bn: 'আবহাওয়ার কারণে স্কুল তাড়াতাড়ি বন্ধ',
        type: 'urgent',
        priority: 'urgent',
        category: 'Emergency',
        category_bn: 'জরুরি',
        action_required: true,
        is_read: false
      },
      {
        title: 'Fee Payment Reminder',
        title_bn: 'ফি পেমেন্ট অনুস্মারক',
        message: 'Monthly fee payment due tomorrow',
        message_bn: 'আগামীকাল মাসিক ফি পরিশোধের শেষ দিন',
        type: 'info',
        priority: 'medium',
        category: 'Financial',
        category_bn: 'আর্থিক',
        action_required: false,
        is_read: false
      }
    ];

    for (const notification of sampleNotifications) {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select();

      if (error) {
        console.error('Error inserting notification:', error);
      } else {
        console.log('✓ Added notification:', notification.title);
      }
    }

    console.log('✓ Sample live notifications added successfully');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

addSampleLiveNotifications();