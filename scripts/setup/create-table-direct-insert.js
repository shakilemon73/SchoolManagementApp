#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function createTableViaInsert() {
  console.log('🔧 Creating document_templates table via direct insert...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✓ Supabase admin client created');

    // Try to insert a test record to create the table structure automatically
    const testTemplate = {
      name: 'Student ID Card',
      name_bn: 'ছাত্র পরিচয়পত্র',
      category: 'academic',
      type: 'id_card',
      description: 'Official student identification card with photo and details',
      description_bn: 'ছবি এবং বিস্তারিত তথ্যসহ অফিসিয়াল ছাত্র পরিচয়পত্র',
      template: {
        fields: ['name', 'studentId', 'class', 'section', 'photo', 'session', 'validity'],
        layout: 'standard_id_card',
        size: 'cr80'
      },
      is_active: true,
      credit_cost: 2,
      popularity_score: 95,
      usage_count: 0
    };

    console.log('📝 Attempting to insert test template...');
    
    const { data: insertData, error: insertError } = await supabase
      .from('document_templates')
      .insert(testTemplate)
      .select();

    if (insertError) {
      if (insertError.code === '42P01') {
        console.error('❌ Table does not exist. Please create it manually in Supabase SQL Editor.');
        console.log('\n📋 SQL to create the table:');
        console.log(`
CREATE TABLE public.document_templates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  description_bn TEXT,
  template JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  credit_cost INTEGER DEFAULT 1,
  popularity_score INTEGER DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.document_templates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role access
CREATE POLICY "Allow service role access" ON public.document_templates
FOR ALL USING (auth.role() = 'service_role');
        `);
        return false;
      } else {
        console.error('❌ Insert error:', insertError);
        return false;
      }
    } else {
      console.log('✓ Test template inserted successfully');
      console.log('🎉 Table exists and is accessible');
      return true;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Run the function
createTableViaInsert().then(success => {
  if (success) {
    console.log('✅ Ready to populate with full template data');
  } else {
    console.log('❌ Manual table creation required');
  }
}).catch(console.error);