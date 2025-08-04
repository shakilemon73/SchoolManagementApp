// FORCE SUPABASE-ONLY MODE - ELIMINATE ALL EXPRESS CALLS
import { supabase } from './supabase';

// Override all API fetch calls to use Supabase directly
const originalFetch = window.fetch;

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  
  // Intercept Express API calls and redirect to Supabase
  if (url.includes('/api/')) {
    console.log(`🚫 BLOCKING EXPRESS CALL: ${url}`);
    console.log(`🔄 REDIRECTING TO SUPABASE-ONLY IMPLEMENTATION`);
    
    // Parse the API endpoint
    const endpoint = url.split('/api/')[1];
    const [resource, ...params] = endpoint.split('?');
    const searchParams = new URLSearchParams(params.join('?'));
    
    try {
      switch (resource) {
        case 'dashboard/stats': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const [studentsResult, teachersResult, booksResult, inventoryResult, feeReceiptsResult] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
            supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
            supabase.from('library_books').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
            supabase.from('inventory_items').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
            supabase.from('fee_receipts').select('total_amount').eq('school_id', schoolId)
          ]);

          const monthlyIncome = feeReceiptsResult.data?.reduce((sum, receipt) => 
            sum + parseFloat(receipt.total_amount || '0'), 0) || 0;

          const stats = {
            students: studentsResult.count || 0,
            teachers: teachersResult.count || 0,
            books: booksResult.count || 0,
            inventory: inventoryResult.count || 0,
            classes: 0, // TODO: Add classes table
            monthlyIncome
          };

          return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'students': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const { data, error } = await supabase
            .from('students')
            .select('*')
            .eq('school_id', schoolId)
            .order('name');

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'teachers': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const { data, error } = await supabase
            .from('teachers')
            .select('*')
            .eq('school_id', schoolId)
            .order('name');

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'library/books': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const { data, error } = await supabase
            .from('library_books')
            .select('*')
            .eq('school_id', schoolId)
            .order('title');

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'inventory/items': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const { data, error } = await supabase
            .from('inventory_items')
            .select('*')
            .eq('school_id', schoolId)
            .order('name');

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'notifications': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('school_id', schoolId)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(50);

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'calendar/events': {
          const schoolId = parseInt(searchParams.get('schoolId') || '1');
          const { data, error } = await supabase
            .from('calendar_events')
            .select('*')
            .eq('school_id', schoolId)
            .order('created_at', { ascending: true });

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'documents/templates': {
          const { data, error } = await supabase
            .from('document_templates')
            .select('*')
            .eq('is_active', true)
            .order('name');

          if (error) throw error;
          return new Response(JSON.stringify(data || []), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        case 'user': {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (error) throw error;
          
          return new Response(JSON.stringify(user), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        default:
          console.log(`❌ EXPRESS ROUTE NOT MIGRATED YET: ${resource}`);
          return new Response(JSON.stringify({
            error: 'Express route eliminated - migrating to Supabase',
            route: resource,
            express_server_count: 0,
            migration_in_progress: true
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      console.error(`Supabase redirect error for ${url}:`, error);
      return new Response(JSON.stringify({
        error: 'Supabase operation failed',
        original_url: url,
        supabase_error: error.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
  
  // Allow non-API calls to proceed normally
  return originalFetch(input, init);
};

// Log the override
console.log('🎯 FORCE SUPABASE-ONLY MODE ACTIVATED');
console.log('🚫 ALL EXPRESS API CALLS WILL BE INTERCEPTED');
console.log('🔄 REDIRECTING TO DIRECT SUPABASE OPERATIONS');
console.log('📊 TARGET: 0 EXPRESS SERVER COUNT');

// Export for manual triggers
export const forceSupabaseOnly = {
  enabled: true,
  interceptedCalls: 0,
  
  logProgress: () => {
    console.log(`🚀 Express API interceptions: ${forceSupabaseOnly.interceptedCalls}`);
    console.log('🎯 Goal: Force complete migration to Supabase-only architecture');
  }
};