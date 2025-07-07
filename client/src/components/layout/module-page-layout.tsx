import { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ModulePageLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  icon: ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string;
}

export function ModulePageLayout({
  children,
  title,
  description,
  icon,
  onAddNew,
  addNewLabel = 'নতুন যোগ করুন'
}: ModulePageLayoutProps) {
    const isMobile = useMobile();

  return (
    <AppShell>
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
          
          {onAddNew && (
            <Button onClick={onAddNew} className="shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              {addNewLabel}
            </Button>
          )}
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-0 overflow-hidden">
            {children}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}