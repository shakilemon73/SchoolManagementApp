import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Complete Parent Portal System - NO EXPRESS SERVER NEEDED!
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

    // Get parent ID from authorization header
    const authHeader = req.headers.get('authorization')
    const parentId = req.headers.get('parent-id') || '1'

    switch (operation) {
      case 'login': {
        const { email, password } = await req.json()
        
        // Authenticate parent
        const { data: authData, error: authError } = await supabaseClient.auth.signInWithPassword({
          email,
          password
        })

        if (authError) throw authError

        // Get parent profile
        const { data: parent, error: parentError } = await supabaseClient
          .from('parents')
          .select('*')
          .eq('user_id', authData.user.id)
          .single()

        if (parentError) throw parentError

        return new Response(
          JSON.stringify({
            success: true,
            parent,
            session: authData.session
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'dashboard': {
        // Get parent's dashboard data
        const { data: parent, error: parentError } = await supabaseClient
          .from('parents')
          .select(`
            *,
            students!parent_students(
              id,
              name,
              class,
              section,
              student_id,
              attendance:attendance(
                date,
                status
              ),
              fee_receipts(
                total_amount,
                due_date,
                status
              ),
              exam_results(
                exam_name,
                marks_obtained,
                total_marks,
                grade
              )
            )
          `)
          .eq('id', parentId)
          .single()

        if (parentError) throw parentError

        // Calculate summary statistics
        const summary = {
          totalChildren: parent.students?.length || 0,
          pendingFees: parent.students?.reduce((total, student) => 
            total + (student.fee_receipts?.filter(fee => fee.status === 'pending').length || 0), 0),
          attendanceToday: parent.students?.reduce((total, student) => 
            total + (student.attendance?.filter(att => 
              att.date === new Date().toISOString().split('T')[0] && att.status === 'present'
            ).length || 0), 0)
        }

        return new Response(
          JSON.stringify({
            parent,
            children: parent.students || [],
            summary
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'children': {
        // Get detailed children information
        const { data: children, error } = await supabaseClient
          .from('students')
          .select(`
            *,
            class_info:classes(class_name, section),
            recent_attendance:attendance(
              date,
              status
            ),
            pending_fees:fee_receipts(
              amount,
              due_date,
              status
            ),
            recent_results:exam_results(
              exam_name,
              marks_obtained,
              total_marks,
              grade,
              exam_date
            )
          `)
          .eq('parent_id', parentId)
          .order('name')

        if (error) throw error

        return new Response(
          JSON.stringify(children || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'notifications': {
        // Get parent-specific notifications
        const { data: notifications, error } = await supabaseClient
          .from('notifications')
          .select('*')
          .or(`recipient_type.eq.parent,recipient_type.eq.all`)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) throw error

        return new Response(
          JSON.stringify(notifications || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'attendance': {
        const { searchParams } = url
        const studentId = searchParams.get('studentId')
        const month = searchParams.get('month') || new Date().getMonth() + 1
        const year = searchParams.get('year') || new Date().getFullYear()

        let query = supabaseClient
          .from('attendance')
          .select(`
            *,
            student:students(name, student_id, class)
          `)
          .gte('date', `${year}-${String(month).padStart(2, '0')}-01`)
          .lt('date', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`)

        if (studentId) {
          query = query.eq('student_id', studentId)
        } else {
          // Get all children of this parent
          const { data: parentStudents } = await supabaseClient
            .from('students')
            .select('id')
            .eq('parent_id', parentId)

          const studentIds = parentStudents?.map(s => s.id) || []
          query = query.in('student_id', studentIds)
        }

        const { data: attendance, error } = await query

        if (error) throw error

        return new Response(
          JSON.stringify(attendance || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'fees': {
        // Get fee information for parent's children
        const { data: parentStudents } = await supabaseClient
          .from('students')
          .select('id')
          .eq('parent_id', parentId)

        const studentIds = parentStudents?.map(s => s.id) || []

        const { data: fees, error } = await supabaseClient
          .from('fee_receipts')
          .select(`
            *,
            student:students(name, student_id, class)
          `)
          .in('student_id', studentIds)
          .order('due_date', { ascending: false })

        if (error) throw error

        return new Response(
          JSON.stringify(fees || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid parent portal operation')
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