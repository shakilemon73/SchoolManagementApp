import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseDirectAPI } from '../lib/supabase-direct';
import { useToast } from './use-toast';

// Custom hooks for direct Supabase operations replacing Express API calls

export const useStudents = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['students', schoolId],
    queryFn: () => supabaseDirectAPI.students.getAll(schoolId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useStudent = (id: number) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => supabaseDirectAPI.students.getById(id),
    enabled: !!id,
  });
};

export const useCreateStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: supabaseDirectAPI.students.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: "Success",
        description: "Student created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create student",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateStudent = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      supabaseDirectAPI.students.update(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', data.id] });
      toast({
        title: "Success",
        description: "Student updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update student",
        variant: "destructive",
      });
    },
  });
};

export const useTeachers = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: () => supabaseDirectAPI.teachers.getAll(schoolId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTeacher = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: supabaseDirectAPI.teachers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      toast({
        title: "Success",
        description: "Teacher created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create teacher",
        variant: "destructive",
      });
    },
  });
};

export const useLibraryBooks = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['library-books', schoolId],
    queryFn: () => supabaseDirectAPI.library.getBooks(schoolId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateLibraryBook = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: supabaseDirectAPI.library.addBook,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['library-books'] });
      toast({
        title: "Success",
        description: "Book added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add book",
        variant: "destructive",
      });
    },
  });
};

export const useInventoryItems = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['inventory-items', schoolId],
    queryFn: () => supabaseDirectAPI.inventory.getItems(schoolId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCalendarEvents = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['calendar-events', schoolId],
    queryFn: () => supabaseDirectAPI.calendar.getEvents(schoolId),
    staleTime: 2 * 60 * 1000, // 2 minutes for more frequent updates
  });
};

export const useNotifications = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['notifications', schoolId],
    queryFn: () => supabaseDirectAPI.notifications.getAll(schoolId),
    staleTime: 1 * 60 * 1000, // 1 minute for real-time feel
  });
};

export const useDashboardStats = (schoolId: number = 1) => {
  return useQuery({
    queryKey: ['dashboard-stats', schoolId],
    queryFn: () => supabaseDirectAPI.dashboard.getStats(schoolId),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateNotification = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: supabaseDirectAPI.notifications.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    },
  });
};