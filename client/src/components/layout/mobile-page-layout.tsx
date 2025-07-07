import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ActionButton = {
  icon: string;
  label?: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  isLoading?: boolean;
  loadingText?: string;
};

interface MobilePageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  headerRight?: ReactNode;
  className?: string;
}

export function MobilePageLayout({
  title,
  description,
  children,
  primaryAction,
  secondaryActions = [],
  headerRight,
  className,
}: MobilePageLayoutProps) {
  return (
    <div className={cn("relative flex flex-col min-h-screen", className)}>
      {/* Mobile-optimized header */}
      <div className="px-4 py-4 mb-4 bg-background sticky top-0 z-10 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 text-base">{description}</p>
            )}
          </div>
          {headerRight && (
            <div className="ml-4 flex items-center">{headerRight}</div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-3 pb-24">
        {children}
      </div>

      {/* Fixed mobile action buttons */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-2 sm:hidden">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              size="icon"
              className="rounded-full w-12 h-12 shadow-lg"
              onClick={action.onClick}
            >
              <span className="material-icons text-xl">{action.icon}</span>
            </Button>
          ))}
          {primaryAction && (
            <Button
              size="lg"
              className="rounded-full w-14 h-14 shadow-lg"
              onClick={primaryAction.onClick}
            >
              {primaryAction.isLoading ? (
                <span className="material-icons animate-spin text-xl">refresh</span>
              ) : (
                <span className="material-icons text-xl">{primaryAction.icon}</span>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Desktop action buttons */}
      {(primaryAction || secondaryActions.length > 0) && (
        <div className="hidden sm:flex gap-3 absolute top-4 right-4">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || "outline"}
              className="flex items-center gap-2 px-4 py-2 text-base"
              onClick={action.onClick}
            >
              <span className="material-icons">{action.icon}</span>
              {action.label}
            </Button>
          ))}
          {primaryAction && (
            <Button
              className="flex items-center gap-2 px-6 py-2 text-base"
              onClick={primaryAction.onClick}
            >
              {primaryAction.isLoading ? (
                <>
                  <span className="material-icons animate-spin">refresh</span>
                  {primaryAction.loadingText || "Loading..."}
                </>
              ) : (
                <>
                  <span className="material-icons">{primaryAction.icon}</span>
                  {primaryAction.label}
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}