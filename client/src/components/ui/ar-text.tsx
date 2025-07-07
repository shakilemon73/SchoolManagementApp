import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface ArTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * ArText - A specialized component for Arabic text
 * Applies appropriate font styling and right-to-left text direction
 * 
 * @example
 * <ArText>النص العربي</ArText>
 */
export function ArText({ children, className }: ArTextProps) {
  return (
    <span 
      className={cn(
        'font-arabic leading-relaxed',
        className
      )}
      lang="ar"
      dir="rtl"
    >
      {children}
    </span>
  );
}