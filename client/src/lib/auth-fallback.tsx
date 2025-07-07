import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Local storage-based authentication fallback
interface LocalUser {
  id: string;
  email: string;
  name?: string;
  role: string;
  created_at: string;
}

interface AuthFallback {
  user: LocalUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: LocalUser | null; error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: LocalUser | null; error: any }>;
  signOut: () => Promise<void>;
  isSupabaseConnected: boolean;
}

export function useAuthFallback(): AuthFallback {
  const [user, setUser] = useState<LocalUser | null>(() => {
    try {
      const stored = localStorage.getItem('fallback_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      // Try backend authentication first
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const result = await response.json();
        const fallbackUser: LocalUser = {
          id: result.user?.id || Date.now().toString(),
          email,
          name: result.user?.name || email.split('@')[0],
          role: result.user?.role || 'user',
          created_at: new Date().toISOString()
        };
        
        setUser(fallbackUser);
        localStorage.setItem('fallback_user', JSON.stringify(fallbackUser));
        
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });

        return { user: fallbackUser, error: null };
      }

      // Fallback for demo/development mode
      if (email === 'demo@school.com' && password === 'demo123') {
        const demoUser: LocalUser = {
          id: 'demo-user',
          email: 'demo@school.com',
          name: 'Demo User',
          role: 'admin',
          created_at: new Date().toISOString()
        };
        
        setUser(demoUser);
        localStorage.setItem('fallback_user', JSON.stringify(demoUser));
        
        toast({
          title: "Demo login successful",
          description: "Using local authentication",
          variant: "default"
        });

        return { user: demoUser, error: null };
      }

      const errorText = await response.text();
      const error = new Error(errorText || 'Login failed');
      
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive"
      });

      return { user: null, error };
    } catch (error: any) {
      toast({
        title: "Connection error",
        description: "Unable to connect to authentication service",
        variant: "destructive"
      });
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, userData })
      });

      if (response.ok) {
        const result = await response.json();
        const fallbackUser: LocalUser = {
          id: result.user?.id || Date.now().toString(),
          email,
          name: userData?.name || email.split('@')[0],
          role: 'user',
          created_at: new Date().toISOString()
        };

        toast({
          title: "Registration successful",
          description: result.message || "Account created successfully",
        });

        return { user: fallbackUser, error: null };
      }

      const errorText = await response.text();
      const error = new Error(errorText || 'Registration failed');
      return { user: null, error };
    } catch (error: any) {
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // Try to sign out from backend
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.warn('Backend logout failed:', error);
    }

    // Clear local state
    setUser(null);
    localStorage.removeItem('fallback_user');
    
    toast({
      title: "Logged out",
      description: "Successfully signed out",
    });
    
    setLoading(false);
  }, [toast]);

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isSupabaseConnected: false
  };
}