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
      case 'borrow': {
        const { studentId, bookId, dueDate, notes } = await req.json()
        
        // Check if book is available
        const { data: book, error: bookError } = await supabaseClient
          .from('library_books')
          .select('available_copies, total_copies')
          .eq('id', bookId)
          .single()

        if (bookError || !book || book.available_copies <= 0) {
          throw new Error('Book not available')
        }

        // Create borrow record
        const { data: borrowRecord, error: borrowError } = await supabaseClient
          .from('library_borrowed_books')
          .insert({
            student_id: studentId,
            book_id: bookId,
            due_date: dueDate,
            notes,
            status: 'active',
            borrowed_at: new Date().toISOString()
          })
          .select()
          .single()

        if (borrowError) {
          throw borrowError
        }

        // Update book availability
        await supabaseClient
          .from('library_books')
          .update({ available_copies: book.available_copies - 1 })
          .eq('id', bookId)

        return new Response(
          JSON.stringify({ success: true, borrowRecord }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'return': {
        const { borrowId, returnNotes } = await req.json()
        
        // Get borrow record
        const { data: borrowRecord, error: borrowError } = await supabaseClient
          .from('library_borrowed_books')
          .select('*, library_books(*)')
          .eq('id', borrowId)
          .single()

        if (borrowError || !borrowRecord) {
          throw new Error('Borrow record not found')
        }

        // Update borrow record
        await supabaseClient
          .from('library_borrowed_books')
          .update({
            status: 'returned',
            returned_at: new Date().toISOString(),
            return_notes: returnNotes
          })
          .eq('id', borrowId)

        // Update book availability
        await supabaseClient
          .from('library_books')
          .update({ 
            available_copies: borrowRecord.library_books.available_copies + 1 
          })
          .eq('id', borrowRecord.book_id)

        return new Response(
          JSON.stringify({ success: true, message: 'Book returned successfully' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'stats': {
        const { data: stats, error } = await supabaseClient
          .rpc('get_library_stats')

        if (error) {
          // Fallback calculation
          const [booksResult, borrowedResult, overdueResult] = await Promise.all([
            supabaseClient.from('library_books').select('id', { count: 'exact', head: true }),
            supabaseClient.from('library_borrowed_books').select('id', { count: 'exact', head: true }).eq('status', 'active'),
            supabaseClient.from('library_borrowed_books').select('id', { count: 'exact', head: true }).eq('status', 'active').lt('due_date', new Date().toISOString())
          ])

          return new Response(
            JSON.stringify({
              totalBooks: booksResult.count || 0,
              borrowedBooks: borrowedResult.count || 0,
              overdueBooks: overdueResult.count || 0,
              availableBooks: (booksResult.count || 0) - (borrowedResult.count || 0)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        return new Response(
          JSON.stringify(stats),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'borrowed': {
        const { data: borrowedBooks, error } = await supabaseClient
          .from('library_borrowed_books')
          .select(`
            *,
            students(name, student_id, class),
            library_books(title, author, isbn)
          `)
          .eq('status', 'active')
          .order('borrowed_at', { ascending: false })

        if (error) {
          throw error
        }

        return new Response(
          JSON.stringify(borrowedBooks || []),
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