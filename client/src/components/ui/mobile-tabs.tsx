import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type TabItem = {
  id: string;
  label: ReactNode;
  icon?: string;
};

interface MobileTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
  className?: string;
}

export function MobileTabs({
  tabs,
  activeTab,
  onChange,
  className,
}: MobileTabsProps) {
  return (
    <div className={cn("w-full border-b border-muted overflow-x-auto no-scrollbar", className)}>
      <div className="flex min-w-max">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "flex items-center justify-center min-w-[80px] px-5 py-4 text-base font-medium transition-all",
              "tap-target border-b-2 focus:outline-none",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground/80 hover:border-muted-foreground/30"
            )}
          >
            {tab.icon && (
              <span className="material-icons text-xl mr-1">{tab.icon}</span>
            )}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

interface MobileTabContentProps {
  value: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function MobileTabContent({
  value,
  activeTab,
  children,
  className,
}: MobileTabContentProps) {
  if (value !== activeTab) return null;
  
  return (
    <div className={cn("mt-4 animate-in fade-in duration-200", className)}>
      {children}
    </div>
  );
}