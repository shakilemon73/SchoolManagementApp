import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Document generation for ALL 54+ templates 
const DOCUMENT_TEMPLATES = {
  'student-id-card': { name: 'Student ID Card', cost: 2 },
  'admit-card': { name: 'Admit Card', cost: 3 },
  'fee-receipt': { name: 'Fee Receipt', cost: 1 },
  'marksheet': { name: 'Marksheet', cost: 4 },
  'testimonial': { name: 'Testimonial', cost: 5 },
  'certificate': { name: 'Certificate', cost: 4 },
  'transfer-certificate': { name: 'Transfer Certificate', cost: 6 },
  'character-certificate': { name: 'Character Certificate', cost: 4 },
  'study-certificate': { name: 'Study Certificate', cost: 3 },
  'salary-certificate': { name: 'Salary Certificate', cost: 3 },
  'experience-certificate': { name: 'Experience Certificate', cost: 4 },
  'employment-letter': { name: 'Employment Letter', cost: 3 },
  'recommendation-letter': { name: 'Recommendation Letter', cost: 4 },
  'leave-application': { name: 'Leave Application', cost: 2 },
  'joining-letter': { name: 'Joining Letter', cost: 3 },
  'resignation-letter': { name: 'Resignation Letter', cost: 3 },
  'appointment-letter': { name: 'Appointment Letter', cost: 4 },
  'promotion-letter': { name: 'Promotion Letter', cost: 4 },
  'increment-letter': { name: 'Increment Letter', cost: 3 },
  'warning-letter': { name: 'Warning Letter', cost: 2 },
  'termination-letter': { name: 'Termination Letter', cost: 4 },
  'noc': { name: 'No Objection Certificate', cost: 4 },
  'bonafide-certificate': { name: 'Bonafide Certificate', cost: 3 },
  'income-certificate': { name: 'Income Certificate', cost: 3 },
  'domicile-certificate': { name: 'Domicile Certificate', cost: 4 },
  'caste-certificate': { name: 'Caste Certificate', cost: 3 },
  'birth-certificate': { name: 'Birth Certificate', cost: 4 },
  'death-certificate': { name: 'Death Certificate', cost: 4 },
  'marriage-certificate': { name: 'Marriage Certificate', cost: 5 },
  'divorce-certificate': { name: 'Divorce Certificate', cost: 5 },
  'passport-application': { name: 'Passport Application', cost: 6 },
  'visa-application': { name: 'Visa Application', cost: 7 },
  'scholarship-form': { name: 'Scholarship Form', cost: 4 },
  'admission-form': { name: 'Admission Form', cost: 5 },
  'exam-form': { name: 'Exam Form', cost: 3 },
  'result-sheet': { name: 'Result Sheet', cost: 4 },
  'grade-sheet': { name: 'Grade Sheet', cost: 4 },
  'transcript': { name: 'Official Transcript', cost: 6 },
  'hall-ticket': { name: 'Hall Ticket', cost: 2 },
  'library-card': { name: 'Library Card', cost: 1 },
  'bus-pass': { name: 'Bus Pass', cost: 2 },
  'health-certificate': { name: 'Health Certificate', cost: 3 },
  'medical-certificate': { name: 'Medical Certificate', cost: 4 },
  'fitness-certificate': { name: 'Fitness Certificate', cost: 3 },
  'sports-certificate': { name: 'Sports Certificate', cost: 4 },
  'participation-certificate': { name: 'Participation Certificate', cost: 3 },
  'achievement-certificate': { name: 'Achievement Certificate', cost: 5 },
  'merit-certificate': { name: 'Merit Certificate', cost: 5 },
  'excellence-award': { name: 'Excellence Award', cost: 6 },
  'completion-certificate': { name: 'Course Completion Certificate', cost: 5 },
  'training-certificate': { name: 'Training Certificate', cost: 4 },
  'workshop-certificate': { name: 'Workshop Certificate', cost: 4 },
  'seminar-certificate': { name: 'Seminar Certificate', cost: 4 },
  'conference-certificate': { name: 'Conference Certificate', cost: 5 },
  'internship-certificate': { name: 'Internship Certificate', cost: 5 },
  'project-certificate': { name: 'Project Certificate', cost: 4 }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateType, data, userId } = await req.json()
    
    if (!templateType || !data || !userId) {
      throw new Error('Template type, data, and user ID are required')
    }

    const template = DOCUMENT_TEMPLATES[templateType]
    if (!template) {
      throw new Error('Invalid template type')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Check user credits
    const { data: creditBalance, error: creditError } = await supabaseClient
      .from('credit_balances')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (creditError || !creditBalance || creditBalance.balance < template.cost) {
      throw new Error('Insufficient credits')
    }

    // Generate document (simplified PDF generation)
    const documentId = crypto.randomUUID()
    const pdfContent = generatePDF(templateType, data)
    
    // Save document record
    const { error: saveError } = await supabaseClient
      .from('generated_documents')
      .insert({
        id: documentId,
        template_type: templateType,
        template_name: template.name,
        user_id: userId,
        document_data: data,
        status: 'completed',
        download_url: `https://storage.supabase.com/documents/${documentId}.pdf`,
        credits_used: template.cost,
        created_at: new Date().toISOString()
      })

    if (saveError) {
      throw saveError
    }

    // Deduct credits
    const { error: deductError } = await supabaseClient
      .from('credit_balances')
      .update({ 
        balance: creditBalance.balance - template.cost,
        credits_used: (creditBalance.credits_used || 0) + template.cost 
      })
      .eq('user_id', userId)

    if (deductError) {
      console.error('Failed to deduct credits:', deductError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        documentId,
        downloadUrl: `https://storage.supabase.com/documents/${documentId}.pdf`,
        creditsUsed: template.cost,
        remainingCredits: creditBalance.balance - template.cost
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

// Simplified PDF generation function
function generatePDF(templateType: string, data: any): string {
  // In a real implementation, this would generate actual PDFs
  // For now, return a base64-encoded placeholder
  const pdfHeader = `%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj`
  return btoa(pdfHeader + `\n\n// Template: ${templateType}\n// Data: ${JSON.stringify(data)}`)
}