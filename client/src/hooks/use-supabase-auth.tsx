import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, Session, AuthChangeEvent } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface SupabaseAuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    // Get initial session with timeout to prevent hanging
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (mounted) {
          if (error) {
            console.error('Failed to get initial session:', error);
            toast({
              title: "Authentication Error",
              description: "Failed to initialize authentication",
              variant: "destructive",
            });
          }
          
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Add timeout protection
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (mounted) {
        console.log('Auth state change:', event, session?.user?.email);
        
        // Clear any existing timeout
        clearTimeout(timeoutId);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [toast, loading]);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('Attempting registration via backend API:', { email, userData });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          userData
        }),
      });

      const result = await response.json();
      console.log('Backend registration response:', result);

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }

      toast({
        title: "Registration Successful!",
        description: result.message,
        variant: result.needsConfirmation ? "default" : "default",
      });

      return result;
    } catch (err: any) {
      console.error('Registration error:', err);
      toast({
        title: "রেজিস্ট্রেশন ব্যর্থ",
        description: err.message || "অনুগ্রহ করে আবার চেষ্টা করুন",
        variant: "destructive",
      });
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting Supabase signin with email:', email);
      
      // Add timeout wrapper for network issues
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      );
      
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password
      });

      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any;

      console.log('Supabase signin response:', { data, error });

      if (error) {
        console.error('Supabase signin error:', error);
        
        // Handle network connectivity issues
        if (error.name === 'AuthRetryableFetchError' || error.status === 0) {
          toast({
            title: "নেটওয়ার্ক সমস্যা",
            description: "ইন্টারনেট সংযোগ পরীক্ষা করুন এবং আবার চেষ্টা করুন",
            variant: "destructive",
          });
        } else {
          toast({
            title: "লগইন ব্যর্থ",
            description: error.message,
            variant: "destructive",
          });
        }
        throw error;
      }

      if (data?.user) {
        toast({
          title: "লগইন সফল!",
          description: "স্বাগতম",
        });
      }

      return data;
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.message === 'Connection timeout') {
        toast({
          title: "সংযোগ সমস্যা",
          description: "নেটওয়ার্ক সংযোগ ধীর। আবার চেষ্টা করুন।",
          variant: "destructive",
        });
      } else {
        toast({
          title: "লগইন সমস্যা",
          description: err.message || "অনুগ্রহ করে আবার চেষ্টা করুন",
          variant: "destructive",
        });
      }
      throw err;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast({
          title: "Logout failed",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      
      toast({
        title: "Logged out successfully",
        description: "You have been signed out",
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      toast({
        title: "Logout error",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>
      {children}
    </SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider");
  }
  return context;
}