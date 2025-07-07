import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { StatColor } from './stat-card';
import { 
  Users, 
  User, 
  School, 
  DollarSign, 
  BookOpen,
  Calendar,
  GraduationCap,
  FileText,
  Settings,
  BarChart3,
  Library,
  Bus,
  CreditCard,
  Bell,
  Plus
} from 'lucide-react';

interface QuickAccessCardProps {
  icon: string;
  title: string;
  path: string;
  color: StatColor;
  className?: string;
}

const iconMap = {
  people: Users,
  person: User,
  groups: School,
  payments: DollarSign,
  school: GraduationCap,
  book: BookOpen,
  library: Library,
  calendar: Calendar,
  document: FileText,
  settings: Settings,
  analytics: BarChart3,
  transport: Bus,
  credit_card: CreditCard,
  notifications: Bell,
  add: Plus,
};

export function QuickAccessCard({ 
  icon, 
  title, 
  path, 
  color,
  className 
}: QuickAccessCardProps) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-amber-100 text-amber-600",
    gray: "bg-gray-100 text-gray-600",
  };

  return (
    <Link href={path}>
      <div className={cn(
        "bg-white rounded-lg p-4 shadow-sm border h-full flex flex-col items-center justify-center",
        "cursor-pointer transition-all hover:shadow-md hover:-translate-y-1",
        className
      )}>
        <div className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center mb-3", 
          colorClasses[color]
        )}>
          {(() => {
            const IconComponent = iconMap[icon as keyof typeof iconMap] || FileText;
            return <IconComponent className="w-6 h-6" />;
          })()}
        </div>
        <p className="text-sm font-medium text-center">{title}</p>
      </div>
    </Link>
  );
}