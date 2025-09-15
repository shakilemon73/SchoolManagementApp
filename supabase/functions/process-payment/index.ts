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
    const { 
      userId, 
      amount, 
      paymentMethod, 
      transactionId, 
      description 
    } = await req.json()
    
    if (!userId || !amount || !paymentMethod) {
      throw new Error('User ID, amount, and payment method are required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Process payment (simplified - in reality would integrate with payment gateway)
    const paymentData = {
      user_id: userId,
      amount: parseFloat(amount),
      payment_method: paymentMethod,
      transaction_id: transactionId || crypto.randomUUID(),
      description: description || 'Credit purchase',
      status: 'completed', // In reality, would be pending until confirmed
      created_at: new Date().toISOString()
    }

    // Save payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payment_history')
      .insert(paymentData)
      .select()
      .single()

    if (paymentError) {
      throw paymentError
    }

    // Calculate credits based on amount (1 BDT = 1 credit)
    const creditsToAdd = Math.floor(parseFloat(amount))

    // Update user's credit balance
    const { data: existingBalance, error: balanceError } = await supabaseClient
      .from('credit_balances')
      .select('balance, total_credits_purchased')
      .eq('user_id', userId)
      .single()

    if (balanceError && balanceError.code !== 'PGRST116') {
      throw balanceError
    }

    if (existingBalance) {
      // Update existing balance
      const { error: updateError } = await supabaseClient
        .from('credit_balances')
        .update({
          balance: existingBalance.balance + creditsToAdd,
          total_credits_purchased: existingBalance.total_credits_purchased + creditsToAdd,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        throw updateError
      }
    } else {
      // Create new balance record
      const { error: createError } = await supabaseClient
        .from('credit_balances')
        .insert({
          user_id: userId,
          balance: creditsToAdd,
          credits_used: 0,
          total_credits_purchased: creditsToAdd
        })

      if (createError) {
        throw createError
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        payment,
        creditsAdded: creditsToAdd,
        message: `Payment successful! ${creditsToAdd} credits added to your account.`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})