import React, { forwardRef } from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface MobileInputProps extends InputProps {
  leftIcon?: string;
  rightIcon?: string;
  onRightIconClick?: () => void;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ leftIcon, rightIcon, onRightIconClick, className, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="material-icons absolute left-3 text-muted-foreground">
            {leftIcon}
          </span>
        )}
        <Input
          ref={ref}
          className={cn(
            'h-12 text-base',
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <span
            className={cn(
              "material-icons absolute right-3 text-muted-foreground",
              onRightIconClick && "cursor-pointer hover:text-primary"
            )}
            onClick={onRightIconClick}
          >
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);