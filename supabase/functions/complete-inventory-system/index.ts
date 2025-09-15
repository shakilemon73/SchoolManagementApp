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

  const url = new URL(req.url)
  const operation = url.pathname.split('/').pop()

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    switch (operation) {
      case 'movements': {
        if (req.method === 'POST') {
          const { itemId, type, quantity, reason, reference, notes } = await req.json()
          
          // Get current item
          const { data: item, error: itemError } = await supabaseClient
            .from('inventory_items')
            .select('current_quantity')
            .eq('id', itemId)
            .single()

          if (itemError || !item) {
            throw new Error('Item not found')
          }

          let newQuantity = item.current_quantity
          if (type === 'in') {
            newQuantity += quantity
          } else if (type === 'out') {
            newQuantity -= quantity
            if (newQuantity < 0) {
              throw new Error('Insufficient quantity')
            }
          } else if (type === 'adjustment') {
            newQuantity = quantity
          }

          // Create movement record
          const { error: movementError } = await supabaseClient
            .from('inventory_movements')
            .insert({
              item_id: itemId,
              type,
              quantity: type === 'out' ? -quantity : quantity,
              reason,
              reference,
              notes,
              quantity_before: item.current_quantity,
              quantity_after: newQuantity,
              created_at: new Date().toISOString()
            })

          if (movementError) {
            throw movementError
          }

          // Update item quantity
          await supabaseClient
            .from('inventory_items')
            .update({ current_quantity: newQuantity })
            .eq('id', itemId)

          return new Response(
            JSON.stringify({ success: true, newQuantity }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        } else {
          // GET movements
          const { data: movements, error } = await supabaseClient
            .from('inventory_movements')
            .select(`
              *,
              inventory_items(name, name_bn)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

          if (error) {
            throw error
          }

          return new Response(
            JSON.stringify(movements || []),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }

      case 'stats': {
        const [itemsResult, movementsResult, lowStockResult] = await Promise.all([
          supabaseClient.from('inventory_items').select('id, current_quantity, unit_price', { count: 'exact' }),
          supabaseClient.from('inventory_movements').select('quantity', { count: 'exact' }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
          supabaseClient.from('inventory_items').select('id', { count: 'exact', head: true }).lt('current_quantity', 'minimum_threshold')
        ])

        const totalValue = itemsResult.data?.reduce((sum, item) => 
          sum + (item.current_quantity * parseFloat(item.unit_price || '0')), 0) || 0

        return new Response(
          JSON.stringify({
            totalItems: itemsResult.count || 0,
            totalValue: totalValue,
            recentMovements: movementsResult.count || 0,
            lowStockItems: lowStockResult.count || 0
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'low-stock': {
        const { data: lowStockItems, error } = await supabaseClient
          .from('inventory_items')
          .select('*')
          .lt('current_quantity', 'minimum_threshold')
          .order('current_quantity', { ascending: true })

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify(lowStockItems || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid operation')
    }

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