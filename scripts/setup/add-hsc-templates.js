import pkg from 'pg';
const { Pool } = pkg;

// Get the DATABASE_URL from environment variables (direct connection)
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addHSCTemplates() {
  try {
    console.log('Adding HSC templates to database...');

    // HSC Template configurations
    const hscTemplates = [
      {
        name: 'HSC Standard Template',
        nameBn: 'HSC স্ট্যান্ডার্ড টেমপ্লেট',
        description: 'Standard HSC admit card template for all boards',
        category: 'hsc',
        layout: JSON.stringify({
          header: {
            logo: true,
            instituteName: true,
            documentType: 'প্রবেশপত্র',
            examYear: true
          },
          studentInfo: {
            photo: true,
            name: true,
            fatherName: true,
            motherName: true,
            rollNumber: true,
            registrationNumber: true,
            session: true,
            group: true
          },
          examDetails: {
            centerName: true,
            centerCode: true,
            examType: 'HSC',
            subjects: true,
            dateTime: true
          },
          footer: {
            signature: true,
            controllerSignature: true,
            instructions: true
          }
        }),
        isActive: true,
        fields: JSON.stringify({
          instituteName: { required: true, type: 'text' },
          studentName: { required: true, type: 'text' },
          studentNameBn: { required: true, type: 'text' },
          fatherName: { required: true, type: 'text' },
          motherName: { required: true, type: 'text' },
          rollNumber: { required: true, type: 'text' },
          registrationNumber: { required: true, type: 'text' },
          session: { required: true, type: 'text' },
          group: { required: true, type: 'select', options: ['Science', 'Commerce', 'Arts'] },
          centerName: { required: true, type: 'text' },
          centerCode: { required: true, type: 'text' },
          subjects: { required: true, type: 'array' }
        })
      },
      {
        name: 'HSC Science Template',
        nameBn: 'HSC বিজ্ঞান টেমপ্লেট',
        description: 'HSC admit card template specifically for Science group',
        category: 'hsc',
        layout: JSON.stringify({
          header: {
            logo: true,
            instituteName: true,
            documentType: 'প্রবেশপত্র',
            examYear: true,
            group: 'Science'
          },
          studentInfo: {
            photo: true,
            name: true,
            fatherName: true,
            motherName: true,
            rollNumber: true,
            registrationNumber: true,
            session: true,
            group: 'Science'
          },
          examDetails: {
            centerName: true,
            centerCode: true,
            examType: 'HSC',
            subjects: true,
            dateTime: true
          },
          footer: {
            signature: true,
            controllerSignature: true,
            instructions: true
          }
        }),
        isActive: true,
        fields: JSON.stringify({
          instituteName: { required: true, type: 'text' },
          studentName: { required: true, type: 'text' },
          studentNameBn: { required: true, type: 'text' },
          fatherName: { required: true, type: 'text' },
          motherName: { required: true, type: 'text' },
          rollNumber: { required: true, type: 'text' },
          registrationNumber: { required: true, type: 'text' },
          session: { required: true, type: 'text' },
          centerName: { required: true, type: 'text' },
          centerCode: { required: true, type: 'text' },
          subjects: { required: true, type: 'array', defaultValue: ['Physics', 'Chemistry', 'Mathematics', 'Biology'] }
        })
      },
      {
        name: 'HSC Commerce Template',
        nameBn: 'HSC বাণিজ্য টেমপ্লেট',
        description: 'HSC admit card template specifically for Commerce group',
        category: 'hsc',
        layout: JSON.stringify({
          header: {
            logo: true,
            instituteName: true,
            documentType: 'প্রবেশপত্র',
            examYear: true,
            group: 'Commerce'
          },
          studentInfo: {
            photo: true,
            name: true,
            fatherName: true,
            motherName: true,
            rollNumber: true,
            registrationNumber: true,
            session: true,
            group: 'Commerce'
          },
          examDetails: {
            centerName: true,
            centerCode: true,
            examType: 'HSC',
            subjects: true,
            dateTime: true
          },
          footer: {
            signature: true,
            controllerSignature: true,
            instructions: true
          }
        }),
        isActive: true,
        fields: JSON.stringify({
          instituteName: { required: true, type: 'text' },
          studentName: { required: true, type: 'text' },
          studentNameBn: { required: true, type: 'text' },
          fatherName: { required: true, type: 'text' },
          motherName: { required: true, type: 'text' },
          rollNumber: { required: true, type: 'text' },
          registrationNumber: { required: true, type: 'text' },
          session: { required: true, type: 'text' },
          centerName: { required: true, type: 'text' },
          centerCode: { required: true, type: 'text' },
          subjects: { required: true, type: 'array', defaultValue: ['Accounting', 'Business Studies', 'Economics', 'Finance'] }
        })
      }
    ];

    for (const template of hscTemplates) {
      // Check if template already exists
      const existingTemplate = await pool.query(
        'SELECT id FROM admit_card_templates WHERE name = $1 AND category = $2',
        [template.name, template.category]
      );

      if (existingTemplate.rows.length === 0) {
        const templateData = {
          layout: JSON.parse(template.layout),
          fields: JSON.parse(template.fields)
        };

        const result = await pool.query(`
          INSERT INTO admit_card_templates (
            name, name_bn, description, category, template_data, is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
          RETURNING id
        `, [
          template.name,
          template.nameBn,
          template.description,
          template.category,
          JSON.stringify(templateData),
          template.isActive
        ]);

        console.log(`✓ Added HSC template: ${template.name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`⚠ HSC template already exists: ${template.name}`);
      }
    }

    console.log('\n✓ HSC templates setup completed successfully!');
    
  } catch (error) {
    console.error('Error adding HSC templates:', error);
  } finally {
    await pool.end();
  }
}

addHSCTemplates();