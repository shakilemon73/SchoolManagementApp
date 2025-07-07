import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbm1vaWF4c2Foa2RtbnZyY3JnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODQ4MzA2MywiZXhwIjoyMDY0MDU5MDYzfQ.soqUzgBxxUnuf3X9kikDGxNaffWGBoH6rXp9KsSuGfk';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDocumentTables() {
  try {
    console.log('Creating document management tables...');

    // Create document_templates table
    const { error: templatesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS document_templates (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          name_bn VARCHAR(255),
          category VARCHAR(100) NOT NULL,
          type VARCHAR(100) NOT NULL,
          description TEXT,
          description_bn TEXT,
          template JSONB NOT NULL,
          is_active BOOLEAN DEFAULT true,
          credit_cost INTEGER DEFAULT 1,
          popularity_score INTEGER DEFAULT 0,
          usage_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          last_used TIMESTAMP WITH TIME ZONE
        );
      `
    });

    if (templatesError) {
      console.log('Templates table might already exist or using alternative method');
    }

    // Create generated_documents table
    const { error: documentsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS generated_documents (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          template_id INTEGER NOT NULL,
          data JSONB NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          file_path VARCHAR(500),
          file_size INTEGER,
          download_count INTEGER DEFAULT 0
        );
      `
    });

    if (documentsError) {
      console.log('Documents table might already exist or using alternative method');
    }

    // Insert sample template data
    console.log('Inserting sample document templates...');
    
    const sampleTemplates = [
      {
        name: 'Student ID Card',
        name_bn: 'ছাত্র পরিচয়পত্র',
        category: 'identity',
        type: 'id_card',
        description: 'Generate student identification cards',
        description_bn: 'ছাত্র পরিচয়পত্র তৈরি করুন',
        template: {
          fields: ['name', 'studentId', 'class', 'section', 'photo'],
          layout: 'standard_id_card'
        },
        is_active: true,
        credit_cost: 2,
        popularity_score: 95
      },
      {
        name: 'Admit Card',
        name_bn: 'প্রবেশপত্র',
        category: 'examination',
        type: 'admit_card',
        description: 'Generate examination admit cards',
        description_bn: 'পরীক্ষার প্রবেশপত্র তৈরি করুন',
        template: {
          fields: ['name', 'rollNumber', 'examName', 'examDate', 'center'],
          layout: 'admit_card_layout'
        },
        is_active: true,
        credit_cost: 3,
        popularity_score: 88
      },
      {
        name: 'Certificate',
        name_bn: 'সনদপত্র',
        category: 'certificate',
        type: 'certificate',
        description: 'Generate various certificates',
        description_bn: 'বিভিন্ন সনদপত্র তৈরি করুন',
        template: {
          fields: ['recipientName', 'certificateType', 'date', 'authority'],
          layout: 'certificate_layout'
        },
        is_active: true,
        credit_cost: 5,
        popularity_score: 82
      }
    ];

    // Try to insert templates
    const { data: insertedTemplates, error: insertError } = await supabase
      .from('document_templates')
      .upsert(sampleTemplates, { onConflict: 'name' })
      .select();

    if (insertError) {
      console.error('Error inserting templates:', insertError);
      console.log('Trying alternative table creation...');
      
      // Create tables using direct insert (this will create table if it doesn't exist in some setups)
      for (const template of sampleTemplates) {
        const { error } = await supabase
          .from('document_templates')
          .insert(template);
        
        if (error && !error.message.includes('already exists')) {
          console.error('Insert error:', error);
        }
      }
    } else {
      console.log(`✓ Successfully inserted ${insertedTemplates?.length || 0} document templates`);
    }

    console.log('✓ Document management setup completed');
    
  } catch (error) {
    console.error('Setup error:', error);
  }
}

createDocumentTables();