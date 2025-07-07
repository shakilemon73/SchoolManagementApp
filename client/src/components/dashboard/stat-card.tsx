import { cn } from '@/lib/utils';
import { 
  Users, 
  User, 
  School, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BookOpen,
  Calendar,
  GraduationCap
} from 'lucide-react';

export type StatColor = 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'gray';

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  color: StatColor;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const iconMap = {
  people: Users,
  person: User,
  groups: School,
  payments: DollarSign,
  school: GraduationCap,
  book: BookOpen,
  calendar: Calendar,
};

export function StatCard({ 
  icon, 
  title, 
  value, 
  color,
  trend,
  className 
}: StatCardProps) {
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
      "bg-white rounded-lg p-4 shadow-sm border transition-all hover:shadow-md", 
      className
    )}>
      <div className="flex items-center">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center mr-3", 
          colorClasses[color]
        )}>
          {(() => {
            const IconComponent = iconMap[icon as keyof typeof iconMap] || User;
            return <IconComponent className="w-5 h-5" />;
          })()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="flex items-end">
            <p className="text-xl font-bold">{value}</p>
            
            {trend && (
              <div className={cn(
                "ml-2 flex items-center text-xs",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="ml-0.5">{trend.value}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}