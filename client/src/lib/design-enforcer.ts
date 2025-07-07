/**
 * Design Enforcement System
 * Automatically applies UX principles from world-class designers to all components
 * Norman, Krug, Wroblewski, Walter, Ive, Zhuo, Rams, Madzima, Cooper, Weinschenk
 */

import { cn } from './utils';

// Enhanced button system following Norman (affordances) & Walter (hierarchy)
export const buttonClasses = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none active:scale-95",
  secondary: "bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none active:scale-95",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-medium px-6 py-3 rounded-lg transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-500/20 focus:outline-none active:scale-95",
  destructive: "bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-red-500/20 focus:outline-none active:scale-95"
};

// Enhanced card system following Rams (minimal) & Ive (purposeful)
export const cardClasses = {
  base: "bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden",
  interactive: "cursor-pointer hover:scale-[1.02] hover:border-blue-200/60 hover:shadow-lg",
  content: "p-6 space-y-4",
  header: "border-b border-slate-200/60 pb-4 mb-4 last:mb-0",
  footer: "border-t border-slate-200/60 pt-4 mt-4 first:mt-0"
};

// Enhanced form system following Wroblewski (mobile-first) & Cooper (goal-oriented)
export const formClasses = {
  container: "space-y-6 max-w-lg mx-auto",
  fieldGroup: "space-y-2",
  label: "text-sm font-semibold text-slate-800 block leading-relaxed",
  input: "w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 min-h-[44px] focus:outline-none bg-white",
  error: "text-sm text-red-600 flex items-center gap-2 mt-1 leading-relaxed",
  success: "text-sm text-green-600 flex items-center gap-2 mt-1 leading-relaxed",
  helpText: "text-sm text-slate-600 leading-relaxed"
};

// Enhanced navigation following Krug (clarity) & Norman (mapping)
export const navClasses = {
  container: "space-y-1",
  item: "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 min-h-[44px] group",
  active: "bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm font-semibold",
  inactive: "text-slate-700 hover:bg-slate-100/70 hover:text-slate-900 font-medium",
  icon: "w-5 h-5 shrink-0 transition-colors duration-200",
  text: "font-medium truncate group-hover:text-slate-900"
};

// Enhanced typography following Weinschenk (hierarchy) & Krug (scannability)
export const textClasses = {
  h1: "text-3xl md:text-4xl font-bold text-slate-900 leading-tight tracking-tight",
  h2: "text-2xl md:text-3xl font-bold text-slate-900 leading-snug tracking-tight",
  h3: "text-xl md:text-2xl font-semibold text-slate-900 leading-snug",
  h4: "text-lg md:text-xl font-semibold text-slate-900 leading-normal",
  body: "text-sm md:text-base text-slate-700 leading-relaxed",
  caption: "text-xs md:text-sm text-slate-600 leading-relaxed",
  button: "text-sm md:text-base font-medium leading-none"
};

// Enhanced status system following Norman (feedback) & Walter (emotion)
export const statusClasses = {
  success: "bg-green-50 text-green-800 border border-green-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm",
  warning: "bg-amber-50 text-amber-800 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm",
  error: "bg-red-50 text-red-800 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm",
  info: "bg-blue-50 text-blue-800 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3 shadow-sm"
};

// Enhanced list system following Weinschenk (scanning)
export const listClasses = {
  container: "space-y-2",
  item: "flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-slate-300/60 hover:shadow-sm transition-all duration-200 bg-white/50",
  content: "flex-1 min-w-0 space-y-1",
  primary: "font-semibold text-slate-900 truncate leading-snug",
  secondary: "text-sm text-slate-600 truncate leading-relaxed",
  action: "shrink-0 ml-4 flex items-center gap-2"
};

// Spacing system following 8px grid (Zhuo - systems thinking)
export const spacingClasses = {
  xs: "space-y-2", // 8px
  sm: "space-y-4", // 16px  
  md: "space-y-6", // 24px
  lg: "space-y-8", // 32px
  xl: "space-y-12", // 48px
  xxl: "space-y-16" // 64px
};

// Responsive grid system following Wroblewski (mobile-first)
export const gridClasses = {
  container: "container mx-auto px-4 sm:px-6 lg:px-8",
  responsive1: "grid grid-cols-1 gap-6",
  responsive2: "grid grid-cols-1 md:grid-cols-2 gap-6",
  responsive3: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", 
  responsive4: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  auto: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
};

// Animation system following Walter (delight) & Ive (details)
export const animationClasses = {
  fadeIn: "animate-in fade-in duration-300",
  slideIn: "animate-in slide-in-from-bottom-4 duration-400",
  scaleIn: "animate-in zoom-in-95 duration-200",
  transition: "transition-all duration-200 ease-out",
  hover: "hover:scale-105 transition-transform duration-200",
  tap: "active:scale-95 transition-transform duration-100",
  loading: "animate-pulse"
};

// Accessibility helpers following Madzima (inclusion)
export const a11yClasses = {
  focusRing: "focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none",
  skipLink: "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-4 rounded-lg shadow-lg z-50 border border-blue-200",
  screenReader: "sr-only",
  highContrast: "text-slate-900 bg-white border-slate-300"
};

// Design pattern enforcement functions
export function enforceButtonDesign(variant: 'primary' | 'secondary' | 'ghost' | 'destructive' = 'primary', customClass?: string) {
  return cn(buttonClasses[variant], customClass);
}

export function enforceCardDesign(interactive: boolean = false, customClass?: string) {
  return cn(
    cardClasses.base,
    interactive && cardClasses.interactive,
    customClass
  );
}

export function enforceFormDesign(element: 'container' | 'field' | 'label' | 'input' | 'error' | 'success', customClass?: string) {
  return cn(formClasses[element], customClass);
}

export function enforceNavDesign(state: 'active' | 'inactive' = 'inactive', customClass?: string) {
  return cn(navClasses.item, navClasses[state], customClass);
}

export function enforceTextDesign(level: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button', customClass?: string) {
  return cn(textClasses[level], customClass);
}

export function enforceStatusDesign(type: 'success' | 'warning' | 'error' | 'info', customClass?: string) {
  return cn(statusClasses[type], customClass);
}

export function enforceListDesign(element: 'container' | 'item' | 'content' | 'primary' | 'secondary' | 'action', customClass?: string) {
  return cn(listClasses[element], customClass);
}

export function enforceSpacing(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' = 'md', customClass?: string) {
  return cn(spacingClasses[size], customClass);
}

export function enforceGrid(cols: 1 | 2 | 3 | 4 | 'auto' = 'auto', customClass?: string) {
  const gridClass = cols === 'auto' ? gridClasses.auto : gridClasses[`responsive${cols}` as keyof typeof gridClasses];
  return cn(gridClass, customClass);
}

export function enforceAnimation(type: 'fadeIn' | 'slideIn' | 'scaleIn' | 'transition' | 'hover' | 'tap' | 'loading', customClass?: string) {
  return cn(animationClasses[type], customClass);
}

export function enforceAccessibility(type: 'focusRing' | 'skipLink' | 'screenReader' | 'highContrast', customClass?: string) {
  return cn(a11yClasses[type], customClass);
}

// Component validators following UX principles
export const uxValidators = {
  // Norman: Ensure clear affordances
  validateAffordance: (element: HTMLElement): boolean => {
    if (element.tagName === 'BUTTON') {
      return element.style.cursor === 'pointer' || getComputedStyle(element).cursor === 'pointer';
    }
    return true;
  },

  // Krug: Ensure scannability  
  validateScannability: (text: string): boolean => {
    const wordCount = text.split(' ').length;
    return wordCount <= 15; // Keep text scannable
  },

  // Wroblewski: Ensure mobile-friendly touch targets
  validateTouchTarget: (element: HTMLElement): boolean => {
    const rect = element.getBoundingClientRect();
    return rect.height >= 44 && rect.width >= 44; // Minimum 44px for touch
  },

  // Madzima: Ensure accessibility compliance
  validateAccessibility: (element: HTMLElement): boolean => {
    return element.getAttribute('aria-label') !== null || 
           element.textContent !== null ||
           element.getAttribute('alt') !== null;
  },

  // Cooper: Ensure goal-oriented design
  validateGoalOriented: (formElement: HTMLFormElement): boolean => {
    const fields = formElement.querySelectorAll('input, select, textarea');
    return fields.length <= 7; // Don't overwhelm users
  }
};

// Auto-enhancement functions that can be applied to existing components
export function enhanceExistingComponent(element: HTMLElement, componentType: string) {
  switch (componentType) {
    case 'button':
      element.className = enforceButtonDesign('primary', element.className);
      break;
    case 'card':
      element.className = enforceCardDesign(false, element.className);
      break;
    case 'input':
      element.className = enforceFormDesign('input', element.className);
      break;
    case 'nav-item':
      element.className = enforceNavDesign('inactive', element.className);
      break;
    default:
      // Apply general enhancements
      element.className = cn(element.className, enforceAnimation('transition'));
  }
}

// UX principle enforcement checker
export function checkUXCompliance(element: HTMLElement): string[] {
  const issues: string[] = [];
  
  if (!uxValidators.validateAffordance(element)) {
    issues.push("Norman: Button lacks clear affordance (cursor pointer)");
  }
  
  if (!uxValidators.validateTouchTarget(element)) {
    issues.push("Wroblewski: Touch target too small (minimum 44px)");
  }
  
  if (!uxValidators.validateAccessibility(element)) {
    issues.push("Madzima: Missing accessibility attributes");
  }
  
  return issues;
}