import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface FormSectionProps {
  title: string;
  titleBn: string;
  description?: string;
  icon: string;
  isCompleted?: boolean;
  isActive?: boolean;
  children: React.ReactNode;
  progress?: number;
}

// Don Norman's Clear Mental Model - Progressive Disclosure
export const FormSection: React.FC<FormSectionProps> = ({
  title,
  titleBn,
  description,
  icon,
  isCompleted = false,
  isActive = false,
  children,
  progress
}) => {
  return (
    <Card className={`
      transition-all duration-300 border-2
      ${isActive 
        ? 'border-blue-200 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20 shadow-lg' 
        : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
      }
      ${isCompleted ? 'border-green-200 dark:border-green-700 bg-green-50/30 dark:bg-green-950/10' : ''}
    `}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center transition-all
              ${isCompleted 
                ? 'bg-green-100 dark:bg-green-900/30' 
                : isActive 
                  ? 'bg-blue-100 dark:bg-blue-900/30' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }
            `}>
              <span className={`
                material-icons text-xl
                ${isCompleted 
                  ? 'text-green-600 dark:text-green-400' 
                  : isActive 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-gray-500 dark:text-gray-400'
                }
              `}>
                {isCompleted ? 'check_circle' : icon}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {titleBn}
              </CardTitle>
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700">
                সম্পন্ন
              </Badge>
            )}
            {isActive && !isCompleted && (
              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700">
                চলমান
              </Badge>
            )}
          </div>
        </div>
        
        {progress !== undefined && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">অগ্রগতি</span>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className={`${isActive ? 'block' : 'hidden'}`}>
        {children}
      </CardContent>
    </Card>
  );
};

interface FormStepperProps {
  steps: Array<{
    id: string;
    title: string;
    titleBn: string;
    icon: string;
    isCompleted: boolean;
    isActive: boolean;
  }>;
  onStepClick: (stepId: string) => void;
}

// Steve Krug's Don't Make Me Think - Clear Navigation
export const FormStepper: React.FC<FormStepperProps> = ({ steps, onStepClick }) => {
  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm mb-6">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <button
            onClick={() => onStepClick(step.id)}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg transition-all
              ${step.isActive 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : step.isCompleted 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center text-sm
              ${step.isCompleted 
                ? 'bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300' 
                : step.isActive 
                  ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
              }
            `}>
              <span className="material-icons text-sm">
                {step.isCompleted ? 'check' : step.icon}
              </span>
            </div>
            <span className="font-medium text-sm hidden md:block">{step.titleBn}</span>
          </button>
          
          {index < steps.length - 1 && (
            <div className={`
              h-px flex-1 mx-2
              ${steps[index + 1].isCompleted || step.isCompleted 
                ? 'bg-green-200 dark:bg-green-700' 
                : 'bg-gray-200 dark:bg-gray-700'
              }
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

interface FieldGroupProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

// Luke Wroblewski's Web Form Design - Field Grouping
export const FieldGroup: React.FC<FieldGroupProps> = ({ 
  title, 
  description, 
  children, 
  required = false 
}) => {
  return (
    <div className="space-y-4 p-6 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
      <div className="flex items-center gap-2">
        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h4>
        {required && (
          <Badge variant="outline" className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700 text-xs">
            আবশ্যক
          </Badge>
        )}
      </div>
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children}
      </div>
    </div>
  );
};

interface ActionPanelProps {
  primaryAction: {
    label: string;
    onClick: () => void;
    isLoading?: boolean;
    icon?: string;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    icon?: string;
  };
  progress?: number;
  validationErrors?: string[];
}

// Aarron Walter's Emotional Design - Clear Actions
export const ActionPanel: React.FC<ActionPanelProps> = ({
  primaryAction,
  secondaryAction,
  progress,
  validationErrors = []
}) => {
  return (
    <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 shadow-lg">
      {validationErrors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-icons text-red-600 dark:text-red-400 text-sm">error</span>
            <span className="text-sm font-medium text-red-800 dark:text-red-300">ত্রুটি সংশোধন করুন</span>
          </div>
          <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="flex items-center gap-2">
                <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {progress !== undefined && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">সামগ্রিক অগ্রগতি</span>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2"
          >
            {secondaryAction.icon && (
              <span className="material-icons text-sm">{secondaryAction.icon}</span>
            )}
            {secondaryAction.label}
          </button>
        )}
        
        <button
          onClick={primaryAction.onClick}
          disabled={primaryAction.isLoading || validationErrors.length > 0}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2 min-w-[140px]"
        >
          {primaryAction.isLoading ? (
            <>
              <span className="material-icons animate-spin text-sm">autorenew</span>
              প্রক্রিয়াকরণ...
            </>
          ) : (
            <>
              {primaryAction.icon && (
                <span className="material-icons text-sm">{primaryAction.icon}</span>
              )}
              {primaryAction.label}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

interface PreviewPanelProps {
  title: string;
  children: React.ReactNode;
  actions: Array<{
    label: string;
    onClick: () => void;
    icon: string;
    variant?: 'primary' | 'secondary';
  }>;
}

// Jonathan Ive's Clean Design - Preview Interface
export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  title,
  children,
  actions
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                className={`
                  px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
                  ${action.variant === 'primary' 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }
                `}
              >
                <span className="material-icons text-sm">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};