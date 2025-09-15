import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { 
  User, InsertUser,
  Student, InsertStudent,
  Teacher, InsertTeacher,
  LibraryBook, InsertLibraryBook,
  DocumentTemplate, InsertDocumentTemplate,
  Notification, InsertNotification,
  Event, InsertEvent,
  FeePayment, InsertFeePayment,
  Attendance, InsertAttendance,
  School
} from './consolidated-schema';

// Supabase client configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase configuration missing. Some features may not work.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// ============================================================================
// TYPE-SAFE SUPABASE SERVICE LAYER
// ============================================================================

export class SupabaseService {
  private client: SupabaseClient;
  
  constructor(client: SupabaseClient) {
    this.client = client;
  }

  // Expose client for direct access when needed
  get client() {
    return this.client;
  }

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  async signUp(email: string, password: string, userData: Partial<InsertUser>) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.client.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error) throw error;
    return user;
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return this.client.auth.onAuthStateChange(callback);
  }

  // ============================================================================
  // USER MANAGEMENT
  // ============================================================================

  async getUsers(schoolId?: number): Promise<User[]> {
    let query = this.client.from('users').select(`
      *, 
      school:schools(name, name_bn),
      student:students(*),
      teacher:teachers(*)
    `);
    
    if (schoolId) {
      query = query.eq('school_id', schoolId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }

  async getUserById(id: number): Promise<User | null> {
    const { data, error } = await this.client
      .from('users')
      .select('*, school:schools(*), student:students(*), teacher:teachers(*)')
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const { data, error } = await this.client
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ============================================================================
  // STUDENT MANAGEMENT
  // ============================================================================

  async getStudents(schoolId: number, filters?: {
    class?: string;
    section?: string;
    status?: string;
  }): Promise<Student[]> {
    let query = this.client
      .from('students')
      .select(`
        *, 
        user:users(name, email, phone_number, profile_picture),
        school:schools(name, name_bn)
      `)
      .eq('school_id', schoolId);
    
    if (filters?.class) {
      query = query.eq('class', filters.class);
    }
    if (filters?.section) {
      query = query.eq('section', filters.section);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    
    const { data, error } = await query.order('name');
    if (error) throw error;
    return data || [];
  }

  async getStudentById(id: number): Promise<Student | null> {
    const { data, error } = await this.client
      .from('students')
      .select(`
        *, 
        user:users(*),
        school:schools(*),
        borrowed_books:library_borrowed_books(*, book:library_books(*)),
        attendance:attendance(*)
      `)
      .eq('id', id)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const { data, error } = await this.client
      .from('students')
      .insert(student)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student> {
    const { data, error } = await this.client
      .from('students')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ============================================================================
  // TEACHER MANAGEMENT
  // ============================================================================

  async getTeachers(schoolId: number): Promise<Teacher[]> {
    const { data, error } = await this.client
      .from('teachers')
      .select(`
        *, 
        user:users(name, email, phone_number, profile_picture),
        school:schools(name, name_bn)
      `)
      .eq('school_id', schoolId)
      .order('user(name)');
    
    if (error) throw error;
    return data || [];
  }

  async createTeacher(teacher: InsertTeacher): Promise<Teacher> {
    const { data, error } = await this.client
      .from('teachers')
      .insert(teacher)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ============================================================================
  // LIBRARY MANAGEMENT
  // ============================================================================

  async getLibraryBooks(schoolId: number, filters?: {
    category?: string;
    available?: boolean;
    search?: string;
  }): Promise<LibraryBook[]> {
    let query = this.client
      .from('library_books')
      .select('*')
      .eq('school_id', schoolId);
    
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.available) {
      query = query.gt('available_copies', 0);
    }
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query.order('title');
    if (error) throw error;
    return data || [];
  }

  async createLibraryBook(book: InsertLibraryBook): Promise<LibraryBook> {
    const { data, error } = await this.client
      .from('library_books')
      .insert(book)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async borrowBook(bookId: number, studentId: number, dueDate: string, schoolId: number) {
    // Start transaction
    const { error: borrowError } = await this.client
      .from('library_borrowed_books')
      .insert({
        book_id: bookId,
        student_id: studentId,
        due_date: dueDate,
        school_id: schoolId,
        status: 'borrowed'
      });
    
    if (borrowError) throw borrowError;

    // Update available copies
    const { error: updateError } = await this.client
      .from('library_books')
      .update({ 
        available_copies: this.client.raw('available_copies - 1') 
      })
      .eq('id', bookId);
    
    if (updateError) throw updateError;
  }

  // ============================================================================
  // NOTIFICATION MANAGEMENT
  // ============================================================================

  async getNotifications(schoolId: number, recipientId?: number): Promise<Notification[]> {
    let query = this.client
      .from('notifications')
      .select('*')
      .eq('school_id', schoolId);
    
    if (recipientId) {
      query = query.or(`recipient_type.eq.all,recipient_ids.cs.{${recipientId}}`);
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const { data, error } = await this.client
      .from('notifications')
      .insert(notification)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async markNotificationAsRead(id: number, userId: number) {
    const { error } = await this.client
      .from('notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) throw error;
  }

  // ============================================================================
  // DASHBOARD STATISTICS
  // ============================================================================

  async getDashboardStats(schoolId: number) {
    const [
      studentsResult,
      teachersResult,
      booksResult,
      overdueResult,
      recentEventsResult
    ] = await Promise.all([
      this.client.from('students').select('id', { count: 'exact' }).eq('school_id', schoolId),
      this.client.from('teachers').select('id', { count: 'exact' }).eq('school_id', schoolId),
      this.client.from('library_books').select('id', { count: 'exact' }).eq('school_id', schoolId),
      this.client
        .from('library_borrowed_books')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('status', 'overdue'),
      this.client
        .from('events')
        .select('*')
        .eq('school_id', schoolId)
        .gte('start_date', new Date().toISOString())
        .order('start_date')
        .limit(5)
    ]);

    return {
      totalStudents: studentsResult.count || 0,
      totalTeachers: teachersResult.count || 0,
      totalBooks: booksResult.count || 0,
      overdueBooks: overdueResult.count || 0,
      recentEvents: recentEventsResult.data || []
    };
  }

  // ============================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ============================================================================

  subscribeToNotifications(schoolId: number, callback: (payload: any) => void) {
    return this.client
      .channel(`notifications-${schoolId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `school_id=eq.${schoolId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToAttendance(schoolId: number, callback: (payload: any) => void) {
    return this.client
      .channel(`attendance-${schoolId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: `school_id=eq.${schoolId}`
        },
        callback
      )
      .subscribe();
  }

  // ============================================================================
  // FILE STORAGE
  // ============================================================================

  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  }

  getFileUrl(bucket: string, path: string) {
    const { data } = this.client.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string) {
    const { error } = await this.client.storage
      .from(bucket)
      .remove([path]);
    
    if (error) throw error;
  }
}

// Export singleton instance
export const supabaseService = new SupabaseService(supabase);

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any): never {
  console.error('Supabase Error:', error);
  
  if (error.code === 'PGRST116') {
    throw new Error('Record not found');
  }
  
  if (error.code === '23505') {
    throw new Error('Record already exists');
  }
  
  if (error.message) {
    throw new Error(error.message);
  }
  
  throw new Error('An unexpected error occurred');
}

// Export types for external use
export type { 
  User, InsertUser,
  Student, InsertStudent,
  Teacher, InsertTeacher,
  LibraryBook, InsertLibraryBook,
  DocumentTemplate, InsertDocumentTemplate,
  Notification, InsertNotification,
  Event, InsertEvent,
  FeePayment, InsertFeePayment,
  Attendance, InsertAttendance,
  School
};