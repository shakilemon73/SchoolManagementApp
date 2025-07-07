import { cn } from '@/lib/utils';
import { Info, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export type ActivityType = 'info' | 'warning' | 'success' | 'error';

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  type: ActivityType;
  className?: string;
}

export function ActivityItem({ 
  title, 
  description, 
  time, 
  type,
  className 
}: ActivityItemProps) {
  const typeClasses = {
    info: "border-blue-300",
    warning: "border-amber-300",
    success: "border-green-300",
    error: "border-red-300",
  };

  const iconMap = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: AlertCircle,
  };

  const colorMap = {
    info: "text-blue-500",
    warning: "text-amber-500",
    success: "text-green-500",
    error: "text-red-500",
  };

  return (
    <div className={cn(
      "p-3 border-l-4 bg-white rounded-lg mb-3 shadow-sm transition-all hover:shadow-md",
      typeClasses[type],
      className
    )}>
      <div className="flex">
        <div className={cn("mr-2 mt-0.5", colorMap[type])}>
          {type === 'info' && <Info className="w-5 h-5" />}
          {type === 'warning' && <AlertTriangle className="w-5 h-5" />}
          {type === 'success' && <CheckCircle className="w-5 h-5" />}
          {type === 'error' && <AlertCircle className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    </div>
  );
}