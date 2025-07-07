import React, { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormSectionProps {
  title: ReactNode;
  icon?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  collapsible?: boolean;
  className?: string;
}

export function FormSection({
  title,
  icon,
  children,
  defaultOpen = true,
  collapsible = true,
  className,
}: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn("bg-muted/30 p-4 rounded-lg mt-4", className)}>
      <div
        className={cn(
          "flex items-center mb-4 cursor-pointer",
          collapsible && "cursor-pointer"
        )}
        onClick={() => collapsible && setIsOpen(!isOpen)}
      >
        {icon && <span className="material-icons mr-2 text-primary/80">{icon}</span>}
        <h3 className="text-lg font-semibold text-primary/80 flex-1">{title}</h3>
        {collapsible && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
            <span className="material-icons text-sm">
              {isOpen ? 'expand_more' : 'chevron_right'}
            </span>
          </Button>
        )}
      </div>

      <div className={cn("transition-all duration-200", 
        isOpen ? "opacity-100 max-h-[2000px]" : "opacity-0 max-h-0 overflow-hidden")}>
        <div className="p-1 space-y-5">
          {children}
        </div>
      </div>
    </div>
  );
}