import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabaseEdgeFunctions, callWithFallback } from '../lib/supabase-edge-functions';
import { useToast } from './use-toast';

// Custom hooks for document management using Supabase Edge Functions
// These replace Express API calls for document generation and templates

export const useDocumentTemplates = () => {
  return useQuery({
    queryKey: ['document-templates'],
    queryFn: async () => {
      return callWithFallback(
        () => supabaseEdgeFunctions.documents.getTemplates(),
        async () => {
          const response = await fetch('/api/documents/templates');
          if (!response.ok) throw new Error('Failed to fetch templates');
          return response.json();
        }
      );
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserDocumentStats = (userId: string) => {
  return useQuery({
    queryKey: ['user-document-stats', userId],
    queryFn: async () => {
      return callWithFallback(
        () => supabaseEdgeFunctions.documents.getUserStats(userId),
        async () => {
          const response = await fetch('/api/documents/user-stats');
          if (!response.ok) throw new Error('Failed to fetch user stats');
          return response.json();
        }
      );
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserCredits = (userId: string) => {
  return useQuery({
    queryKey: ['user-credits', userId],
    queryFn: async () => {
      return callWithFallback(
        () => supabaseEdgeFunctions.credits.getUserCredits(userId),
        async () => {
          const response = await fetch(`/api/simple-credit-stats/${userId}`);
          if (!response.ok) throw new Error('Failed to fetch credits');
          return response.json();
        }
      );
    },
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useGenerateDocument = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ templateId, data }: { templateId: number; data: any }) => {
      return callWithFallback(
        () => supabaseEdgeFunctions.documents.generateDocument(templateId, data),
        async () => {
          const response = await fetch('/api/documents/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ templateId, data })
          });
          if (!response.ok) throw new Error('Failed to generate document');
          return response.json();
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-document-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      toast({
        title: "Success",
        description: "Document generated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate document",
        variant: "destructive",
      });
    },
  });
};

export const useProcessPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: any) => {
      return callWithFallback(
        () => supabaseEdgeFunctions.payments.processPayment(paymentData),
        async () => {
          const response = await fetch('/api/payments/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
          });
          if (!response.ok) throw new Error('Payment failed');
          return response.json();
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-credits'] });
      toast({
        title: "Payment Successful",
        description: "Credits have been added to your account",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Payment processing failed",
        variant: "destructive",
      });
    },
  });
};