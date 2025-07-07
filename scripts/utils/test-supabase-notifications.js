import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSupabaseNotifications() {
  try {
    console.log('Testing Supabase notifications API...');
    
    // Fetch all notifications from Supabase
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching notifications:', error);
      return;
    }

    console.log('✓ Successfully fetched notifications from Supabase:');
    console.log(`Found ${notifications.length} notifications`);
    
    if (notifications.length > 0) {
      console.log('\nSample notification:');
      console.log(JSON.stringify(notifications[0], null, 2));
      
      // Format for live notifications API
      const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        titleBn: notification.title_bn,
        message: notification.message,
        messageBn: notification.message_bn,
        type: notification.type,
        priority: notification.priority,
        category: notification.category,
        categoryBn: notification.category_bn,
        isRead: notification.is_read,
        isLive: true, // Treat all as live for now
        actionRequired: notification.action_required,
        sender: notification.created_by ? `User ${notification.created_by}` : 'System',
        createdAt: notification.created_at
      }));
      
      console.log('\nFormatted for live notifications:');
      console.log(JSON.stringify(formattedNotifications[0], null, 2));
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabaseNotifications();