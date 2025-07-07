import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface BnTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * BnText - A specialized component for Bengali text
 * Applies appropriate font styling and line height for Bengali script
 * 
 * @example
 * <BnText>বাংলা লেখা</BnText>
 */
export function BnText({ children, className }: BnTextProps) {
  return (
    <span 
      className={cn(
        'font-bengali leading-relaxed',
        className
      )}
      lang="bn"
    >
      {children}
    </span>
  );
}