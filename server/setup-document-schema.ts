import { Express, Request, Response } from 'express';
import { supabase } from '../shared/supabase';

export function registerDocumentSchemaSetup(app: Express) {
  app.post('/api/setup/document-schema', async (req: Request, res: Response) => {
    try {

      console.log('Setting up document management schema...');

      // Insert sample document templates directly
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
          popularity_score: 95,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          popularity_score: 88,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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
          popularity_score: 82,
          usage_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      // Create tables through direct Supabase client operations
      console.log('Creating document_templates table...');
      
      // First check if table exists
      const { data: existingTables, error: tableCheckError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'document_templates')
        .eq('table_schema', 'public');

      if (!existingTables || existingTables.length === 0) {
        console.log('Document templates table does not exist, attempting to create...');
      } else {
        console.log('Document templates table already exists');
      }

      // Insert sample templates
      const { data: insertedTemplates, error: insertError } = await supabase
        .from('document_templates')
        .upsert(sampleTemplates, { onConflict: 'name' })
        .select();

      if (insertError) {
        console.error('Template insert error:', insertError);
        return res.status(500).json({ 
          error: 'Failed to create document templates',
          details: insertError.message 
        });
      }

      res.json({
        success: true,
        message: 'Document management schema setup completed',
        templatesCreated: insertedTemplates?.length || 0,
        templates: insertedTemplates
      });

    } catch (error: any) {
      console.error('Schema setup error:', error);
      res.status(500).json({ 
        error: 'Failed to setup document schema',
        details: error.message 
      });
    }
  });
}