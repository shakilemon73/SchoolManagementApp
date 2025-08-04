import { supabase } from './supabase';

// Supabase Edge Functions for complex business logic
// These replace Express server routes for document generation, payments, and complex operations

export const supabaseEdgeFunctions = {
  // Document generation (replaces Express document routes)
  documents: {
    generateDocument: async (templateId: number, data: any) => {
      const { data: result, error } = await supabase.functions.invoke('generate-document', {
        body: { templateId, data }
      });
      
      if (error) throw error;
      return result;
    },
    
    getTemplates: async () => {
      const { data, error } = await supabase.functions.invoke('get-document-templates');
      if (error) throw error;
      return data;
    },
    
    getUserStats: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('get-user-document-stats', {
        body: { userId }
      });
      if (error) throw error;
      return data;
    }
  },

  // Payment processing (replaces Express payment routes)
  payments: {
    processPayment: async (paymentData: any) => {
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: paymentData
      });
      if (error) throw error;
      return data;
    },
    
    getPaymentHistory: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('get-payment-history', {
        body: { userId }
      });
      if (error) throw error;
      return data;
    }
  },

  // Credit system (replaces Express credit routes)
  credits: {
    getUserCredits: async (userId: string) => {
      const { data, error } = await supabase.functions.invoke('get-user-credits', {
        body: { userId }
      });
      if (error) throw error;
      return data;
    },
    
    deductCredits: async (userId: string, amount: number, reason: string) => {
      const { data, error } = await supabase.functions.invoke('deduct-credits', {
        body: { userId, amount, reason }
      });
      if (error) throw error;
      return data;
    }
  },

  // Notification system (replaces Express notification routes)
  notifications: {
    sendNotification: async (notification: any) => {
      const { data, error } = await supabase.functions.invoke('send-notification', {
        body: notification
      });
      if (error) throw error;
      return data;
    }
  },

  // Email service (replaces Express email routes)
  email: {
    sendEmail: async (emailData: any) => {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });
      if (error) throw error;
      return data;
    }
  },

  // Advanced analytics (replaces Express analytics routes)
  analytics: {
    getAdvancedStats: async (schoolId: number) => {
      const { data, error } = await supabase.functions.invoke('get-advanced-stats', {
        body: { schoolId }
      });
      if (error) throw error;
      return data;
    }
  }
};

// Helper function to check if Edge Functions are available
export const checkEdgeFunctionsAvailable = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('health-check');
    return !error;
  } catch {
    return false;
  }
};

// Fallback to Express API if Edge Functions are not available
export const callWithFallback = async (edgeFunction: () => Promise<any>, fallbackApiCall: () => Promise<any>) => {
  try {
    return await edgeFunction();
  } catch (error) {
    console.warn('Edge function failed, falling back to Express API:', error);
    return await fallbackApiCall();
  }
};