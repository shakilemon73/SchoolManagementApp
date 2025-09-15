import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseService } from '../../../shared/supabase-service';
import type {
  User, InsertUser,
  Student, InsertStudent,
  Teacher, InsertTeacher,
  LibraryBook, InsertLibraryBook,
  Notification, InsertNotification,
  Event, InsertEvent
} from '../../../shared/consolidated-schema';

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

export function useAuth() {
  const queryClient = useQueryClient();

  const signInMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      supabaseService.signIn(email, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    },
  });

  const signOutMutation = useMutation({
    mutationFn: () => supabaseService.signOut(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: () => supabaseService.getCurrentUser(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: signInMutation.mutateAsync,
    signOut: signOutMutation.mutateAsync,
    isSigningIn: signInMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
}

// ============================================================================
// USER MANAGEMENT HOOKS
// ============================================================================

export function useUsers(schoolId?: number) {
  return useQuery({
    queryKey: ['users', schoolId],
    queryFn: () => supabaseService.getUsers(schoolId),
    enabled: !!schoolId,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => supabaseService.getUserById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: InsertUser) => supabaseService.createUser(user),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', data.id], data);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<InsertUser> }) =>
      supabaseService.updateUser(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.setQueryData(['users', data.id], data);
    },
  });
}

// ============================================================================
// STUDENT MANAGEMENT HOOKS
// ============================================================================

export function useStudents(
  schoolId: number,
  filters?: { class?: string; section?: string; status?: string }
) {
  return useQuery({
    queryKey: ['students', schoolId, filters],
    queryFn: () => supabaseService.getStudents(schoolId, filters),
    enabled: !!schoolId,
  });
}

export function useStudent(id: number) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => supabaseService.getStudentById(id),
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (student: InsertStudent) => supabaseService.createStudent(student),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.setQueryData(['students', data.id], data);
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: Partial<InsertStudent> }) =>
      supabaseService.updateStudent(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.setQueryData(['students', data.id], data);
    },
  });
}

// ============================================================================
// TEACHER MANAGEMENT HOOKS
// ============================================================================

export function useTeachers(schoolId: number) {
  return useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: () => supabaseService.getTeachers(schoolId),
    enabled: !!schoolId,
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teacher: InsertTeacher) => supabaseService.createTeacher(teacher),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.setQueryData(['teachers', data.id], data);
    },
  });
}

// ============================================================================
// LIBRARY MANAGEMENT HOOKS
// ============================================================================

export function useLibraryBooks(
  schoolId: number,
  filters?: { category?: string; available?: boolean; search?: string }
) {
  return useQuery({
    queryKey: ['library-books', schoolId, filters],
    queryFn: () => supabaseService.getLibraryBooks(schoolId, filters),
    enabled: !!schoolId,
  });
}

export function useCreateLibraryBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (book: InsertLibraryBook) => supabaseService.createLibraryBook(book),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
    },
  });
}

export function useBorrowBook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      bookId,
      studentId,
      dueDate,
      schoolId,
    }: {
      bookId: number;
      studentId: number;
      dueDate: string;
      schoolId: number;
    }) => supabaseService.borrowBook(bookId, studentId, dueDate, schoolId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      queryClient.invalidateQueries({ queryKey: ['library-borrowed-books'] });
    },
  });
}

// ============================================================================
// NOTIFICATION HOOKS
// ============================================================================

export function useNotifications(schoolId: number, recipientId?: number) {
  return useQuery({
    queryKey: ['notifications', schoolId, recipientId],
    queryFn: () => supabaseService.getNotifications(schoolId, recipientId),
    enabled: !!schoolId,
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notification: InsertNotification) =>
      supabaseService.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: number }) =>
      supabaseService.markNotificationAsRead(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// ============================================================================
// DASHBOARD HOOKS
// ============================================================================

export function useDashboardStats(schoolId: number) {
  return useQuery({
    queryKey: ['dashboard-stats', schoolId],
    queryFn: () => supabaseService.getDashboardStats(schoolId),
    enabled: !!schoolId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

// ============================================================================
// REAL-TIME HOOKS
// ============================================================================

export function useRealtimeNotifications(
  schoolId: number,
  onNotification: (notification: any) => void
) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!schoolId) return;

    const subscription = supabaseService.subscribeToNotifications(
      schoolId,
      (payload) => {
        onNotification(payload);
        queryClient.invalidateQueries({ queryKey: ['notifications', schoolId] });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [schoolId, onNotification, queryClient]);
}

export function useRealtimeAttendance(
  schoolId: number,
  onAttendanceUpdate: (attendance: any) => void
) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (!schoolId) return;

    const subscription = supabaseService.subscribeToAttendance(
      schoolId,
      (payload) => {
        onAttendanceUpdate(payload);
        queryClient.invalidateQueries({ queryKey: ['attendance', schoolId] });
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [schoolId, onAttendanceUpdate, queryClient]);
}

// ============================================================================
// INVENTORY MANAGEMENT HOOKS
// ============================================================================

export function useInventoryItems(schoolId: number) {
  return useQuery({
    queryKey: ['inventory-items', schoolId],
    queryFn: async () => {
      // Direct Supabase call for inventory items
      const { data, error } = await supabaseService.client
        .from('inventory_items')
        .select('*')
        .eq('school_id', schoolId)
        .order('name');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!schoolId,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: any) => {
      const { data, error } = await supabaseService.client
        .from('inventory_items')
        .insert(item)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    },
  });
}

// ============================================================================
// CALENDAR EVENTS HOOKS
// ============================================================================

export function useCalendarEvents(schoolId: number, month?: number, year?: number) {
  return useQuery({
    queryKey: ['calendar-events', schoolId, month, year],
    queryFn: () => supabaseService.getCalendarEvents(schoolId, month, year),
    enabled: !!schoolId,
  });
}

export function useCreateCalendarEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (event: InsertEvent) => supabaseService.createCalendarEvent(event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    },
  });
}

// ============================================================================
// FILE UPLOAD HOOKS
// ============================================================================

export function useFileUpload() {
  return useMutation({
    mutationFn: ({
      bucket,
      path,
      file,
    }: {
      bucket: string;
      path: string;
      file: File;
    }) => supabaseService.uploadFile(bucket, path, file),
  });
}

// ============================================================================
// OPTIMISTIC UPDATE HELPERS
// ============================================================================

export function useOptimisticUpdate<T>(queryKey: any[], updateFn: (old: T[], newItem: T) => T[]) {
  const queryClient = useQueryClient();

  return (newItem: T) => {
    queryClient.setQueryData(queryKey, (old: T[] = []) => updateFn(old, newItem));
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

export function useSupabaseError() {
  return (error: any) => {
    console.error('Supabase operation failed:', error);
    
    // You can add toast notifications here
    // toast.error(error.message || 'An error occurred');
    
    return error;
  };
}