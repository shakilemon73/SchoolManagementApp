import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FormFieldEnhancedProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'textarea' | 'select';
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: Array<{ value: string; label: string }>;
  className?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  'aria-describedby'?: string;
}

export const FormFieldEnhanced = forwardRef<HTMLInputElement, FormFieldEnhancedProps>(
  ({
    id,
    label,
    type = 'text',
    value,
    onChange,
    error,
    required,
    placeholder,
    helpText,
    options,
    className,
    disabled,
    maxLength,
    minLength,
    pattern,
    autoComplete,
    'aria-describedby': ariaDescribedBy,
    ...props
  }, ref) => {
    const fieldId = id;
    const errorId = error ? `${fieldId}-error` : undefined;
    const helpId = helpText ? `${fieldId}-help` : undefined;
    const describedBy = [ariaDescribedBy, errorId, helpId].filter(Boolean).join(' ') || undefined;

    const inputClasses = cn(
      "w-full px-3 py-2 border rounded-md transition-all duration-200",
      "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      "dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100",
      error 
        ? "border-red-300 bg-red-50 dark:border-red-600 dark:bg-red-900/20" 
        : "border-gray-300 bg-white",
      disabled && "opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-700",
      className
    );

    const renderInput = () => {
      if (type === 'textarea') {
        return (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            maxLength={maxLength}
            minLength={minLength}
            className={inputClasses}
            aria-describedby={describedBy}
            aria-invalid={error ? 'true' : 'false'}
            rows={4}
            {...props}
          />
        );
      }

      if (type === 'select' && options) {
        return (
          <Select value={value} onValueChange={onChange} disabled={disabled}>
            <SelectTrigger 
              id={fieldId}
              className={inputClasses}
              aria-describedby={describedBy}
              aria-invalid={error ? 'true' : 'false'}
              aria-required={required}
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      }

      return (
        <Input
          ref={ref}
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          autoComplete={autoComplete}
          className={inputClasses}
          aria-describedby={describedBy}
          aria-invalid={error ? 'true' : 'false'}
          {...props}
        />
      );
    };

    return (
      <div className="space-y-2">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium block",
            error ? "text-red-700 dark:text-red-400" : "text-gray-700 dark:text-gray-300",
            required && "after:content-['*'] after:ml-1 after:text-red-500"
          )}
        >
          {label}
        </Label>
        
        {renderInput()}
        
        {helpText && (
          <p 
            id={helpId}
            className="text-xs text-gray-600 dark:text-gray-400"
          >
            {helpText}
          </p>
        )}
        
        {error && (
          <p 
            id={errorId}
            className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
            role="alert"
            aria-live="polite"
          >
            <span className="material-icons text-sm">error</span>
            {error}
          </p>
        )}
        
        {maxLength && type !== 'select' && (
          <div className="text-xs text-gray-500 text-right">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
    );
  }
);

FormFieldEnhanced.displayName = 'FormFieldEnhanced';