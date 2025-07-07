const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testSupabaseTemplates() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
  console.log('Service Key:', supabaseKey ? 'Found' : 'Missing');
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    return;
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Test connection with a simple query
    console.log('\n1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('document_templates')
      .select('count(*)', { count: 'exact', head: true });
    
    if (testError) {
      console.error('Connection test failed:', testError.message);
      return;
    }
    
    console.log('✓ Connection successful');
    
    // Get total count
    console.log('\n2. Getting total template count...');
    const { count, error: countError } = await supabase
      .from('document_templates')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count query failed:', countError.message);
      return;
    }
    
    console.log(`Total templates in database: ${count}`);
    
    // Get all templates
    console.log('\n3. Fetching all templates...');
    const { data: templates, error: fetchError } = await supabase
      .from('document_templates')
      .select('id, name, name_bn, category, is_active, popularity_score')
      .order('popularity_score', { ascending: false });
    
    if (fetchError) {
      console.error('Fetch query failed:', fetchError.message);
      return;
    }
    
    console.log(`Retrieved ${templates?.length || 0} templates`);
    
    if (templates && templates.length > 0) {
      console.log('\nFirst 10 templates:');
      templates.slice(0, 10).forEach((template, index) => {
        console.log(`${index + 1}. ${template.name} (${template.name_bn}) - Category: ${template.category}, Active: ${template.is_active}, Score: ${template.popularity_score}`);
      });
    }
    
    // Test with different filters
    console.log('\n4. Testing active templates only...');
    const { data: activeTemplates, error: activeError } = await supabase
      .from('document_templates')
      .select('*')
      .eq('is_active', true);
    
    if (!activeError && activeTemplates) {
      console.log(`Active templates: ${activeTemplates.length}`);
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

testSupabaseTemplates();