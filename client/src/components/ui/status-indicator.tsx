import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2 } from "lucide-react";

interface StatusIndicatorProps {
  status: "success" | "error" | "warning" | "pending" | "loading";
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

// HEURISTIC 1: Visibility of system status - Clear status indicators
export function StatusIndicator({ 
  status, 
  label, 
  size = "md", 
  showIcon = true 
}: StatusIndicatorProps) {
  const statusConfig = {
    success: {
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200"
    },
    error: {
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200"
    },
    warning: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200"
    },
    pending: {
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    loading: {
      icon: Loader2,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200"
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  
  const sizeClasses = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2"
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-full border",
      config.bg,
      config.border,
      sizeClasses[size]
    )}>
      {showIcon && (
        <Icon className={cn(
          iconSizes[size],
          config.color,
          status === "loading" && "animate-spin"
        )} />
      )}
      {label && (
        <span className={cn("font-medium", config.color)}>
          {label}
        </span>
      )}
    </div>
  );
}