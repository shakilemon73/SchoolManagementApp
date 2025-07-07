#!/usr/bin/env node

import postgres from 'postgres';

const databaseUrl = "postgresql://postgres.vmnmoiaxsahkdmnvrcrg:Ss049emon049@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10
});

async function addSampleNotifications() {
  try {
    console.log('Adding diverse sample notifications...');
    
    const notifications = [
      {
        title: 'Class Schedule Updated',
        title_bn: 'ক্লাসের সময়সূচী আপডেট হয়েছে',
        message: 'Mathematics class time has been changed from 10 AM to 11 AM',
        message_bn: 'গণিত ক্লাসের সময় সকাল ১০টা থেকে ১১টায় পরিবর্তিত হয়েছে',
        type: 'warning',
        priority: 'high',
        category: 'Academic',
        category_bn: 'শিক্ষাগত',
        recipient_type: 'user',
        is_public: true,
        action_required: true,
        sender: 'Academic Office',
        school_id: 1
      },
      {
        title: 'Fee Payment Due',
        title_bn: 'ফি পরিশোধের সময়',
        message: 'Monthly tuition fee payment is due by tomorrow',
        message_bn: 'আগামীকালের মধ্যে মাসিক বেতন পরিশোধ করতে হবে',
        type: 'urgent',
        priority: 'urgent',
        category: 'Financial',
        category_bn: 'আর্থিক',
        recipient_type: 'user',
        is_public: false,
        action_required: true,
        sender: 'Accounts Department',
        school_id: 1
      },
      {
        title: 'Exam Results Published',
        title_bn: 'পরীক্ষার ফলাফল প্রকাশিত',
        message: 'Mid-term examination results are now available',
        message_bn: 'মধ্যবর্তী পরীক্ষার ফলাফল এখন উপলব্ধ',
        type: 'success',
        priority: 'medium',
        category: 'Academic',
        category_bn: 'শিক্ষাগত',
        recipient_type: 'user',
        is_public: true,
        action_required: false,
        sender: 'Examination Controller',
        school_id: 1
      },
      {
        title: 'Parent Meeting Scheduled',
        title_bn: 'অভিভাবক সভা নির্ধারিত',
        message: 'Parent-teacher meeting scheduled for this Friday at 3 PM',
        message_bn: 'এই শুক্রবার বিকাল ৩টায় অভিভাবক-শিক্ষক সভা নির্ধারিত',
        type: 'info',
        priority: 'medium',
        category: 'Meeting',
        category_bn: 'সভা',
        recipient_type: 'user',
        is_public: true,
        action_required: true,
        sender: 'Principal Office',
        school_id: 1
      },
      {
        title: 'Sports Day Announcement',
        title_bn: 'ক্রীড়া দিবসের ঘোষণা',
        message: 'Annual sports day will be held next month on 15th January',
        message_bn: 'আগামী মাসের ১৫ জানুয়ারি বার্ষিক ক্রীড়া দিবস অনুষ্ঠিত হবে',
        type: 'info',
        priority: 'low',
        category: 'Event',
        category_bn: 'অনুষ্ঠান',
        recipient_type: 'user',
        is_public: true,
        action_required: false,
        sender: 'Sports Committee',
        school_id: 1
      },
      {
        title: 'Library Book Return',
        title_bn: 'লাইব্রেরির বই ফেরত',
        message: 'Please return the borrowed book "Advanced Mathematics" by tomorrow',
        message_bn: 'অনুগ্রহ করে "উন্নত গণিত" বইটি আগামীকালের মধ্যে ফেরত দিন',
        type: 'warning',
        priority: 'medium',
        category: 'Library',
        category_bn: 'গ্রন্থাগার',
        recipient_type: 'user',
        is_public: false,
        action_required: true,
        sender: 'Librarian',
        school_id: 1
      }
    ];
    
    for (const notification of notifications) {
      await sql`
        INSERT INTO notifications (
          title, title_bn, message, message_bn, type, priority,
          category, category_bn, recipient_type, is_public, 
          action_required, sender, school_id
        ) VALUES (
          ${notification.title}, ${notification.title_bn},
          ${notification.message}, ${notification.message_bn},
          ${notification.type}, ${notification.priority},
          ${notification.category}, ${notification.category_bn},
          ${notification.recipient_type}, ${notification.is_public},
          ${notification.action_required}, ${notification.sender},
          ${notification.school_id}
        )
        ON CONFLICT DO NOTHING;
      `;
      console.log(`Added: ${notification.title}`);
    }
    
    // Get final count
    const result = await sql`SELECT COUNT(*) as count FROM notifications;`;
    console.log(`✅ Total notifications in database: ${result[0].count}`);
    
    // Test query to verify structure
    const sample = await sql`
      SELECT id, title, title_bn, type, priority, category_bn, created_at
      FROM notifications 
      ORDER BY created_at DESC 
      LIMIT 3;
    `;
    
    console.log('📋 Recent notifications:');
    sample.forEach(n => {
      console.log(`  - ${n.title_bn} (${n.type}/${n.priority})`);
    });
    
    await sql.end();
    console.log('🎉 Sample notifications added successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

addSampleNotifications();