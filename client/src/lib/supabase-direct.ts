import { supabase } from './supabase';

// Direct Supabase database operations to replace Express API calls
export const supabaseDirectAPI = {
  // Students operations
  students: {
    getAll: async (schoolId: number = 1) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      return data;
    },
    
    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    create: async (student: any) => {
      const { data, error } = await supabase
        .from('students')
        .insert(student)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from('students')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    delete: async (id: number) => {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Teachers operations
  teachers: {
    getAll: async (schoolId: number = 1) => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      return data;
    },
    
    getById: async (id: number) => {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    
    create: async (teacher: any) => {
      const { data, error } = await supabase
        .from('teachers')
        .insert(teacher)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Library operations
  library: {
    getBooks: async (schoolId: number = 1) => {
      const { data, error } = await supabase
        .from('library_books')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      return data;
    },
    
    addBook: async (book: any) => {
      const { data, error } = await supabase
        .from('library_books')
        .insert(book)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    updateBook: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from('library_books')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Inventory operations
  inventory: {
    getItems: async (schoolId: number = 1) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      return data;
    },
    
    addItem: async (item: any) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Calendar operations
  calendar: {
    getEvents: async (schoolId: number = 1) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('school_id', schoolId);
      
      if (error) throw error;
      return data;
    },
    
    addEvent: async (event: any) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },

  // Notifications operations
  notifications: {
    getAll: async (schoolId: number = 1) => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    
    create: async (notification: any) => {
      const { data, error } = await supabase
        .from('notifications')
        .insert(notification)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    markAsRead: async (id: number) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      
      if (error) throw error;
    }
  },

  // Dashboard statistics
  dashboard: {
    getStats: async (schoolId: number = 1) => {
      try {
        // Get all counts in parallel
        const [studentsResult, teachersResult, booksResult, inventoryResult] = await Promise.all([
          supabase.from('students').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('library_books').select('id', { count: 'exact', head: true }).eq('school_id', schoolId),
          supabase.from('inventory_items').select('id', { count: 'exact', head: true }).eq('school_id', schoolId)
        ]);

        return {
          students: studentsResult.count || 0,
          teachers: teachersResult.count || 0,
          books: booksResult.count || 0,
          inventory: inventoryResult.count || 0,
          monthlyIncome: 0 // TODO: Implement from fee_receipts table
        };
      } catch (error) {
        console.error('Dashboard stats error:', error);
        return {
          students: 0,
          teachers: 0,
          books: 0,
          inventory: 0,
          monthlyIncome: 0
        };
      }
    }
  }
};

// Helper function to handle Supabase errors consistently
export const handleSupabaseError = (error: any) => {
  console.error('Supabase operation failed:', error);
  throw new Error(error.message || 'Database operation failed');
};