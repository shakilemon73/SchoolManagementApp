#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

async function testSupabaseTemplates() {
  console.log('🔍 Testing Supabase Templates Connection...');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('Service Key:', supabaseServiceKey ? 'Found' : 'Missing');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials');
    return;
  }

  try {
    // Create admin client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('✓ Supabase client created');

    // Test 1: Check if document_templates table exists
    console.log('\n📋 Checking document_templates table...');
    
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'document_templates');

    if (tableError) {
      console.error('Table check error:', tableError);
    } else {
      console.log('Table exists:', tables && tables.length > 0 ? 'Yes' : 'No');
    }

    // Test 2: Try to fetch templates
    console.log('\n📄 Fetching document templates...');
    
    const { data: templates, error: fetchError, count } = await supabase
      .from('document_templates')
      .select('*', { count: 'exact' })
      .limit(5);

    if (fetchError) {
      console.error('❌ Fetch error:', fetchError);
    } else {
      console.log(`✓ Found ${count || templates?.length || 0} templates`);
      if (templates && templates.length > 0) {
        console.log('Sample template:', {
          id: templates[0].id,
          name: templates[0].name,
          category: templates[0].category
        });
      }
    }

    // Test 3: Check table structure
    console.log('\n🏗️  Checking table structure...');
    
    const { data: columns, error: columnError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_schema', 'public')
      .eq('table_name', 'document_templates');

    if (columnError) {
      console.error('Column check error:', columnError);
    } else {
      console.log('Table columns:', columns?.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
}

testSupabaseTemplates().catch(console.error);