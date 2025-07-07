import React, { forwardRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button as BaseButton } from '@/components/ui/button';
import { Card as BaseCard } from '@/components/ui/card';
import { Input as BaseInput } from '@/components/ui/input';
import { Badge as BaseBadge } from '@/components/ui/badge';
import { Loader2, CheckCircle, AlertCircle, Info, X, Database, Users, Settings, BarChart3 } from 'lucide-react';

// Enhanced Button with cultural awareness and world-class UX
interface EnhancedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cultural' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  language?: 'bn' | 'en' | 'both';
  cultural?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const UXButton = forwardRef<HTMLButtonElement, EnhancedButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, language = 'en', cultural, icon, children, ...props }, ref) => {
    const baseClasses = [
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'hover:scale-105 active:scale-95 transform-gpu', // Smooth micro-interactions
      'shadow-lg hover:shadow-xl active:shadow-md', // Depth feedback
      cultural && 'font-semibold tracking-wide' // Cultural typography enhancement
    ].filter(Boolean).join(' ');

    const variants = {
      primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-500',
      secondary: 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-500',
      cultural: 'bg-gradient-to-r from-green-600 to-red-600 text-white hover:from-green-700 hover:to-red-700 focus-visible:ring-green-500',
      success: 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 focus-visible:ring-green-500',
      warning: 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 focus-visible:ring-yellow-500',
      destructive: 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 focus-visible:ring-red-500'
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-base',
      lg: 'h-13 px-8 text-lg'
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && icon && <span className="mr-2 flex items-center">{icon}</span>}
        <span className="relative">{children}</span>
      </button>
    );
  }
);

// Enhanced Card with automatic elevation and smart interactions
interface UXCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'cultural' | 'success' | 'warning' | 'info' | 'admin';
  interactive?: boolean;
  language?: 'bn' | 'en' | 'both';
  children: React.ReactNode;
  hover?: boolean;
}

export const UXCard = forwardRef<HTMLDivElement, UXCardProps>(
  ({ className, variant = 'default', interactive, language = 'en', hover = true, children, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseClasses = [
      'rounded-xl border transition-all duration-300 ease-out',
      interactive && 'cursor-pointer hover:scale-[1.02] active:scale-[0.98] transform-gpu',
      hover && 'hover:shadow-xl',
      language === 'bn' && 'font-medium', // Enhanced Bengali typography
    ].filter(Boolean).join(' ');

    const variants = {
      default: 'bg-white border-gray-200 shadow-md hover:border-gray-300',
      elevated: 'bg-white border-gray-200 shadow-lg hover:shadow-2xl hover:border-blue-300',
      cultural: 'bg-gradient-to-br from-green-50 via-white to-red-50 border-green-200 shadow-lg hover:shadow-xl',
      success: 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md hover:shadow-lg',
      warning: 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200 shadow-md hover:shadow-lg',
      info: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md hover:shadow-lg',
      admin: 'bg-gradient-to-br from-purple-50 via-white to-blue-50 border-purple-200 shadow-lg hover:shadow-2xl hover:border-purple-300'
    };

    return (
      <div
        className={cn(baseClasses, variants[variant], className)}
        ref={ref}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <div className={`transition-all duration-300 ${isHovered && interactive ? 'transform translate-y-[-1px]' : ''}`}>
          {children}
        </div>
      </div>
    );
  }
);

// Status indicator with smart animations
interface UXStatusProps {
  status: 'active' | 'inactive' | 'pending' | 'error' | 'success';
  text?: string;
  textBn?: string;
  language?: 'bn' | 'en' | 'both';
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const UXStatus: React.FC<UXStatusProps> = ({
  status,
  text,
  textBn,
  language = 'en',
  size = 'md',
  animated = true
}) => {
  const statusConfig = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      pulse: animated ? 'animate-pulse' : ''
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-400',
      pulse: ''
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-800',
      dot: 'bg-yellow-500',
      pulse: animated ? 'animate-bounce' : ''
    },
    error: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      pulse: animated ? 'animate-pulse' : ''
    },
    success: {
      bg: 'bg-emerald-100',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      pulse: ''
    }
  };

  const sizes = {
    sm: { badge: 'px-2 py-1 text-xs', dot: 'h-2 w-2' },
    md: { badge: 'px-3 py-1 text-sm', dot: 'h-3 w-3' },
    lg: { badge: 'px-4 py-2 text-base', dot: 'h-4 w-4' }
  };

  const config = statusConfig[status];
  const sizeConfig = sizes[size];

  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium transition-all duration-200',
      config.bg,
      config.text,
      sizeConfig.badge
    )}>
      <div className={cn(
        'rounded-full mr-2',
        config.dot,
        config.pulse,
        sizeConfig.dot
      )} />
      {text && <span>{text}</span>}
      {textBn && language !== 'en' && (
        <span className="ml-1 font-medium">{textBn}</span>
      )}
    </div>
  );
};

// Enhanced Input with smart validation and cultural support
interface UXInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  labelBn?: string;
  error?: string;
  success?: boolean;
  language?: 'bn' | 'en' | 'both';
  cultural?: boolean;
  helpText?: string;
  icon?: React.ReactNode;
  validation?: 'email' | 'phone' | 'url' | 'required';
}

export const UXInput = forwardRef<HTMLInputElement, UXInputProps>(
  ({ className, label, labelBn, error, success, language = 'en', cultural, helpText, icon, validation, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isValid, setIsValid] = useState(true);

    const inputClasses = [
      'flex h-12 w-full rounded-lg border-2 px-4 py-3 text-base transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-opacity-20',
      'disabled:cursor-not-allowed disabled:opacity-50',
      'placeholder:text-gray-400',
      error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500',
      success && 'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500',
      !error && !success && 'border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500',
      cultural && 'font-medium text-lg', // Enhanced typography for cultural content
      icon && 'pl-12',
      isFocused && 'shadow-lg transform scale-[1.01]'
    ].filter(Boolean).join(' ');

    return (
      <div className="space-y-3">
        {(label || labelBn) && (
          <div className="space-y-1">
            {label && (
              <label className="text-sm font-semibold text-gray-700 tracking-wide">
                {label}
                {validation === 'required' && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
            {labelBn && language !== 'en' && (
              <label className="block text-sm font-semibold text-gray-600" dir="ltr">
                {labelBn}
                {validation === 'required' && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}
          </div>
        )}
        
        <div className="relative group">
          {icon && (
            <div className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300",
              isFocused ? "text-blue-500" : "text-gray-400"
            )}>
              {icon}
            </div>
          )}
          
          <input
            className={cn(inputClasses, className)}
            ref={ref}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {success && (
            <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500 animate-in zoom-in duration-300" />
          )}
          
          {error && (
            <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500 animate-in zoom-in duration-300" />
          )}
        </div>
        
        {error && (
          <div className="flex items-center space-x-2 text-red-600 animate-in slide-in-from-top-1 duration-300">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        {helpText && !error && (
          <div className="flex items-center space-x-2 text-gray-500">
            <Info className="h-4 w-4 flex-shrink-0" />
            <p className="text-sm">{helpText}</p>
          </div>
        )}
      </div>
    );
  }
);

// Smart Loading Component with cultural animations
interface UXLoadingProps {
  variant?: 'spinner' | 'dots' | 'pulse' | 'cultural' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  textBn?: string;
  language?: 'bn' | 'en' | 'both';
  fullScreen?: boolean;
}

export const UXLoading: React.FC<UXLoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  textBn,
  language = 'en',
  fullScreen = false
}) => {
  const sizes = {
    sm: { spinner: 'h-5 w-5', text: 'text-sm', dots: 'h-2 w-2' },
    md: { spinner: 'h-8 w-8', text: 'text-base', dots: 'h-3 w-3' },
    lg: { spinner: 'h-12 w-12', text: 'text-lg', dots: 'h-4 w-4' }
  };

  const sizeConfig = sizes[size];

  const renderLoader = () => {
    switch (variant) {
      case 'spinner':
        return <Loader2 className={cn('animate-spin text-blue-600', sizeConfig.spinner)} />;
      case 'dots':
        return (
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn('animate-bounce rounded-full bg-blue-600', sizeConfig.dots)}
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        );
      case 'pulse':
        return <div className={cn('animate-pulse rounded-full bg-blue-600', sizeConfig.spinner)} />;
      case 'cultural':
        return (
          <div className="relative">
            <div className={cn('animate-spin rounded-full border-4 border-green-200', sizeConfig.spinner)}>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-green-600 border-r-red-600 animate-spin" />
            </div>
          </div>
        );
      case 'admin':
        return (
          <div className="relative">
            <div className={cn('animate-spin rounded-full border-4 border-purple-200', sizeConfig.spinner)}>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-600 animate-spin" />
            </div>
          </div>
        );
      default:
        return <Loader2 className={cn('animate-spin text-blue-600', sizeConfig.spinner)} />;
    }
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {renderLoader()}
      {text && (
        <p className={cn('text-gray-600 font-medium animate-pulse', sizeConfig.text)}>
          {text}
        </p>
      )}
      {textBn && language !== 'en' && (
        <p className={cn('text-gray-600 font-medium animate-pulse', sizeConfig.text)} dir="ltr">
          {textBn}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl border">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Quick Action Card for admin interfaces
interface UXQuickActionProps {
  title: string;
  titleBn?: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
  language?: 'bn' | 'en' | 'both';
  disabled?: boolean;
  badge?: string;
}

export const UXQuickAction: React.FC<UXQuickActionProps> = ({
  title,
  titleBn,
  description,
  icon,
  color = 'blue',
  onClick,
  language = 'en',
  disabled = false,
  badge
}) => {
  return (
    <UXCard 
      variant="elevated" 
      interactive 
      onClick={disabled ? undefined : onClick}
      className={cn(
        "p-6 group relative overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start space-x-4">
        <div className={cn(
          "p-3 rounded-xl transition-all duration-300 group-hover:scale-110",
          `bg-${color}-100 text-${color}-600`
        )}>
          {icon}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-lg">
              {title}
            </h3>
            {badge && (
              <UXStatus status="active" text={badge} size="sm" />
            )}
          </div>
          
          {titleBn && language !== 'en' && (
            <h4 className="font-medium text-gray-700 mt-1" dir="ltr">
              {titleBn}
            </h4>
          )}
          
          <p className="text-gray-600 mt-2 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </UXCard>
  );
};

// Components are already exported above, no need for additional exports