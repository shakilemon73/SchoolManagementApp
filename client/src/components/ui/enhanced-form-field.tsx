import { useState, useId } from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Info, AlertCircle, CheckCircle } from 'lucide-react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

interface EnhancedFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'date' | 'textarea' | 'select';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  helpText?: string;
  culturalHint?: string;
  validation?: {
    pattern?: RegExp;
    minLength?: number;
    maxLength?: number;
  };
  icon?: React.ReactNode;
}

export function EnhancedFormField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
  options = [],
  required = false,
  helpText,
  culturalHint,
  validation,
  icon
}: EnhancedFormFieldProps<T>) {
  const [isFocused, setIsFocused] = useState(false);
  const fieldId = useId();
  const helpTextId = `${fieldId}-help`;
  const errorId = `${fieldId}-error`;

  const renderField = (field: any, fieldState: any) => {
    const hasError = !!fieldState.error;
    const isValid = !hasError && field.value && !isFocused;

    const baseClasses = `
      transition-all duration-200 border-2 
      ${hasError ? 'border-red-500 focus:border-red-500' : 
        isValid ? 'border-green-500 focus:border-green-500' : 
        'border-gray-300 focus:border-blue-500'}
      ${isFocused ? 'ring-2 ring-blue-200' : ''}
    `;

    const commonProps = {
      ...field,
      id: fieldId,
      placeholder,
      onFocus: () => setIsFocused(true),
      onBlur: () => {
        setIsFocused(false);
        field.onBlur();
      },
      className: baseClasses,
      'aria-describedby': `${helpText ? helpTextId : ''} ${hasError ? errorId : ''}`.trim(),
      'aria-invalid': hasError,
      'aria-required': required
    };

    switch (type) {
      case 'textarea':
        return (
          <Textarea
            {...commonProps}
            rows={4}
            style={{ fontFamily: 'SolaimanLipi, Arial, sans-serif' }}
          />
        );
      
      case 'select':
        return (
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger className={baseClasses} id={fieldId}>
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
      
      default:
        return (
          <div className="relative">
            {icon && (
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                {icon}
              </div>
            )}
            <Input
              {...commonProps}
              type={type}
              className={`${baseClasses} ${icon ? 'pl-10' : ''}`}
              style={{ 
                fontFamily: type === 'text' || type === 'textarea' ? 'SolaimanLipi, Arial, sans-serif' : undefined 
              }}
            />
            {isValid && (
              <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 h-5 w-5" />
            )}
            {hasError && (
              <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
            )}
          </div>
        );
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className="space-y-2">
          <FormLabel 
            htmlFor={fieldId}
            className="flex items-center gap-2 text-sm font-medium text-gray-700"
          >
            {label}
            {required && (
              <Badge variant="secondary" className="text-xs px-1 py-0 bg-red-100 text-red-700">
                আবশ্যক
              </Badge>
            )}
          </FormLabel>
          
          <FormControl>
            {renderField(field, fieldState)}
          </FormControl>
          
          {/* Help Text and Cultural Hints */}
          {(helpText || culturalHint) && (
            <div id={helpTextId} className="space-y-1">
              {helpText && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{helpText}</span>
                </div>
              )}
              {culturalHint && (
                <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <strong>বাংলাদেশী প্রসঙ্গ:</strong> {culturalHint}
                </div>
              )}
            </div>
          )}
          
          {/* Error Message with Enhanced UX */}
          <FormMessage id={errorId} className="flex items-start gap-2 text-sm text-red-600" />
          
          {/* Field Validation Status */}
          {validation && field.value && (
            <div className="space-y-1">
              {validation.minLength && (
                <div className="flex items-center gap-2 text-xs">
                  {field.value.length >= validation.minLength ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={field.value.length >= validation.minLength ? 'text-green-600' : 'text-red-600'}>
                    ন্যূনতম {validation.minLength} অক্ষর প্রয়োজন
                  </span>
                </div>
              )}
              {validation.maxLength && (
                <div className="flex items-center gap-2 text-xs">
                  {field.value.length <= validation.maxLength ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={field.value.length <= validation.maxLength ? 'text-green-600' : 'text-red-600'}>
                    সর্বোচ্চ {validation.maxLength} অক্ষর ({field.value.length}/{validation.maxLength})
                  </span>
                </div>
              )}
              {validation.pattern && (
                <div className="flex items-center gap-2 text-xs">
                  {validation.pattern.test(field.value) ? (
                    <CheckCircle className="h-3 w-3 text-green-500" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-500" />
                  )}
                  <span className={validation.pattern.test(field.value) ? 'text-green-600' : 'text-red-600'}>
                    সঠিক ফরম্যাট প্রয়োজন
                  </span>
                </div>
              )}
            </div>
          )}
        </FormItem>
      )}
    />
  );
}