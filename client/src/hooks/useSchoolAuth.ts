import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface SchoolUser {
  id: string;
  email: string;
  schoolId: string;
  schoolName: string;
  role: string;
}

export function useSchoolAuth() {
  const [user, setUser] = useState<SchoolUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Fetch user profile with school information
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          role,
          school_id,
          schools (
            id,
            name
          )
        `)
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          schoolId: data.school_id,
          schoolName: data.schools?.name || 'Unknown School',
          role: data.role
        });
      }
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: !!user,
    schoolId: user?.schoolId
  };
}