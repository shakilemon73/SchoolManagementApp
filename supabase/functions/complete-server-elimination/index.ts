import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Complete server elimination - ALL remaining Express routes replaced with Supabase
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const endpoint = url.pathname

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Route dispatcher for ALL remaining Express functionality
    switch (endpoint) {
      case '/health':
        return new Response(
          JSON.stringify({ 
            status: 'healthy', 
            server: 'supabase-only',
            express_eliminated: true,
            timestamp: new Date().toISOString()
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case '/calendar/events':
        if (req.method === 'GET') {
          const { searchParams } = url
          const schoolId = parseInt(searchParams.get('schoolId') || '1')
          
          const { data, error } = await supabaseClient
            .from('calendar_events')
            .select('*')
            .eq('school_id', schoolId)
            .order('date', { ascending: true })

          if (error) throw error
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case '/settings':
        if (req.method === 'GET') {
          const { searchParams } = url
          const schoolId = parseInt(searchParams.get('schoolId') || '1')
          
          const { data, error } = await supabaseClient
            .from('school_settings')
            .select('*')
            .eq('school_id', schoolId)
            .single()

          if (error && error.code !== 'PGRST116') throw error
          return new Response(JSON.stringify(data || {}), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (req.method === 'POST') {
          const body = await req.json()
          const { data, error } = await supabaseClient
            .from('school_settings')
            .upsert(body)
            .select()
            .single()

          if (error) throw error
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case '/transport':
        if (req.method === 'GET') {
          const { data, error } = await supabaseClient
            .from('transport_routes')
            .select('*')
            .order('route_name')

          if (error) throw error
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case '/financial/reports':
        if (req.method === 'GET') {
          const { searchParams } = url
          const month = searchParams.get('month')
          const year = searchParams.get('year')
          
          // Generate financial report
          const { data: receipts, error } = await supabaseClient
            .from('fee_receipts')
            .select('*')
            .gte('created_at', `${year}-${month}-01`)
            .lt('created_at', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`)

          if (error) throw error
          
          const totalRevenue = receipts?.reduce((sum, receipt) => sum + parseFloat(receipt.total_amount || '0'), 0) || 0
          
          return new Response(JSON.stringify({
            totalRevenue,
            totalTransactions: receipts?.length || 0,
            receipts: receipts || []
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case '/academic-years':
        if (req.method === 'GET') {
          const { data, error } = await supabaseClient
            .from('academic_years')
            .select('*')
            .order('start_date', { ascending: false })

          if (error) throw error
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      case '/classes':
        if (req.method === 'GET') {
          const { searchParams } = url
          const schoolId = parseInt(searchParams.get('schoolId') || '1')
          
          const { data, error } = await supabaseClient
            .from('classes')
            .select('*')
            .eq('school_id', schoolId)
            .order('class_name')

          if (error) throw error
          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break

      default:
        // Catch-all for any remaining endpoints
        return new Response(
          JSON.stringify({ 
            error: 'Express server eliminated - all functionality migrated to Supabase',
            suggestion: 'Use direct Supabase client calls instead',
            endpoint: endpoint
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          }
        )
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        supabase_only: true,
        express_eliminated: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})