import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Pure Supabase school admin hook
export function useSchoolAdmin() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // GET school admin dashboard
  const {
    data: dashboardResponse,
    isLoading: dashboardLoading,
    error: dashboardError
  } = useQuery({
    queryKey: ['/api/school-admin/dashboard'],
    queryFn: () => apiRequest('/api/school-admin/dashboard'),
  });

  const dashboard = dashboardResponse?.dashboard;

  // GET basic school settings
  const {
    data: basicSettingsResponse,
    isLoading: basicSettingsLoading
  } = useQuery({
    queryKey: ['/api/school-admin/settings/basic'],
    queryFn: () => apiRequest('/api/school-admin/settings/basic'),
  });

  const schoolSettings = basicSettingsResponse?.settings;

  // GET school statistics
  const {
    data: statisticsResponse,
    isLoading: statisticsLoading
  } = useQuery({
    queryKey: ['/api/school-admin/statistics'],
    queryFn: () => apiRequest('/api/school-admin/statistics'),
    refetchInterval: 60000, // Refresh every minute
  });

  const statistics = statisticsResponse?.statistics;

  // GET admin permissions
  const {
    data: permissionsResponse,
    isLoading: permissionsLoading
  } = useQuery({
    queryKey: ['/api/school-admin/permissions'],
    queryFn: () => apiRequest('/api/school-admin/permissions'),
  });

  const permissions = permissionsResponse?.permissions;

  // UPDATE basic school settings
  const updateBasicSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/school-admin/settings/basic', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/settings/basic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/dashboard'] });
      toast({
        title: "সফল",
        description: "স্কুলের মৌলিক তথ্য সুপাবেসে আপডেট হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "মৌলিক তথ্য আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // UPDATE branding settings
  const updateBrandingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/school-admin/settings/branding', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/settings/basic'] });
      toast({
        title: "ব্র্যান্ডিং আপডেট",
        description: "স্কুলের ব্র্যান্ডিং সুপাবেসে সংরক্ষিত হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ব্র্যান্ডিং আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // UPDATE system preferences
  const updateSystemSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/school-admin/settings/system', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/settings/basic'] });
      toast({
        title: "সিস্টেম সেটিংস",
        description: "সিস্টেম পছন্দগুলি সুপাবেসে আপডেট হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "সিস্টেম সেটিংস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // UPLOAD files
  const uploadFileMutation = useMutation({
    mutationFn: async ({ type, fileName, fileData }: { type: string; fileName: string; fileData: string }) => {
      return apiRequest(`/api/school-admin/upload/${type}`, {
        method: 'POST',
        body: JSON.stringify({ fileName, fileData }),
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/settings/basic'] });
      toast({
        title: "ফাইল আপলোড সফল",
        description: `${response.type} সুপাবেস স্টোরেজে সংরক্ষিত হয়েছে`,
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ফাইল আপলোড করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // CREATE backup
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/school-admin/backup');
    },
    onSuccess: (response) => {
      toast({
        title: "ব্যাকআপ তৈরি",
        description: "স্কুলের সম্পূর্ণ ডেটা ব্যাকআপ প্রস্তুত",
      });
      // Trigger download
      const dataStr = JSON.stringify(response.backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `school-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ব্যাকআপ তৈরি করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // RESTORE data
  const restoreDataMutation = useMutation({
    mutationFn: async (backupData: any) => {
      return apiRequest('/api/school-admin/restore', {
        method: 'POST',
        body: JSON.stringify({ backupData }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/settings/basic'] });
      queryClient.invalidateQueries({ queryKey: ['/api/school-admin/dashboard'] });
      toast({
        title: "ডেটা পুনরুদ্ধার",
        description: "ব্যাকআপ থেকে স্কুলের ডেটা পুনরুদ্ধার হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ডেটা পুনরুদ্ধার করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  return {
    // Data
    dashboard,
    schoolSettings,
    statistics,
    permissions,
    // Loading states
    dashboardLoading,
    basicSettingsLoading,
    statisticsLoading,
    permissionsLoading,
    // Mutations
    updateBasicSettingsMutation,
    updateBrandingMutation,
    updateSystemSettingsMutation,
    uploadFileMutation,
    createBackupMutation,
    restoreDataMutation,
    // Helpers
    isUpdatingBasic: updateBasicSettingsMutation.isPending,
    isUpdatingBranding: updateBrandingMutation.isPending,
    isUpdatingSystem: updateSystemSettingsMutation.isPending,
    isUploading: uploadFileMutation.isPending,
    isBackingUp: createBackupMutation.isPending,
    isRestoring: restoreDataMutation.isPending,
  };
}