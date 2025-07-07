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
  // Get current Supabase session for authentication
  const { data: { session } } = await supabase.auth.getSession();
  
  const baseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add Supabase authorization header if session exists
  if (session?.access_token) {
    baseHeaders.Authorization = `Bearer ${session.access_token}`;
  }

  const method = requestOptions?.method || 'GET';
  const body = requestOptions?.body;

  const fetchOptions: RequestInit = {
    method,
    credentials: "include",
    headers: baseHeaders,
  };

  if (body && method !== 'GET') {
    fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  const res = await fetch(url, fetchOptions);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      // Get current Supabase session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      const headers: Record<string, string> = {};
      
      // Add Supabase authorization header if session exists
      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }
      
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers,
      });

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
