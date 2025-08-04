import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Complete Academic System - NO EXPRESS SERVER NEEDED!
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
      case 'attendance': {
        if (req.method === 'GET') {
          const { searchParams } = url
          const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
          const classId = searchParams.get('classId')
          const studentId = searchParams.get('studentId')

          let query = supabaseClient
            .from('attendance')
            .select(`
              *,
              student:students(name, student_id, class, section),
              class:classes(class_name, section)
            `)
            .eq('date', date)

          if (classId) query = query.eq('class_id', classId)
          if (studentId) query = query.eq('student_id', studentId)

          const { data, error } = await query.order('student_id')
          if (error) throw error

          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (req.method === 'POST') {
          const attendanceData = await req.json()
          
          // Batch upsert attendance records
          const { data, error } = await supabaseClient
            .from('attendance')
            .upsert(attendanceData, { 
              onConflict: 'student_id,date' 
            })
            .select()

          if (error) throw error

          return new Response(JSON.stringify({
            success: true,
            records: data.length,
            data
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break
      }

      case 'exams': {
        if (req.method === 'GET') {
          const { searchParams } = url
          const academicYear = searchParams.get('academicYear')
          const classId = searchParams.get('classId')

          let query = supabaseClient
            .from('exams')
            .select(`
              *,
              class:classes(class_name, section),
              subject:subjects(subject_name),
              results:exam_results(
                student_id,
                marks_obtained,
                total_marks,
                grade,
                student:students(name, student_id)
              )
            `)
            .order('exam_date', { ascending: false })

          if (academicYear) query = query.eq('academic_year', academicYear)
          if (classId) query = query.eq('class_id', classId)

          const { data, error } = await query
          if (error) throw error

          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (req.method === 'POST') {
          const examData = await req.json()
          const { data, error } = await supabaseClient
            .from('exams')
            .insert(examData)
            .select()
            .single()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break
      }

      case 'results': {
        if (req.method === 'GET') {
          const { searchParams } = url
          const examId = searchParams.get('examId')
          const studentId = searchParams.get('studentId')
          const classId = searchParams.get('classId')

          let query = supabaseClient
            .from('exam_results')
            .select(`
              *,
              student:students(name, student_id, class, section),
              exam:exams(exam_name, exam_date, total_marks as exam_total_marks),
              subject:subjects(subject_name)
            `)
            .order('exam_id', { ascending: false })

          if (examId) query = query.eq('exam_id', examId)
          if (studentId) query = query.eq('student_id', studentId)
          if (classId) {
            // Get students in the class first
            const { data: classStudents } = await supabaseClient
              .from('students')
              .select('id')
              .eq('class_id', classId)
            
            const studentIds = classStudents?.map(s => s.id) || []
            query = query.in('student_id', studentIds)
          }

          const { data, error } = await query
          if (error) throw error

          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (req.method === 'POST') {
          const resultsData = await req.json()
          
          // Batch insert/update results
          const { data, error } = await supabaseClient
            .from('exam_results')
            .upsert(resultsData, {
              onConflict: 'exam_id,student_id,subject_id'
            })
            .select()

          if (error) throw error

          return new Response(JSON.stringify({
            success: true,
            records: data.length,
            data
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break
      }

      case 'timetable': {
        if (req.method === 'GET') {
          const { searchParams } = url
          const classId = searchParams.get('classId')
          const teacherId = searchParams.get('teacherId')

          let query = supabaseClient
            .from('timetable')
            .select(`
              *,
              class:classes(class_name, section),
              teacher:teachers(name),
              subject:subjects(subject_name)
            `)
            .order('day_of_week')
            .order('start_time')

          if (classId) query = query.eq('class_id', classId)
          if (teacherId) query = query.eq('teacher_id', teacherId)

          const { data, error } = await query
          if (error) throw error

          // Group by day of week for better frontend consumption
          const groupedTimetable = data?.reduce((acc, slot) => {
            const day = slot.day_of_week
            if (!acc[day]) acc[day] = []
            acc[day].push(slot)
            return acc
          }, {}) || {}

          return new Response(JSON.stringify({
            timetable: data || [],
            groupedByDay: groupedTimetable
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }

        if (req.method === 'POST') {
          const timetableData = await req.json()
          const { data, error } = await supabaseClient
            .from('timetable')
            .insert(timetableData)
            .select()

          if (error) throw error

          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break
      }

      case 'academic-calendar': {
        if (req.method === 'GET') {
          const { searchParams } = url
          const academicYear = searchParams.get('academicYear')
          const month = searchParams.get('month')

          let query = supabaseClient
            .from('academic_calendar')
            .select('*')
            .order('event_date')

          if (academicYear) query = query.eq('academic_year', academicYear)
          if (month) {
            const year = new Date().getFullYear()
            query = query
              .gte('event_date', `${year}-${month}-01`)
              .lt('event_date', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`)
          }

          const { data, error } = await query
          if (error) throw error

          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break
      }

      case 'subjects': {
        if (req.method === 'GET') {
          const { searchParams } = url
          const classId = searchParams.get('classId')

          let query = supabaseClient
            .from('subjects')
            .select(`
              *,
              class_subjects!inner(
                class:classes(class_name, section)
              )
            `)
            .order('subject_name')

          if (classId) {
            query = query.eq('class_subjects.class_id', classId)
          }

          const { data, error } = await query
          if (error) throw error

          return new Response(JSON.stringify(data || []), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        break
      }

      default:
        throw new Error('Invalid academic system operation')
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