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
    const { userId, amount, reason } = await req.json()
    
    if (!userId || !amount) {
      throw new Error('User ID and amount are required')
    }

    const creditsToDeduct = parseInt(amount)
    if (creditsToDeduct <= 0) {
      throw new Error('Amount must be greater than 0')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get current balance
    const { data: currentBalance, error: balanceError } = await supabaseClient
      .from('credit_balances')
      .select('balance, credits_used')
      .eq('user_id', userId)
      .single()

    if (balanceError) {
      throw new Error('Failed to get user credit balance')
    }

    if (!currentBalance || currentBalance.balance < creditsToDeduct) {
      throw new Error('Insufficient credits')
    }

    // Deduct credits
    const newBalance = currentBalance.balance - creditsToDeduct
    const newCreditsUsed = currentBalance.credits_used + creditsToDeduct

    const { error: updateError } = await supabaseClient
      .from('credit_balances')
      .update({
        balance: newBalance,
        credits_used: newCreditsUsed,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    // Log the transaction
    const { error: logError } = await supabaseClient
      .from('credit_transactions')
      .insert({
        user_id: userId,
        amount: -creditsToDeduct,
        reason: reason || 'Credit deduction',
        balance_after: newBalance,
        created_at: new Date().toISOString()
      })

    if (logError) {
      console.error('Failed to log credit transaction:', logError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        newBalance,
        creditsDeducted: creditsToDeduct,
        message: `${creditsToDeduct} credits deducted. Remaining balance: ${newBalance}`
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