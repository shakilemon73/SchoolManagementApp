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

    // Get user credit balance
    const { data: credits, error } = await supabaseClient
      .from('credit_balances')
      .select('balance, credits_used, total_credits_purchased')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      throw error
    }

    // If no credit record exists, create one with default credits
    let creditData = credits
    if (!creditData) {
      const { data: newCredit, error: createError } = await supabaseClient
        .from('credit_balances')
        .insert({
          user_id: userId,
          balance: 50, // Default 50 credits for new users
          credits_used: 0,
          total_credits_purchased: 50
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }
      creditData = newCredit
    }

    return new Response(
      JSON.stringify({
        balance: creditData.balance || 0,
        creditsUsed: creditData.credits_used || 0,
        totalPurchased: creditData.total_credits_purchased || 0
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