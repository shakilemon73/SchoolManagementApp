/**
 * UX Design System Components
 * Automatically applies world-class design principles from:
 * Don Norman, Steve Krug, Luke Wroblewski, Aarron Walter, Jonathan Ive, 
 * Julie Zhuo, Dieter Rams, Farai Madzima, Alan Cooper, Susan Weinschenk
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Design principles applied automatically
const UX_CLASSES = {
  // Norman: Clear affordances, Walter: Emotional hierarchy
  button: {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none",
    ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-primary/20 focus:outline-none",
    destructive: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md transition-all duration-200 font-medium rounded-lg px-4 py-2.5 min-h-[44px] flex items-center justify-center gap-2 focus:ring-2 focus:ring-red/20 focus:outline-none"
  },

  // Rams: Minimal, Ive: Purposeful
  card: {
    base: "bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300",
    interactive: "cursor-pointer hover:scale-[1.02] hover:border-primary/20",
    content: "p-6 space-y-4"
  },

  // Wroblewski: Mobile-first forms, Cooper: Goal-oriented
  form: {
    container: "space-y-6 max-w-md mx-auto",
    field: "space-y-2",
    label: "text-sm font-semibold text-slate-800 block",
    input: "w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 min-h-[44px] focus:outline-none",
    error: "text-sm text-red-600 flex items-center gap-2 mt-1"
  },

  // Krug: Scannable navigation, Norman: Clear mapping
  nav: {
    item: "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px]",
    active: "bg-primary/10 text-primary border border-primary/20 shadow-sm",
    inactive: "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
  },

  // Weinschenk: Scanning patterns
  list: {
    container: "space-y-2",
    item: "flex items-center justify-between p-4 rounded-lg border border-slate-200/60 hover:border-slate-300/60 transition-all duration-200",
    content: "flex-1 min-w-0"
  },

  // Norman: Immediate feedback, Walter: Emotional design
  status: {
    success: "bg-green-100 text-green-800 border border-green-200 rounded-lg px-3 py-2 flex items-center gap-2",
    warning: "bg-amber-100 text-amber-800 border border-amber-200 rounded-lg px-3 py-2 flex items-center gap-2",
    error: "bg-red-100 text-red-800 border border-red-200 rounded-lg px-3 py-2 flex items-center gap-2",
    info: "bg-blue-100 text-blue-800 border border-blue-200 rounded-lg px-3 py-2 flex items-center gap-2"
  }
};

// Typography following readability principles
const UX_TYPOGRAPHY = {
  h1: "text-3xl md:text-4xl font-bold text-slate-900 leading-tight",
  h2: "text-2xl md:text-3xl font-bold text-slate-900 leading-snug", 
  h3: "text-xl md:text-2xl font-semibold text-slate-900 leading-snug",
  h4: "text-lg font-semibold text-slate-900 leading-normal",
  body: "text-sm md:text-base text-slate-700 leading-relaxed",
  caption: "text-xs md:text-sm text-slate-600 leading-normal"
};

// UX Context for principles enforcement
interface UXContextType {
  logPrinciple: (component: string, principle: string) => void;
}

const UXContext = createContext<UXContextType>({
  logPrinciple: () => {}
});

export function UXProvider({ children }: { children: ReactNode }) {
  const logPrinciple = (component: string, principle: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🎨 UX: ${component} follows ${principle}`);
    }
  };

  return (
    <UXContext.Provider value={{ logPrinciple }}>
      {children}
    </UXContext.Provider>
  );
}

function useUX() {
  return useContext(UXContext);
}

// Enhanced Button following Norman (affordances) & Walter (hierarchy)
export function UXButton({ 
  children, 
  variant = 'primary', 
  onClick, 
  disabled, 
  className,
  ...props 
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('Button', 'Norman: Clear affordances, Walter: Emotional hierarchy');
  }, []);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(UX_CLASSES.button[variant], className)}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

// Enhanced Card following Rams (minimal) & Ive (purposeful)
export function UXCard({ 
  children, 
  interactive = false, 
  className,
  onClick,
  ...props 
}: {
  children: ReactNode;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('Card', 'Rams: Minimal design, Ive: Purposeful elements');
  }, []);

  return (
    <div
      className={cn(
        UX_CLASSES.card.base,
        interactive && UX_CLASSES.card.interactive,
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

// Enhanced Form following Wroblewski (mobile-first) & Cooper (goal-oriented)
export function UXForm({ 
  children, 
  onSubmit, 
  className,
  ...props 
}: {
  children: ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('Form', 'Wroblewski: Mobile-first, Cooper: Goal-oriented');
  }, []);

  return (
    <form
      onSubmit={onSubmit}
      className={cn(UX_CLASSES.form.container, className)}
      noValidate
      {...props}
    >
      {children}
    </form>
  );
}

// Enhanced Input following Wroblewski (clear labels) & Norman (error prevention)
export function UXInput({ 
  label, 
  error, 
  help, 
  required, 
  className,
  ...props 
}: {
  label: string;
  error?: string;
  help?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('Input', 'Wroblewski: Clear labels, Norman: Error prevention');
  }, []);

  return (
    <div className={UX_CLASSES.form.field}>
      <label className={UX_CLASSES.form.label}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        className={cn(
          UX_CLASSES.form.input,
          error && 'border-red-300 focus:border-red-500',
          className
        )}
        required={required}
        {...props}
      />
      {help && (
        <p className="text-sm text-slate-600 mt-1">{help}</p>
      )}
      {error && (
        <div className={UX_CLASSES.form.error}>
          <span className="material-icons text-base">error</span>
          {error}
        </div>
      )}
    </div>
  );
}

// Enhanced Headings following Weinschenk (hierarchy) & Krug (scannability)
export function UXHeading({ 
  level, 
  children, 
  className,
  ...props 
}: {
  level: 1 | 2 | 3 | 4;
  children: ReactNode;
  className?: string;
}) {
  const { logPrinciple } = useUX();
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  const typeClass = UX_TYPOGRAPHY[`h${level}` as keyof typeof UX_TYPOGRAPHY];
  
  React.useEffect(() => {
    logPrinciple('Heading', 'Weinschenk: Visual hierarchy, Krug: Scannability');
  }, []);

  return (
    <Tag className={cn(typeClass, className)} {...props}>
      {children}
    </Tag>
  );
}

// Enhanced Text following readability principles
export function UXText({ 
  variant = 'body', 
  children, 
  className,
  ...props 
}: {
  variant?: 'body' | 'caption';
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn(UX_TYPOGRAPHY[variant], className)} {...props}>
      {children}
    </p>
  );
}

// Enhanced Status following Norman (feedback) & Walter (emotion)
export function UXStatus({ 
  type, 
  children, 
  icon, 
  className 
}: {
  type: 'success' | 'warning' | 'error' | 'info';
  children: ReactNode;
  icon?: string;
  className?: string;
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('Status', 'Norman: Immediate feedback, Walter: Emotional design');
  }, []);

  const defaultIcons = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
    info: 'info'
  };

  return (
    <div className={cn(UX_CLASSES.status[type], className)}>
      <span className="material-icons text-base">
        {icon || defaultIcons[type]}
      </span>
      {children}
    </div>
  );
}

// Enhanced Container following responsive principles
export function UXContainer({ 
  children, 
  className,
  ...props 
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Enhanced Grid following Wroblewski (mobile-first)
export function UXGrid({ 
  cols = 'auto', 
  gap = 'md', 
  children, 
  className 
}: {
  cols?: '1' | '2' | '3' | '4' | 'auto';
  gap?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  className?: string;
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('Grid', 'Wroblewski: Mobile-first responsive design');
  }, []);

  const gridClasses = {
    '1': 'grid-cols-1',
    '2': 'grid-cols-1 md:grid-cols-2', 
    '3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    'auto': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };
  
  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6', 
    lg: 'gap-8'
  };

  return (
    <div className={cn('grid', gridClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  );
}

// Enhanced List following Weinschenk (scanning)
export function UXList({ 
  children, 
  className 
}: {
  children: ReactNode;
  className?: string;
}) {
  const { logPrinciple } = useUX();
  
  React.useEffect(() => {
    logPrinciple('List', 'Weinschenk: Optimized for scanning');
  }, []);

  return (
    <div className={cn(UX_CLASSES.list.container, className)}>
      {children}
    </div>
  );
}

export function UXListItem({ 
  children, 
  className,
  onClick 
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div 
      className={cn(UX_CLASSES.list.item, onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </div>
  );
}