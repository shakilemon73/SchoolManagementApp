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
    const { userId } = await req.json()
    
    if (!userId) {
      throw new Error('User ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user document generation stats
    const { data: stats, error } = await supabaseClient
      .from('generated_documents')
      .select('template_id, created_at')
      .eq('user_id', userId)

    if (error) {
      throw error
    }

    // Calculate stats
    const totalGenerated = stats?.length || 0
    const thisMonth = new Date()
    thisMonth.setDate(1)
    thisMonth.setHours(0, 0, 0, 0)

    const monthlyGenerated = stats?.filter(doc => 
      new Date(doc.created_at) >= thisMonth
    ).length || 0

    // Get most used templates
    const templateCounts = stats?.reduce((acc: any, doc) => {
      acc[doc.template_id] = (acc[doc.template_id] || 0) + 1
      return acc
    }, {}) || {}

    const mostUsedTemplateId = Object.keys(templateCounts).reduce((a, b) => 
      templateCounts[a] > templateCounts[b] ? a : b, null
    )

    return new Response(
      JSON.stringify({
        totalGenerated,
        monthlyGenerated,
        mostUsedTemplateId,
        recentDocuments: stats?.slice(-5) || []
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