import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormFieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

// HEURISTIC 5: Error prevention - Clear form field labeling and validation
export function FormFieldWrapper({
  label,
  required = false,
  error,
  hint,
  children,
  className
}: FormFieldWrapperProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {children}
      
      {hint && !error && (
        <p className="text-xs text-muted-foreground">{hint}</p>
      )}
      
      {error && (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle className="h-3 w-3" />
          <p className="text-xs">{error}</p>
        </div>
      )}
    </div>
  );
}