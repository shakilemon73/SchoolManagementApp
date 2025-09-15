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
    const { schoolId } = await req.json()
    
    if (!schoolId) {
      throw new Error('School ID is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get comprehensive statistics
    const [
      studentsResult,
      teachersResult,
      booksResult,
      inventoryResult,
      documentsResult,
      creditsResult
    ] = await Promise.all([
      // Students stats
      supabaseClient
        .from('students')
        .select('id, class, gender, created_at')
        .eq('school_id', schoolId),
      
      // Teachers stats
      supabaseClient
        .from('teachers')
        .select('id, department, is_active, created_at')
        .eq('school_id', schoolId),
      
      // Library books stats
      supabaseClient
        .from('library_books')
        .select('id, category, status, created_at')
        .eq('school_id', schoolId),
      
      // Inventory items stats
      supabaseClient
        .from('inventory_items')
        .select('id, category, current_quantity, created_at')
        .eq('school_id', schoolId),
      
      // Generated documents stats
      supabaseClient
        .from('generated_documents')
        .select('id, template_id, created_at'),
      
      // Credit usage stats
      supabaseClient
        .from('credit_balances')
        .select('balance, credits_used, total_credits_purchased')
    ])

    // Process results
    const students = studentsResult.data || []
    const teachers = teachersResult.data || []
    const books = booksResult.data || []
    const inventory = inventoryResult.data || []
    const documents = documentsResult.data || []
    const credits = creditsResult.data || []

    // Calculate detailed statistics
    const stats = {
      // Basic counts
      students: students.length,
      teachers: teachers.length,
      activeTeachers: teachers.filter(t => t.is_active).length,
      books: books.length,
      inventoryItems: inventory.length,
      
      // Document statistics
      documentsGenerated: documents.length,
      documentsThisMonth: documents.filter(d => {
        const docDate = new Date(d.created_at)
        const thisMonth = new Date()
        thisMonth.setDate(1)
        return docDate >= thisMonth
      }).length,
      
      // Credit statistics
      totalCreditsUsed: credits.reduce((sum, c) => sum + (c.credits_used || 0), 0),
      totalCreditsBalance: credits.reduce((sum, c) => sum + (c.balance || 0), 0),
      totalCreditsPurchased: credits.reduce((sum, c) => sum + (c.total_credits_purchased || 0), 0),
      
      // Demographics
      studentsByGender: students.reduce((acc, s) => {
        acc[s.gender || 'unknown'] = (acc[s.gender || 'unknown'] || 0) + 1
        return acc
      }, {}),
      
      studentsByClass: students.reduce((acc, s) => {
        acc[s.class || 'unknown'] = (acc[s.class || 'unknown'] || 0) + 1
        return acc
      }, {}),
      
      teachersByDepartment: teachers.reduce((acc, t) => {
        acc[t.department || 'unknown'] = (acc[t.department || 'unknown'] || 0) + 1
        return acc
      }, {}),
      
      booksByCategory: books.reduce((acc, b) => {
        acc[b.category || 'unknown'] = (acc[b.category || 'unknown'] || 0) + 1
        return acc
      }, {}),
      
      inventoryByCategory: inventory.reduce((acc, i) => {
        acc[i.category || 'unknown'] = (acc[i.category || 'unknown'] || 0) + 1
        return acc
      }, {}),
      
      // Growth trends (monthly)
      growthTrends: {
        studentsThisMonth: students.filter(s => {
          const studentDate = new Date(s.created_at)
          const thisMonth = new Date()
          thisMonth.setDate(1)
          return studentDate >= thisMonth
        }).length,
        
        teachersThisMonth: teachers.filter(t => {
          const teacherDate = new Date(t.created_at)
          const thisMonth = new Date()
          thisMonth.setDate(1)
          return teacherDate >= thisMonth
        }).length,
        
        booksThisMonth: books.filter(b => {
          const bookDate = new Date(b.created_at)
          const thisMonth = new Date()
          thisMonth.setDate(1)
          return bookDate >= thisMonth
        }).length
      }
    }

    return new Response(
      JSON.stringify(stats),
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