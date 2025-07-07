import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ProductionDataContextType {
  students: any[];
  teachers: any[];
  books: any[];
  inventoryItems: any[];
  events: any[];
  notifications: any[];
  dashboardStats: any;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

const ProductionDataContext = createContext<ProductionDataContextType | undefined>(undefined);

export function ProductionDataProvider({ children }: { children: React.ReactNode }) {
  const [schoolId] = useState(1); // Get from user context in real implementation

  // Real students data from database
  const studentsQuery = useQuery({
    queryKey: ['students', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/students?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch students');
      return response.json();
    }
  });

  // Real teachers data from database
  const teachersQuery = useQuery({
    queryKey: ['teachers', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/teachers?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch teachers');
      return response.json();
    }
  });

  // Real library books data from database
  const booksQuery = useQuery({
    queryKey: ['library-books', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/library/books?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch books');
      return response.json();
    }
  });

  // Real inventory items data from database
  const inventoryQuery = useQuery({
    queryKey: ['inventory-items', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/inventory/items?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch inventory');
      return response.json();
    }
  });

  // Real calendar events data from database
  const eventsQuery = useQuery({
    queryKey: ['calendar-events', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/calendar/events?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Real notifications data from database
  const notificationsQuery = useQuery({
    queryKey: ['notifications', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/notifications?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch notifications');
      return response.json();
    }
  });

  // Real dashboard statistics from database
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-stats', schoolId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/stats?schoolId=${schoolId}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard stats');
      return response.json();
    }
  });

  const isLoading = studentsQuery.isLoading || teachersQuery.isLoading || 
                   booksQuery.isLoading || inventoryQuery.isLoading ||
                   eventsQuery.isLoading || notificationsQuery.isLoading ||
                   dashboardQuery.isLoading;

  const error = studentsQuery.error?.message || 
                teachersQuery.error?.message || 
                booksQuery.error?.message || 
                inventoryQuery.error?.message ||
                eventsQuery.error?.message || 
                notificationsQuery.error?.message ||
                dashboardQuery.error?.message || 
                null;

  const refetch = () => {
    studentsQuery.refetch();
    teachersQuery.refetch();
    booksQuery.refetch();
    inventoryQuery.refetch();
    eventsQuery.refetch();
    notificationsQuery.refetch();
    dashboardQuery.refetch();
  };

  const value = {
    students: studentsQuery.data || [],
    teachers: teachersQuery.data || [],
    books: booksQuery.data || [],
    inventoryItems: inventoryQuery.data || [],
    events: eventsQuery.data || [],
    notifications: notificationsQuery.data || [],
    dashboardStats: dashboardQuery.data || {},
    isLoading,
    error,
    refetch
  };

  return (
    <ProductionDataContext.Provider value={value}>
      {children}
    </ProductionDataContext.Provider>
  );
}

export function useProductionData() {
  const context = useContext(ProductionDataContext);
  if (context === undefined) {
    throw new Error('useProductionData must be used within a ProductionDataProvider');
  }
  return context;
}

// Real data hooks for specific entities
export function useRealStudents() {
  const { students, isLoading, error } = useProductionData();
  return { students, isLoading, error };
}

export function useRealTeachers() {
  const { teachers, isLoading, error } = useProductionData();
  return { teachers, isLoading, error };
}

export function useRealBooks() {
  const { books, isLoading, error } = useProductionData();
  return { books, isLoading, error };
}

export function useRealInventory() {
  const { inventoryItems, isLoading, error } = useProductionData();
  return { inventoryItems, isLoading, error };
}

export function useRealEvents() {
  const { events, isLoading, error } = useProductionData();
  return { events, isLoading, error };
}

export function useRealNotifications() {
  const { notifications, isLoading, error } = useProductionData();
  return { notifications, isLoading, error };
}

export function useRealDashboardStats() {
  const { dashboardStats, isLoading, error } = useProductionData();
  return { dashboardStats, isLoading, error };
}