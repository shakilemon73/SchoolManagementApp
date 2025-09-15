import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vmnmoiaxsahkdmnvrcrg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbm1vaWF4c2Foa2RtbnZyY3JnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0ODMwNjMsImV4cCI6MjA2NDA1OTA2M30.Zx6rBQjgdGge2Y3OedqECwXY3fosC-7mPPrWwdkpEb4';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration missing. Some features may not work.');
}

console.log('Supabase Config Check:', {
  url: supabaseUrl ? 'Found' : 'Missing',
  key: supabaseAnonKey ? 'Found' : 'Missing'
});

// Create singleton Supabase client to avoid multiple instances
let supabaseInstance: SupabaseClient | null = null;

function createSupabaseClient(): SupabaseClient {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'sb-auth-token', // Use a consistent storage key
      }
    });
    console.log('✓ Supabase client initialized successfully');
  }
  return supabaseInstance;
}

export const supabase = createSupabaseClient();

// Helper functions for authentication
export const auth = {
  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    return { data, error };
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  }
};