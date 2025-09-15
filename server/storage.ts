import { supabase } from "./supabase-client";
import session, { type Store } from "express-session";

export interface IStorage {
  getUser: (id: string) => Promise<any>;
  getUserByUsername: (username: string) => Promise<any>;
  getUserByEmail: (email: string) => Promise<any>;
  createUser: (user: any) => Promise<any>;
  updateUserLastLogin: (id: string) => Promise<void>;
  sessionStore: Store;
  
  // School management methods
  getUsers: () => Promise<any[]>;
  getStudents: () => Promise<any[]>;
  getLibraryBooks: () => Promise<any[]>;
  createLibraryBook: (book: any) => Promise<any>;
  getDashboardStats: () => Promise<any>;
}

export class SupabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    this.sessionStore = new session.MemoryStore();
  }

  async getUser(id: string): Promise<any> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByUsername(username: string): Promise<any> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data;
  }

  async getUserByEmail(email: string): Promise<any> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(user: any): Promise<any> {
    const { data, error } = await supabase
      .from('app_users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const { error } = await supabase
      .from('app_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
  }

  async getUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from('app_users')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async getStudents(): Promise<any[]> {
    const { data, error } = await supabase
      .from('students')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async getLibraryBooks(): Promise<any[]> {
    const { data, error } = await supabase
      .from('library_books')
      .select('*');
    
    if (error) throw error;
    return data || [];
  }

  async createLibraryBook(book: any): Promise<any> {
    const { data, error } = await supabase
      .from('library_books')
      .insert(book)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getDashboardStats(): Promise<any> {
    try {
      const [usersResult, studentsResult, booksResult] = await Promise.all([
        supabase.from('app_users').select('id', { count: 'exact' }),
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('library_books').select('id', { count: 'exact' })
      ]);

      return {
        users: usersResult.count || 0,
        students: studentsResult.count || 0,
        books: booksResult.count || 0,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        users: 0,
        students: 0,
        books: 0,
        timestamp: new Date().toISOString()
      };
    }
  }
}

export const storage = new SupabaseStorage();