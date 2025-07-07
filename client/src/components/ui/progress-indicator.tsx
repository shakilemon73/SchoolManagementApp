import { CheckCircle, Circle, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ProgressStep {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  status: 'pending' | 'current' | 'completed' | 'error';
  estimatedTime?: string;
}

interface ProgressIndicatorProps {
  steps: ProgressStep[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  showEstimatedTime?: boolean;
  variant?: 'horizontal' | 'vertical';
}

export function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
  showEstimatedTime = true,
  variant = 'horizontal'
}: ProgressIndicatorProps) {
  const getStepIcon = (step: ProgressStep, index: number) => {
    const iconClass = "h-5 w-5";
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'current':
        return <Clock className={`${iconClass} text-blue-600 animate-pulse`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      default:
        return <Circle className={`${iconClass} text-gray-400`} />;
    }
  };

  const getStepStatus = (index: number): ProgressStep['status'] => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'current';
    return 'pending';
  };

  const getProgressPercentage = () => {
    return Math.round(((currentStep) / (steps.length - 1)) * 100);
  };

  if (variant === 'vertical') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">অগ্রগতি</h3>
          <Badge variant="secondary" className="px-3 py-1">
            {getProgressPercentage()}% সম্পন্ন
          </Badge>
        </div>
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = onStepClick && status !== 'pending';
            
            return (
              <div
                key={step.id}
                className={`flex items-start space-x-4 p-3 rounded-lg transition-all duration-200 ${
                  status === 'current' ? 'bg-blue-50 border border-blue-200' :
                  status === 'completed' ? 'bg-green-50 border border-green-200' :
                  'bg-gray-50 border border-gray-200'
                } ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}`}
                onClick={() => isClickable && onStepClick(index)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onStepClick(index);
                  }
                }}
              >
                <div className="flex-shrink-0 mt-1">
                  {getStepIcon({ ...step, status }, index)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${
                    status === 'current' ? 'text-blue-900' :
                    status === 'completed' ? 'text-green-900' :
                    'text-gray-700'
                  }`}>
                    {step.titleBn}
                  </h4>
                  <p className={`text-xs mt-1 ${
                    status === 'current' ? 'text-blue-700' :
                    status === 'completed' ? 'text-green-700' :
                    'text-gray-500'
                  }`}>
                    {step.descriptionBn}
                  </p>
                  
                  {showEstimatedTime && step.estimatedTime && status === 'current' && (
                    <div className="flex items-center mt-2">
                      <Clock className="h-3 w-3 text-blue-600 mr-1" />
                      <span className="text-xs text-blue-600">
                        আনুমানিক সময়: {step.estimatedTime}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <Badge 
                    variant={
                      status === 'completed' ? 'default' :
                      status === 'current' ? 'secondary' :
                      'outline'
                    }
                    className="text-xs"
                  >
                    {index + 1}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">অগ্রগতি</h3>
        <Badge variant="secondary" className="px-3 py-1">
          ধাপ {currentStep + 1} এর {steps.length}
        </Badge>
      </div>
      
      {/* Progress Bar */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">শুরু</span>
          <span className="text-sm text-gray-600">সম্পন্ন</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
      </div>
      
      {/* Steps */}
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = onStepClick && status !== 'pending';
          
          return (
            <div
              key={step.id}
              className={`flex flex-col items-center flex-1 ${
                index < steps.length - 1 ? 'mr-4' : ''
              }`}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`w-10 h-10 rounded-full p-0 mb-2 transition-all duration-200 ${
                  status === 'current' ? 'bg-blue-100 hover:bg-blue-200' :
                  status === 'completed' ? 'bg-green-100 hover:bg-green-200' :
                  'bg-gray-100 hover:bg-gray-200'
                } ${!isClickable ? 'cursor-default' : ''}`}
                onClick={() => isClickable && onStepClick(index)}
                disabled={!isClickable}
                aria-label={`ধাপ ${index + 1}: ${step.titleBn}`}
              >
                {getStepIcon({ ...step, status }, index)}
              </Button>
              
              <div className="text-center">
                <p className={`text-xs font-medium mb-1 ${
                  status === 'current' ? 'text-blue-900' :
                  status === 'completed' ? 'text-green-900' :
                  'text-gray-600'
                }`}>
                  {step.titleBn}
                </p>
                
                {status === 'current' && showEstimatedTime && step.estimatedTime && (
                  <div className="flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-600 mr-1" />
                    <span className="text-xs text-blue-600">
                      {step.estimatedTime}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Current Step Details */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-1">
          বর্তমান ধাপ: {steps[currentStep]?.titleBn}
        </h4>
        <p className="text-sm text-blue-700">
          {steps[currentStep]?.descriptionBn}
        </p>
      </div>
    </div>
  );
}