import { cn } from '@/lib/utils';

interface EventItemProps {
  title: string;
  date: string;
  type: string;
  className?: string;
}

export function EventItem({ 
  title, 
  date, 
  type,
  className 
}: EventItemProps) {
  // Split date into "Month Day" format
  const dateParts = date.split(' ');
  
  return (
    <div className={cn(
      "flex items-center mb-4 transition-all hover:bg-muted/20 p-2 rounded-md -mx-2",
      className
    )}>
      <div className="w-10 text-center mr-3">
        <p className="text-xs text-gray-500">{dateParts[0]}</p>
        <p className="text-lg font-bold text-primary">{dateParts[1]}</p>
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-gray-500">{type}</p>
      </div>
    </div>
  );
}