import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatColor } from './stat-card';
import { FileText, Eye, Download, MoreVertical } from 'lucide-react';

interface DocumentItemProps {
  icon: string;
  title: string;
  date: string;
  color: StatColor;
  onClick?: () => void;
  onViewClick?: () => void;
  onDownloadClick?: () => void;
  className?: string;
}

export function DocumentItem({ 
  icon, 
  title, 
  date,
  color,
  onClick,
  onViewClick,
  onDownloadClick,
  className 
}: DocumentItemProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-amber-100 text-amber-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <div className={cn(
      "bg-white shadow-sm rounded-lg",
      className
    )}>
      <div className="flex p-3 items-center">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center mr-3", 
          colorClasses[color]
        )}>
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-gray-500">তৈরি করা হয়েছে: {date}</p>
        </div>
        <div className="flex gap-1">
          {onViewClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onViewClick();
              }}
            >
              <Eye className="w-4 h-4 text-gray-500" />
            </Button>
          )}
          {onDownloadClick && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onDownloadClick();
              }}
            >
              <Download className="w-4 h-4 text-gray-500" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onClick?.();
            }}
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}