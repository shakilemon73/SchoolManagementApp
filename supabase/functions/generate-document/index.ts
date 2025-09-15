import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { templateId, data } = await req.json()
    
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get document template
    const { data: template, error: templateError } = await supabaseClient
      .from('document_templates')
      .select('*')
      .eq('id', templateId)
      .single()

    if (templateError) {
      throw new Error('Template not found')
    }

    // Generate document based on template
    // This is a simplified version - in reality, you'd have complex PDF generation logic
    const generatedDocument = {
      id: crypto.randomUUID(),
      templateId,
      templateName: template.name,
      data,
      createdAt: new Date().toISOString(),
      downloadUrl: `https://your-storage.com/documents/${crypto.randomUUID()}.pdf`
    }

    // Save generation record
    const { error: saveError } = await supabaseClient
      .from('generated_documents')
      .insert({
        template_id: templateId,
        user_id: data.userId,
        document_data: data,
        status: 'completed',
        download_url: generatedDocument.downloadUrl
      })

    if (saveError) {
      console.error('Failed to save document record:', saveError)
    }

    return new Response(
      JSON.stringify(generatedDocument),
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