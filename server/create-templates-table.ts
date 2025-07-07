import { db } from '../db/index.js';
import { documentTemplates } from '../shared/schema.js';

async function createTemplatesTable() {
  console.log('🔧 Creating document templates table and seeding data...');

  try {
    // Insert sample templates
    const templates = [
      {
        name: 'Standard ID Card',
        nameBn: 'স্ট্যান্ডার্ড আইডি কার্ড',
        type: 'idCard',
        category: 'student_documents',
        categoryBn: 'ছাত্র ডকুমেন্ট',
        description: 'Professional student ID card with photo and QR code',
        descriptionBn: 'ছবি এবং QR কোড সহ পেশাদার শিক্ষার্থী আইডি কার্ড',
        isDefault: true,
        isActive: true,
        isFavorite: true,
        usageCount: 345,
        thumbnailColor: '#3b82f6',
        settings: {
          showLogo: true,
          showSignature: false,
          showQR: true,
          colorScheme: 'blue',
          layout: 'standard',
          fontSize: 'medium',
          orientation: 'portrait'
        },
        createdBy: 'System Admin',
        version: '1.2',
        tags: ['id', 'student', 'card', 'standard']
      },
      {
        name: 'HSC Admit Card',
        nameBn: 'HSC প্রবেশপত্র',
        type: 'admitCard',
        category: 'exam_documents',
        categoryBn: 'পরীক্ষার ডকুমেন্ট',
        description: 'HSC examination admit card template',
        descriptionBn: 'HSC পরীক্ষার প্রবেশপত্র টেমপ্লেট',
        isDefault: false,
        isActive: true,
        isFavorite: false,
        usageCount: 156,
        thumbnailColor: '#059669',
        settings: {
          showLogo: true,
          showSignature: true,
          showQR: false,
          colorScheme: 'green',
          layout: 'official',
          fontSize: 'large',
          orientation: 'portrait'
        },
        createdBy: 'Education Board',
        version: '2.0',
        tags: ['hsc', 'admit', 'exam', 'board']
      },
      {
        name: 'Class Routine',
        nameBn: 'ক্লাস রুটিন',
        type: 'classRoutine',
        category: 'academic_documents',
        categoryBn: 'শিক্ষাগত ডকুমেন্ট',
        description: 'Weekly class schedule template',
        descriptionBn: 'সাপ্তাহিক ক্লাস সময়সূচী টেমপ্লেট',
        isDefault: false,
        isActive: true,
        isFavorite: true,
        usageCount: 89,
        thumbnailColor: '#dc2626',
        settings: {
          showLogo: true,
          showSignature: false,
          showQR: false,
          colorScheme: 'red',
          layout: 'table',
          fontSize: 'small',
          orientation: 'landscape'
        },
        createdBy: 'Academic Department',
        version: '1.5',
        tags: ['class', 'routine', 'schedule', 'weekly']
      },
      {
        name: 'Certificate Template',
        nameBn: 'সার্টিফিকেট টেমপ্লেট',
        type: 'certificate',
        category: 'achievement_documents',
        categoryBn: 'অর্জন ডকুমেন্ট',
        description: 'Academic achievement certificate',
        descriptionBn: 'শিক্ষাগত অর্জনের সার্টিফিকেট',
        isDefault: false,
        isActive: true,
        isFavorite: false,
        usageCount: 234,
        thumbnailColor: '#7c3aed',
        settings: {
          showLogo: true,
          showSignature: true,
          showQR: true,
          colorScheme: 'purple',
          layout: 'decorative',
          fontSize: 'large',
          orientation: 'landscape'
        },
        createdBy: 'Principal',
        version: '1.2',
        tags: ['certificate', 'achievement', 'award', 'recognition']
      }
    ];

    const insertedTemplates = await db.insert(documentTemplates)
      .values(templates)
      .returning();

    console.log(`✅ Successfully seeded ${insertedTemplates.length} document templates`);
    insertedTemplates.forEach(template => {
      console.log(`   - ${template.name} (${template.nameBn})`);
    });

  } catch (error) {
    console.error('Error creating document templates:', error);
  }
}

export { createTemplatesTable };