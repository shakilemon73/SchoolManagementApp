import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Complete Supabase settings hook for all functionality
export function useSupabaseSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // GET school settings from Supabase
  const {
    data: settingsResponse,
    isLoading: settingsLoading,
    error: settingsError
  } = useQuery({
    queryKey: ['/api/supabase/school/settings'],
    queryFn: () => apiRequest('/api/supabase/school/settings'),
  });

  const schoolSettings = settingsResponse?.data;

  // UPDATE school settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/supabase/school/settings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/school/settings'] });
      toast({
        title: "সফল",
        description: `সুপাবেস ডেটাবেসে সংরক্ষিত হয়েছে - ${response.action}`,
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "সেটিংস আপডেট করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // FILE upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async ({ type, fileName, fileData }: { type: string; fileName: string; fileData: string }) => {
      return apiRequest(`/api/supabase/school/upload/${type}`, {
        method: 'POST',
        body: JSON.stringify({ fileName, fileData }),
      });
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/school/settings'] });
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

  // BACKUP creation mutation
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/supabase/school/backup');
    },
    onSuccess: (response) => {
      toast({
        title: "ব্যাকআপ তৈরি হয়েছে",
        description: "সুপাবেস থেকে সম্পূর্ণ ডেটা ব্যাকআপ প্রস্তুত",
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

  // RESTORE data mutation
  const restoreDataMutation = useMutation({
    mutationFn: async (backupData: any) => {
      return apiRequest('/api/supabase/school/restore', {
        method: 'POST',
        body: JSON.stringify({ backupData }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/school/settings'] });
      toast({
        title: "ডেটা পুনরুদ্ধার সফল",
        description: "ব্যাকআপ থেকে সুপাবেসে ডেটা পুনরুদ্ধার হয়েছে",
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

  // DELETE all data mutation (destructive)
  const deleteAllDataMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/supabase/school/data', {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/supabase/school/settings'] });
      toast({
        title: "ডেটা মুছে ফেলা হয়েছে",
        description: "সুপাবেস থেকে সকল স্কুল ডেটা স্থায়ীভাবে মুছে ফেলা হয়েছে",
        variant: "destructive",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "ডেটা মুছতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  // GET system statistics
  const {
    data: statsResponse,
    isLoading: statsLoading
  } = useQuery({
    queryKey: ['/api/supabase/school/stats'],
    queryFn: () => apiRequest('/api/supabase/school/stats'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const systemStats = statsResponse?.stats;

  return {
    // Data
    schoolSettings,
    systemStats,
    // Loading states
    settingsLoading,
    statsLoading,
    // Mutations
    updateSettingsMutation,
    uploadFileMutation,
    createBackupMutation,
    restoreDataMutation,
    deleteAllDataMutation,
    // Helpers
    isUpdating: updateSettingsMutation.isPending,
    isUploading: uploadFileMutation.isPending,
    isBackingUp: createBackupMutation.isPending,
    isRestoring: restoreDataMutation.isPending,
    isDeleting: deleteAllDataMutation.isPending,
  };
}