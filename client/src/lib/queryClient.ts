import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { supabase } from './supabase';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorMessage = res.statusText;
    try {
      const text = await res.text();
      if (text) {
        // Try to parse JSON error message
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || text;
        } catch {
          errorMessage = text;
        }
      }
    } catch (textError) {
      console.warn('Failed to read error response body:', textError);
    }
    throw new Error(`${res.status}: ${errorMessage}`);
  }
}

export async function apiRequest(
  url: string,
  requestOptions?: {
    method?: string;
    body?: any;
  }
): Promise<Response> {
  // Direct Supabase operations instead of Express API calls
  const method = requestOptions?.method || 'GET';
  const body = requestOptions?.body;

  // Parse the URL to determine the Supabase operation
  const [, resource, ...params] = url.split('/api/')[1]?.split('/') || [];
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  
  try {
    switch (resource) {
      case 'dashboard': {
        if (params[0] === 'stats') {
          const schoolId = parseInt(urlParams.get('schoolId') || '1');
          const [studentsResult, teachersResult, booksResult] = await Promise.all([
            supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
            supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
            supabase.from('library_books').select('id', { count: 'exact', head: true }).eq('school_id', schoolId)
          ]);

          const stats = {
            students: studentsResult.count || 0,
            teachers: teachersResult.count || 0,
            books: booksResult.count || 0,
            timestamp: new Date().toISOString()
          };

          return new Response(JSON.stringify(stats), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        break;
      }
      
      case 'students': {
        const schoolId = parseInt(urlParams.get('schoolId') || '1');
        if (method === 'GET') {
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
        break;
      }
      
      case 'library': {
        if (params[0] === 'books') {
          const schoolId = parseInt(urlParams.get('schoolId') || '1');
          if (method === 'GET') {
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
          } else if (method === 'POST') {
            const { data, error } = await supabase
              .from('library_books')
              .insert(body)
              .select()
              .single();

            if (error) throw error;
            return new Response(JSON.stringify(data), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        break;
      }
      
      case 'user': {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify(user), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // For any unhandled routes, return 404 instead of falling back to Express
    console.warn(`Unhandled Supabase route: ${resource}`);
    return new Response(JSON.stringify({ error: 'Route not implemented in Supabase mode' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    // Handle Supabase errors
    console.error('Supabase API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Use apiRequest to handle all routes through Supabase
      const res = await apiRequest(queryKey[0] as string);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      const data = await res.json();
      return data;
    } catch (error) {
      // Only log actual errors, not expected auth failures
      if (!(error instanceof Error && error.message.includes('401'))) {
        console.error(`API Error for ${queryKey[0]}:`, error);
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
