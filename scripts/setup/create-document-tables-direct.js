const { Pool } = require('pg');
require('dotenv').config();

async function createDocumentTables() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('Connecting to database...');
    
    // Create document_templates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS document_templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
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
    `);
    
    console.log('✓ document_templates table created');

    // Create generated_documents table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS generated_documents (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        template_id INTEGER NOT NULL,
        data JSONB NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        file_path VARCHAR(500),
        file_size INTEGER,
        download_count INTEGER DEFAULT 0,
        FOREIGN KEY (template_id) REFERENCES document_templates(id)
      );
    `);
    
    console.log('✓ generated_documents table created');

    // Insert sample templates
    const sampleTemplates = [
      {
        name: 'Student ID Card',
        name_bn: 'ছাত্র পরিচয়পত্র',
        category: 'identity',
        type: 'id_card',
        description: 'Generate student identification cards',
        description_bn: 'ছাত্র পরিচয়পত্র তৈরি করুন',
        template: JSON.stringify({
          fields: ['name', 'studentId', 'class', 'section', 'photo'],
          layout: 'standard_id_card'
        }),
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
        template: JSON.stringify({
          fields: ['name', 'rollNumber', 'examName', 'examDate', 'center'],
          layout: 'admit_card_layout'
        }),
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
        template: JSON.stringify({
          fields: ['recipientName', 'certificateType', 'date', 'authority'],
          layout: 'certificate_layout'
        }),
        credit_cost: 5,
        popularity_score: 82
      },
      {
        name: 'Progress Report',
        name_bn: 'অগ্রগতি প্রতিবেদন',
        category: 'academic',
        type: 'progress_report',
        description: 'Generate student progress reports',
        description_bn: 'ছাত্র অগ্রগতি প্রতিবেদন তৈরি করুন',
        template: JSON.stringify({
          fields: ['studentName', 'class', 'subjects', 'grades', 'period'],
          layout: 'progress_report_layout'
        }),
        credit_cost: 4,
        popularity_score: 76
      }
    ];

    for (const template of sampleTemplates) {
      try {
        await pool.query(`
          INSERT INTO document_templates (name, name_bn, category, type, description, description_bn, template, credit_cost, popularity_score)
          VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, $9)
          ON CONFLICT (name) DO NOTHING
        `, [
          template.name,
          template.name_bn,
          template.category,
          template.type,
          template.description,
          template.description_bn,
          template.template,
          template.credit_cost,
          template.popularity_score
        ]);
        console.log(`✓ Inserted template: ${template.name}`);
      } catch (error) {
        console.log(`Template already exists: ${template.name}`);
      }
    }

    // Verify tables exist
    const { rows } = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('document_templates', 'generated_documents')
    `);
    
    console.log('✓ Verified tables:', rows.map(r => r.table_name));

    // Check template count
    const { rows: templateCount } = await pool.query('SELECT COUNT(*) as count FROM document_templates');
    console.log(`✓ Templates in database: ${templateCount[0].count}`);

  } catch (error) {
    console.error('Error creating document tables:', error);
  } finally {
    await pool.end();
  }
}

createDocumentTables();