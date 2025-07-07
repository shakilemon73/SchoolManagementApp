import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

type ActionButton = {
  icon: string;
  label?: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  isLoading?: boolean;
  loadingText?: string;
};

interface ResponsivePageLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
  primaryAction?: ActionButton;
  secondaryActions?: ActionButton[];
  headerRight?: ReactNode;
  className?: string;
  breadcrumbs?: { label: string; path: string; }[];
  backButton?: boolean;
  onBackButtonClick?: () => void;
}

export function ResponsivePageLayout({
  title,
  description,
  children,
  primaryAction,
  secondaryActions = [],
  headerRight,
  className,
  breadcrumbs,
  backButton,
  onBackButtonClick,
}: ResponsivePageLayoutProps) {
  const isMobile = useMobile();
  
  return (
    <div className={cn("relative flex flex-col min-h-screen", className)} 
      dir="ltr">
      {/* Responsive header - desktop has bigger padding and different layout */}
      <div className="px-4 py-4 mb-4 bg-background sticky top-0 z-10 border-b">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div className="flex-1">
            {backButton && onBackButtonClick && (
              <button 
                onClick={onBackButtonClick}
                className="flex items-center text-sm mb-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <span className="material-icons text-sm mr-1">arrow_back</span>
                <span>Back</span>
              </button>
            )}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center text-sm mb-2 text-muted-foreground">
                {breadcrumbs.map((crumb, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <span className="mx-2">/</span>}
                    <a href={crumb.path} className="hover:text-primary transition-colors">
                      {crumb.label}
                    </a>
                  </React.Fragment>
                ))}
              </div>
            )}
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 text-base">{description}</p>
            )}
          </div>
          
          {headerRight && !isMobile && (
            <div className="flex items-center">{headerRight}</div>
          )}
          
          {/* Desktop Action buttons */}
          {(primaryAction || secondaryActions.length > 0) && !isMobile && (
            <div className="flex gap-3">
              {secondaryActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "outline"}
                  className="flex items-center gap-2 px-4 py-2 h-10"
                  onClick={action.onClick}
                >
                  <span className="material-icons text-lg">{action.icon}</span>
                  {action.label}
                </Button>
              ))}
              {primaryAction && (
                <Button
                  className="flex items-center gap-2 px-6 py-2 h-10"
                  onClick={primaryAction.onClick}
                >
                  {primaryAction.isLoading ? (
                    <>
                      <span className="material-icons animate-spin">refresh</span>
                      {primaryAction.loadingText || "Loading..."}
                    </>
                  ) : (
                    <>
                      <span className="material-icons text-lg">{primaryAction.icon}</span>
                      {primaryAction.label}
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 px-3 md:px-6 pb-24 md:pb-12">
        {children}
      </div>

      {/* Mobile floating action buttons */}
      {(primaryAction || secondaryActions.length > 0) && isMobile && (
        <div className="fixed bottom-16 right-4 z-20 flex flex-col gap-2">
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
    </div>
  );
}