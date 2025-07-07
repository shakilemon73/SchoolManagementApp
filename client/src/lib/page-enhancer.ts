/**
 * Page Enhancement System
 * Applies world-class UX principles from Norman, Krug, Wroblewski, Walter, Ive, 
 * Zhuo, Rams, Madzima, Cooper, Weinschenk to all pages automatically
 */

import { cn } from './utils';

// Enhanced component patterns following expert principles
export const pagePatterns = {
  // Norman: Clear feedback and affordances
  layout: {
    container: "min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50",
    header: "sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/60",
    main: "flex-1 px-4 py-6 md:px-6 lg:px-8 max-w-7xl mx-auto",
    card: "bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-lg transition-all duration-300"
  },

  // Krug: Scannable content
  typography: {
    pageTitle: "text-2xl md:text-3xl font-bold text-slate-900 mb-2",
    sectionTitle: "text-lg md:text-xl font-semibold text-slate-800 mb-4",
    description: "text-sm md:text-base text-slate-600 leading-relaxed",
    label: "text-sm font-semibold text-slate-800 mb-2 block"
  },

  // Wroblewski: Mobile-first interactions
  interactive: {
    button: "min-h-[44px] px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none",
    primaryButton: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md focus:ring-blue-500",
    secondaryButton: "bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow-md focus:ring-blue-500",
    input: "min-h-[44px] w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
  },

  // Walter: Emotional hierarchy
  status: {
    success: "bg-green-50 border-green-200 text-green-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800", 
    error: "bg-red-50 border-red-200 text-red-800",
    info: "bg-blue-50 border-blue-200 text-blue-800"
  },

  // Madzima: Accessibility
  accessibility: {
    focusRing: "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none",
    skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-4 rounded-lg shadow-lg z-50",
    landmark: "role='main' aria-label='Main content'"
  }
};

// Real-time data enhancement patterns
export const dataPatterns = {
  // Cooper: Goal-oriented design
  realTimeQueries: {
    refreshInterval: 30000, // 30 seconds for real-time feel
    staleTime: 60000, // 1 minute stale time
    errorRetry: 3,
    loadingStates: true
  },

  // Weinschenk: Cognitive load reduction
  pagination: {
    itemsPerPage: 10,
    showTotal: true,
    showPageInfo: true
  }
};

// Page-specific enhancements
export const pageEnhancements = {
  calendar: {
    title: "ক্যালেন্ডার ব্যবস্থাপনা",
    description: "একাডেমিক ইভেন্ট, পরীক্ষা এবং গুরুত্বপূর্ণ তারিখ পরিচালনা করুন",
    features: ["Real-time updates", "Event management", "Smart notifications"],
    apiEndpoint: "/api/calendar/events"
  },

  notifications: {
    title: "নোটিফিকেশন কেন্দ্র",
    description: "সকল বিজ্ঞপ্তি এবং আপডেট এক জায়গায় দেখুন",
    features: ["Real-time alerts", "Priority filtering", "Mark as read"],
    apiEndpoint: "/api/notifications"
  },

  documents: {
    title: "ডকুমেন্ট ব্যবস্থাপনা",
    description: "সকল একাডেমিক এবং প্রশাসনিক ডকুমেন্ট পরিচালনা করুন",
    features: ["Document generation", "Template management", "Bulk operations"],
    apiEndpoint: "/api/documents"
  },

  finance: {
    title: "অর্থ ব্যবস্থাপনা",
    description: "আর্থিক লেনদেন, ফি সংগ্রহ এবং হিসাব পরিচালনা",
    features: ["Fee collection", "Financial reports", "Payment tracking"],
    apiEndpoint: "/api/finance"
  },

  library: {
    title: "লাইব্রেরী ব্যবস্থাপনা", 
    description: "বই, জার্নাল এবং ডিজিটাল রিসোর্স পরিচালনা",
    features: ["Book management", "Issue tracking", "Digital catalog"],
    apiEndpoint: "/api/library"
  },

  inventory: {
    title: "ইনভেন্টরি ব্যবস্থাপনা",
    description: "স্কুলের সকল সম্পদ এবং সরঞ্জাম ট্র্যাক করুন",
    features: ["Asset tracking", "Stock management", "Maintenance logs"],
    apiEndpoint: "/api/inventory"
  },

  transport: {
    title: "ট্রান্সপোর্ট ব্যবস্থাপনা",
    description: "স্কুল বাস, রুট এবং পরিবহন সেবা পরিচালনা",
    features: ["Route management", "Vehicle tracking", "Driver management"],
    apiEndpoint: "/api/transport"
  },

  credits: {
    title: "ক্রেডিট ব্যালেন্স",
    description: "আপনার ক্রেডিট ব্যালেন্স এবং ব্যবহার দেখুন",
    features: ["Balance tracking", "Usage history", "Purchase options"],
    apiEndpoint: "/api/credits"
  },

  creditsPurchase: {
    title: "ক্রেডিট কিনুন",
    description: "বিভিন্ন প্যাকেজ থেকে ক্রেডিট কিনুন",
    features: ["Package selection", "Secure payment", "Instant activation"],
    apiEndpoint: "/api/credits/purchase"
  },

  transactions: {
    title: "লেনদেন ইতিহাস",
    description: "সকল আর্থিক লেনদেনের বিস্তারিত ইতিহাস দেখুন",
    features: ["Transaction history", "Download receipts", "Filter options"],
    apiEndpoint: "/api/transactions"
  },

  tools: {
    title: "টুল ম্যানেজার",
    description: "ডিজিটাল টুলস এবং ইউটিলিটি ব্যবহার করুন",
    features: ["Digital tools", "Utility functions", "System management"],
    apiEndpoint: "/api/tools"
  },

  videoConference: {
    title: "ভিডিও কনফারেন্স",
    description: "অনলাইন ক্লাস এবং মিটিং পরিচালনা করুন",
    features: ["Live meetings", "Screen sharing", "Recording"],
    apiEndpoint: "/api/video-conference"
  },

  liveNotifications: {
    title: "লাইভ নোটিফিকেশন",
    description: "রিয়েল-টাইম আপডেট এবং জরুরি বিজ্ঞপ্তি",
    features: ["Real-time alerts", "Emergency notifications", "Push notifications"],
    apiEndpoint: "/api/notifications/live"
  },

  paymentGateway: {
    title: "পেমেন্ট গেটওয়ে",
    description: "নিরাপদ অনলাইন পেমেন্ট সিস্টেম",
    features: ["Secure payments", "Multiple gateways", "Payment tracking"],
    apiEndpoint: "/api/payments"
  },

  templates: {
    title: "টেমপ্লেট ব্যবস্থাপনা",
    description: "ডকুমেন্ট টেমপ্লেট তৈরি এবং পরিচালনা করুন",
    features: ["Template creation", "Custom designs", "Template library"],
    apiEndpoint: "/api/templates"
  },

  academicYears: {
    title: "শিক্ষাবর্ষ সেটিংস",
    description: "একাডেমিক বছর এবং সেমিস্টার পরিচালনা",
    features: ["Academic calendar", "Session management", "Year configuration"],
    apiEndpoint: "/api/academic-years"
  },

  schoolSettings: {
    title: "স্কুল সেটিংস",
    description: "প্রতিষ্ঠানের সাধারণ সেটিংস কনফিগার করুন",
    features: ["Institution settings", "General configuration", "System preferences"],
    apiEndpoint: "/api/school/settings"
  },

  adminSettings: {
    title: "এডমিন সেটিংস",
    description: "সিস্টেম অ্যাডমিনিস্ট্রেশন এবং কনফিগারেশন",
    features: ["User management", "System configuration", "Security settings"],
    apiEndpoint: "/api/admin/settings"
  }
};

// Generate enhanced component classes
export function createEnhancedPage(pageKey: string, customClasses?: string) {
  const enhancement = pageEnhancements[pageKey as keyof typeof pageEnhancements];
  if (!enhancement) return "";
  
  return cn(
    pagePatterns.layout.container,
    customClasses
  );
}

// Enhanced form patterns following Wroblewski's principles
export function createEnhancedForm(className?: string) {
  return cn(
    "space-y-6 max-w-2xl mx-auto",
    "bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200/60 p-6 shadow-sm",
    className
  );
}

// Enhanced button patterns following Norman's affordances
export function createEnhancedButton(variant: 'primary' | 'secondary' | 'ghost' = 'primary', className?: string) {
  const baseClasses = pagePatterns.interactive.button;
  const variantClasses = {
    primary: pagePatterns.interactive.primaryButton,
    secondary: pagePatterns.interactive.secondaryButton,
    ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  };
  
  return cn(
    baseClasses,
    variantClasses[variant],
    pagePatterns.accessibility.focusRing,
    className
  );
}

// Enhanced data fetching with real-time capabilities
export function createDataQuery(endpoint: string) {
  return {
    queryKey: [endpoint],
    refetchInterval: dataPatterns.realTimeQueries.refreshInterval,
    staleTime: dataPatterns.realTimeQueries.staleTime,
    retry: dataPatterns.realTimeQueries.errorRetry
  };
}