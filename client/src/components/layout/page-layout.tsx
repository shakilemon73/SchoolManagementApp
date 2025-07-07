import { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { useLocation } from "wouter";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  children: ReactNode;
  actions?: ReactNode;
  showBackButton?: boolean;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function PageLayout({
  title,
  subtitle,
  breadcrumbs = [],
  children,
  actions,
  showBackButton = false,
  onRefresh,
  isLoading = false
}: PageLayoutProps) {
  const [, navigate] = useLocation();

  return (
    <div className="space-y-6">
      {/* HEURISTIC 1: Visibility of System Status */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} className="text-sm" />
      )}

      {/* Page Header - HEURISTIC 2: Match between system and real world */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {/* HEURISTIC 3: User control and freedom */}
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.history.back()}
                className="h-8 w-8 p-0"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            
            {/* Loading indicator - HEURISTIC 1: Visibility of system status */}
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh data"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
          {actions}
        </div>
      </div>

      {/* Main content */}
      <div className="pb-6">
        {children}
      </div>
    </div>
  );
}