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
    const { title, message, type, schoolId, userId, targetAudience } = await req.json()
    
    if (!title || !message) {
      throw new Error('Title and message are required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create notification record
    const notificationData = {
      title,
      message,
      type: type || 'info',
      school_id: schoolId || 1,
      user_id: userId,
      target_audience: targetAudience || 'all',
      is_read: false,
      created_at: new Date().toISOString()
    }

    const { data: notification, error } = await supabaseClient
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Send real-time notification via Supabase Realtime
    const channel = supabaseClient.channel('notifications')
    channel.send({
      type: 'broadcast',
      event: 'new_notification',
      payload: notification
    })

    return new Response(
      JSON.stringify({
        success: true,
        notification,
        message: 'Notification sent successfully'
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