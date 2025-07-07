/**
 * Design Utility Functions
 * Automatically applies UX principles from world-class designers
 */

import { UX_PRINCIPLES, applyUXPrinciples } from './ux-principles';
import { cn } from './utils';

// Component class generators following UX principles
export const designClasses = {
  // Button classes following Norman (affordances) & Walter (hierarchy)
  button: {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2",
    ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2"
  },

  // Card classes following Rams (minimal) & Ive (purposeful)
  card: {
    base: "bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300",
    interactive: "cursor-pointer hover:scale-[1.02] hover:border-primary/20",
    content: "p-6 space-y-4",
    header: "border-b border-slate-200/60 pb-4 mb-4"
  },

  // Form classes following Wroblewski (mobile-first) & Cooper (goal-oriented)
  form: {
    container: "space-y-6 max-w-md mx-auto",
    fieldGroup: "space-y-2",
    label: "text-sm font-semibold text-slate-800 block",
    input: "w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[44px]",
    error: "text-sm text-red-600 flex items-center gap-2 mt-1",
    success: "text-sm text-green-600 flex items-center gap-2 mt-1"
  },

  // Navigation classes following Krug (clarity) & Norman (mapping)
  navigation: {
    container: "space-y-1",
    item: "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px]",
    active: "bg-primary/10 text-primary border border-primary/20 shadow-sm",
    inactive: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
    icon: "w-5 h-5 shrink-0",
    text: "font-medium truncate"
  },

  // List classes following Weinschenk (scanning) & Krug (scannability)
  list: {
    container: "space-y-2",
    item: "flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200",
    content: "flex-1 min-w-0",
    primary: "font-semibold text-slate-900 truncate",
    secondary: "text-sm text-slate-600 truncate mt-1",
    action: "shrink-0 ml-4"
  },

  // Status classes following Norman (feedback) & Walter (emotion)
  status: {
    success: "bg-green-100 text-green-800 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2",
    warning: "bg-amber-100 text-amber-800 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2",
    error: "bg-red-100 text-red-800 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2",
    info: "bg-blue-100 text-blue-800 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2"
  }
};

// Spacing system following 8px grid (Zhuo - systems thinking)
export const spacing = {
  xs: "space-y-2", // 8px
  sm: "space-y-4", // 16px
  md: "space-y-6", // 24px
  lg: "space-y-8", // 32px
  xl: "space-y-12", // 48px
  xxl: "space-y-16" // 64px
};

// Typography scale following readability principles (Krug, Weinschenk)
export const typography = {
  h1: "text-3xl md:text-4xl font-bold text-slate-900 leading-tight",
  h2: "text-2xl md:text-3xl font-bold text-slate-900 leading-snug",
  h3: "text-xl md:text-2xl font-semibold text-slate-900 leading-snug",
  h4: "text-lg font-semibold text-slate-900 leading-normal",
  body: "text-sm md:text-base text-slate-700 leading-relaxed",
  caption: "text-xs md:text-sm text-slate-600 leading-normal",
  button: "text-sm font-medium leading-none"
};

// Validation helpers following Cooper (forgiveness) & Norman (constraints)
export const validation = {
  required: (value: string) => value.trim() !== '' || 'This field is required',
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || 'Please enter a valid email address';
  },
  minLength: (min: number) => (value: string) => 
    value.length >= min || `Must be at least ${min} characters`,
  phone: (value: string) => {
    const phoneRegex = /^(\+88)?01[3-9]\d{8}$/;
    return phoneRegex.test(value) || 'Please enter a valid Bangladeshi phone number';
  }
};

// Accessibility helpers following Madzima (inclusion)
export const a11y = {
  focusRing: "focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none",
  skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-4 rounded-lg shadow-lg z-50",
  screenReader: "sr-only",
  landmark: (role: string) => ({ role, "aria-label": role }),
  button: (label: string) => ({ "aria-label": label, type: "button" as const }),
  link: (label: string) => ({ "aria-label": label }),
  form: (name: string) => ({ "aria-labelledby": name, noValidate: true })
};

// Micro-interaction helpers following Walter (delight) & Ive (details)
export const animations = {
  fadeIn: "animate-in fade-in duration-200",
  slideIn: "animate-in slide-in-from-bottom-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  bounce: "animate-bounce",
  pulse: "animate-pulse",
  spin: "animate-spin",
  transition: "transition-all duration-200 ease-in-out",
  hover: "hover:scale-105 transition-transform duration-200",
  tap: "active:scale-95 transition-transform duration-75"
};

// Error prevention following Cooper (forgiveness)
export const errorPrevention = {
  confirmDestructive: (action: string) => `Are you sure you want to ${action}? This action cannot be undone.`,
  preventDoubleSubmit: (isSubmitting: boolean) => isSubmitting ? "opacity-50 pointer-events-none" : "",
  validateOnBlur: true,
  showPasswordStrength: true,
  confirmPassword: true
};

// Progressive disclosure helpers following Norman (discoverability)
export const disclosure = {
  summary: "cursor-pointer select-none p-4 rounded-lg hover:bg-slate-50 transition-colors",
  content: "px-4 pb-4 space-y-4 text-slate-700",
  toggle: "flex items-center justify-between w-full",
  icon: "transition-transform duration-200"
};

// Design pattern helpers
export function createComponentClasses(type: keyof typeof designClasses, variant?: string, className?: string) {
  const baseClasses = designClasses[type];
  let classes = '';
  
  if (typeof baseClasses === 'object' && baseClasses !== null) {
    classes = baseClasses[variant as keyof typeof baseClasses] || baseClasses.base || '';
  } else {
    classes = baseClasses || '';
  }
  
  return cn(classes, className);
}

// Responsive helpers following Wroblewski (mobile-first)
export const responsive = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  grid: {
    '1': "grid grid-cols-1",
    '2': "grid grid-cols-1 md:grid-cols-2",
    '3': "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    '4': "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    auto: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
  },
  gap: {
    sm: "gap-4",
    md: "gap-6", 
    lg: "gap-8"
  },
  text: {
    responsive: "text-sm md:text-base",
    heading: "text-2xl md:text-3xl lg:text-4xl"
  }
};

// Form helpers following Wroblewski (form design)
export const formPatterns = {
  singleColumn: "max-w-md mx-auto space-y-6",
  fieldset: "space-y-4 p-6 border border-slate-200 rounded-lg",
  legend: "text-lg font-semibold text-slate-900 -ml-2 px-2 bg-white",
  helpText: "text-sm text-slate-600 mt-1",
  inlineError: "text-sm text-red-600 flex items-center gap-1 mt-1"
};