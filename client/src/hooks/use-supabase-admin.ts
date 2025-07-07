import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Complete Supabase admin hook for all functionality
export function useSupabaseAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // GET admin stats from Supabase (public endpoint)
  const {
    data: adminStatsResponse,
    isLoading: adminStatsLoading,
    error: adminStatsError
  } = useQuery({
    queryKey: ['/api/admin/stats/public'],
    queryFn: () => apiRequest('/api/admin/stats/public'),
  });

  const adminStats = adminStatsResponse?.stats;

  // GET all users from Supabase
  const {
    data: usersResponse,
    isLoading: usersLoading
  } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('/api/admin/users'),
  });

  const users = usersResponse?.users || [];

  // GET all schools from Supabase
  const {
    data: schoolsResponse,
    isLoading: schoolsLoading
  } = useQuery({
    queryKey: ['/api/admin/schools'],
    queryFn: () => apiRequest('/api/admin/schools'),
  });

  const schools = schoolsResponse?.schools || [];

  // CREATE user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return apiRequest('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "সফল",
        description: "নতুন ব্যবহারকারী সুপাবেসে তৈরি হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ব্যবহারকারী তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // UPDATE user status mutation
  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      return apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "সফল",
        description: "ব্যবহারকারীর স্ট্যাটাস আপডেট হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // DELETE user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return apiRequest(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "সফল",
        description: "ব্যবহারকারী সুপাবেস থেকে মুছে ফেলা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ব্যবহারকারী মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // CREATE school mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (schoolData: any) => {
      return apiRequest('/api/admin/schools', {
        method: 'POST',
        body: JSON.stringify(schoolData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schools'] });
      toast({
        title: "সফল",
        description: "নতুন স্কুল সুপাবেসে নিবন্ধিত হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "স্কুল নিবন্ধন করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // UPDATE school mutation
  const updateSchoolMutation = useMutation({
    mutationFn: async ({ schoolId, data }: { schoolId: string; data: any }) => {
      return apiRequest(`/api/admin/schools/${schoolId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/schools'] });
      toast({
        title: "সফল",
        description: "স্কুলের তথ্য আপডেট হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "স্কুল আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // GET system health (public endpoint)
  const {
    data: systemHealthResponse,
    isLoading: systemHealthLoading
  } = useQuery({
    queryKey: ['/api/admin/system/health/public'],
    queryFn: () => apiRequest('/api/admin/system/health/public'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const systemHealth = systemHealthResponse?.health;

  // GET real-time analytics
  const {
    data: analyticsResponse,
    isLoading: analyticsLoading
  } = useQuery({
    queryKey: ['/api/admin/analytics/realtime'],
    queryFn: () => apiRequest('/api/admin/analytics/realtime'),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const realtimeAnalytics = analyticsResponse?.analytics;

  // BULK import users mutation
  const bulkImportUsersMutation = useMutation({
    mutationFn: async (csvData: string) => {
      return apiRequest('/api/admin/bulk/users/import', {
        method: 'POST',
        body: JSON.stringify({ csvData }),
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "সফল",
        description: `${response.imported || 0} জন ব্যবহারকারী সুপাবেসে ইমপোর্ট হয়েছে`,
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "বাল্ক ইমপোর্ট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    adminStats,
    users,
    schools,
    systemHealth,
    realtimeAnalytics,
    // Loading states
    adminStatsLoading,
    usersLoading,
    schoolsLoading,
    systemHealthLoading,
    analyticsLoading,
    // Mutations
    createUserMutation,
    updateUserStatusMutation,
    deleteUserMutation,
    createSchoolMutation,
    updateSchoolMutation,
    bulkImportUsersMutation,
    // Helpers
    isCreatingUser: createUserMutation.isPending,
    isUpdatingUser: updateUserStatusMutation.isPending,
    isDeletingUser: deleteUserMutation.isPending,
    isCreatingSchool: createSchoolMutation.isPending,
    isUpdatingSchool: updateSchoolMutation.isPending,
    isBulkImporting: bulkImportUsersMutation.isPending,
  };
}