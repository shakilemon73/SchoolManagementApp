import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface SmartInputProps {
  label: string;
  labelBn?: string;
  placeholder?: string;
  placeholderBn?: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'date' | 'password';
  required?: boolean;
  helperText?: string;
  errorText?: string;
  value?: string;
  onChange?: (value: string) => void;
  icon?: string;
  validation?: 'none' | 'valid' | 'error' | 'warning';
  autoComplete?: boolean;
}

// Luke Wroblewski's Form Design - Smart Input with Enhanced UX
export const SmartInput: React.FC<SmartInputProps> = ({
  label,
  labelBn,
  placeholder,
  placeholderBn,
  type = 'text',
  required = false,
  helperText,
  errorText,
  value,
  onChange,
  icon,
  validation = 'none',
  autoComplete = false
}) => {
  const displayLabel = labelBn || label;
  const displayPlaceholder = placeholderBn || placeholder;

  const getInputStyles = () => {
    const baseStyles = "h-12 border-2 transition-all duration-200 focus:outline-none";
    
    switch (validation) {
      case 'valid':
        return `${baseStyles} border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/30 dark:bg-green-950/10`;
      case 'error':
        return `${baseStyles} border-red-200 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/30 dark:bg-red-950/10`;
      case 'warning':
        return `${baseStyles} border-yellow-200 dark:border-yellow-700 focus:border-yellow-500 dark:focus:border-yellow-400 bg-yellow-50/30 dark:bg-yellow-950/10`;
      default:
        return `${baseStyles} border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {icon && <span className="material-icons text-sm text-gray-500">{icon}</span>}
          {displayLabel}
          {required && <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">আবশ্যক</Badge>}
        </Label>
        {validation === 'valid' && (
          <span className="material-icons text-green-500 text-sm">check_circle</span>
        )}
      </div>
      
      <div className="relative">
        <Input
          type={type}
          placeholder={displayPlaceholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={getInputStyles()}
          autoComplete={autoComplete ? 'on' : 'off'}
        />
        {validation === 'error' && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <span className="material-icons text-red-500 text-sm">error</span>
          </div>
        )}
      </div>
      
      {helperText && !errorText && (
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <span className="material-icons text-xs">info</span>
          {helperText}
        </p>
      )}
      
      {errorText && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="material-icons text-xs">error</span>
          {errorText}
        </p>
      )}
    </div>
  );
};

interface SmartSelectProps {
  label: string;
  labelBn?: string;
  placeholder?: string;
  placeholderBn?: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
  value?: string;
  onChange?: (value: string) => void;
  options: Array<{
    value: string;
    label: string;
    labelBn?: string;
    disabled?: boolean;
  }>;
  icon?: string;
  validation?: 'none' | 'valid' | 'error' | 'warning';
}

// Enhanced Select Component with Better Accessibility
export const SmartSelect: React.FC<SmartSelectProps> = ({
  label,
  labelBn,
  placeholder,
  placeholderBn,
  required = false,
  helperText,
  errorText,
  value,
  onChange,
  options,
  icon,
  validation = 'none'
}) => {
  const displayLabel = labelBn || label;
  const displayPlaceholder = placeholderBn || placeholder;

  const getTriggerStyles = () => {
    const baseStyles = "h-12 border-2 transition-all duration-200";
    
    switch (validation) {
      case 'valid':
        return `${baseStyles} border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/30 dark:bg-green-950/10`;
      case 'error':
        return `${baseStyles} border-red-200 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/30 dark:bg-red-950/10`;
      case 'warning':
        return `${baseStyles} border-yellow-200 dark:border-yellow-700 focus:border-yellow-500 dark:focus:border-yellow-400 bg-yellow-50/30 dark:bg-yellow-950/10`;
      default:
        return `${baseStyles} border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {icon && <span className="material-icons text-sm text-gray-500">{icon}</span>}
          {displayLabel}
          {required && <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">আবশ্যক</Badge>}
        </Label>
        {validation === 'valid' && (
          <span className="material-icons text-green-500 text-sm">check_circle</span>
        )}
      </div>
      
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={getTriggerStyles()}>
          <SelectValue placeholder={displayPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
              className="py-3"
            >
              <div className="flex items-center gap-2">
                <span>{option.labelBn || option.label}</span>
                {option.disabled && (
                  <Badge variant="outline" className="text-xs">অনুপলব্ধ</Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {helperText && !errorText && (
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <span className="material-icons text-xs">info</span>
          {helperText}
        </p>
      )}
      
      {errorText && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="material-icons text-xs">error</span>
          {errorText}
        </p>
      )}
    </div>
  );
};

interface SmartTextareaProps {
  label: string;
  labelBn?: string;
  placeholder?: string;
  placeholderBn?: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
  maxLength?: number;
  icon?: string;
  validation?: 'none' | 'valid' | 'error' | 'warning';
}

// Enhanced Textarea with Character Count
export const SmartTextarea: React.FC<SmartTextareaProps> = ({
  label,
  labelBn,
  placeholder,
  placeholderBn,
  required = false,
  helperText,
  errorText,
  value = '',
  onChange,
  rows = 4,
  maxLength,
  icon,
  validation = 'none'
}) => {
  const displayLabel = labelBn || label;
  const displayPlaceholder = placeholderBn || placeholder;

  const getTextareaStyles = () => {
    const baseStyles = "min-h-[100px] border-2 transition-all duration-200 focus:outline-none resize-y";
    
    switch (validation) {
      case 'valid':
        return `${baseStyles} border-green-200 dark:border-green-700 focus:border-green-500 dark:focus:border-green-400 bg-green-50/30 dark:bg-green-950/10`;
      case 'error':
        return `${baseStyles} border-red-200 dark:border-red-700 focus:border-red-500 dark:focus:border-red-400 bg-red-50/30 dark:bg-red-950/10`;
      case 'warning':
        return `${baseStyles} border-yellow-200 dark:border-yellow-700 focus:border-yellow-500 dark:focus:border-yellow-400 bg-yellow-50/30 dark:bg-yellow-950/10`;
      default:
        return `${baseStyles} border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400`;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          {icon && <span className="material-icons text-sm text-gray-500">{icon}</span>}
          {displayLabel}
          {required && <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">আবশ্যক</Badge>}
        </Label>
        {validation === 'valid' && (
          <span className="material-icons text-green-500 text-sm">check_circle</span>
        )}
      </div>
      
      <div className="relative">
        <Textarea
          placeholder={displayPlaceholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={getTextareaStyles()}
          rows={rows}
          maxLength={maxLength}
        />
        {maxLength && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-1 rounded">
            {value.length}/{maxLength}
          </div>
        )}
      </div>
      
      {helperText && !errorText && (
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <span className="material-icons text-xs">info</span>
          {helperText}
        </p>
      )}
      
      {errorText && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="material-icons text-xs">error</span>
          {errorText}
        </p>
      )}
    </div>
  );
};

interface FileUploadProps {
  label: string;
  labelBn?: string;
  accept?: string;
  required?: boolean;
  helperText?: string;
  errorText?: string;
  onChange?: (file: File | null) => void;
  icon?: string;
  maxSize?: number; // in MB
  previewUrl?: string;
}

// Enhanced File Upload with Preview
export const SmartFileUpload: React.FC<FileUploadProps> = ({
  label,
  labelBn,
  accept = 'image/*',
  required = false,
  helperText,
  errorText,
  onChange,
  icon = 'upload',
  maxSize = 5,
  previewUrl
}) => {
  const displayLabel = labelBn || label;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && file.size > maxSize * 1024 * 1024) {
      // File too large
      return;
    }
    onChange?.(file);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
          <span className="material-icons text-sm text-gray-500">{icon}</span>
          {displayLabel}
          {required && <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">আবশ্যক</Badge>}
        </Label>
      </div>
      
      <div className="relative">
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-all">
          {previewUrl ? (
            <div className="space-y-3">
              <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-lg mx-auto" />
              <p className="text-sm text-gray-600 dark:text-gray-400">ফাইল নির্বাচিত</p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="material-icons text-3xl text-gray-400">cloud_upload</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">ফাইল আপলোড করুন</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">অথবা এখানে ড্র্যাগ করুন</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {helperText && !errorText && (
        <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <span className="material-icons text-xs">info</span>
          {helperText} (সর্বোচ্চ {maxSize}MB)
        </p>
      )}
      
      {errorText && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
          <span className="material-icons text-xs">error</span>
          {errorText}
        </p>
      )}
    </div>
  );
};