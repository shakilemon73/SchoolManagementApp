import { cn } from '@/lib/utils';

interface StepProgressProps {
  steps: Array<{
    id: number;
    title: string;
    description: string;
    icon: string;
  }>;
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function StepProgress({ steps, currentStep, onStepClick, className }: StepProgressProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile Progress Bar */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ধাপ {currentStep} / {steps.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((currentStep / steps.length) * 100)}% সম্পন্ন
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
            role="progressbar"
            aria-valuenow={currentStep}
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-label={`ধাপ ${currentStep} এর ${steps.length}`}
          />
        </div>
        <div className="mt-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {steps[currentStep - 1]?.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Desktop Step Navigation */}
      <nav 
        className="hidden md:flex justify-between mb-8"
        aria-label="Progress"
        role="navigation"
      >
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          return (
            <div
              key={step.id}
              className={cn(
                "flex-1 relative",
                index !== steps.length - 1 && "pr-8 sm:pr-20"
              )}
            >
              {/* Connection Line */}
              {index !== steps.length - 1 && (
                <div 
                  className={cn(
                    "absolute top-4 left-8 w-full h-0.5 transition-colors duration-300",
                    isCompleted ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                  )}
                  aria-hidden="true"
                />
              )}

              {/* Step Button */}
              <button
                onClick={() => isClickable && onStepClick(step.id)}
                disabled={!isClickable}
                className={cn(
                  "relative w-8 h-8 flex items-center justify-center rounded-full border-2 transition-all duration-300",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  isCompleted && "bg-blue-600 border-blue-600 text-white",
                  isCurrent && "border-blue-600 bg-white dark:bg-gray-800 text-blue-600",
                  !isCompleted && !isCurrent && "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500",
                  isClickable && "hover:border-blue-500 cursor-pointer",
                  !isClickable && "cursor-not-allowed"
                )}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`ধাপ ${step.id}: ${step.title}`}
              >
                {isCompleted ? (
                  <span className="material-icons text-sm">check</span>
                ) : (
                  <span className="material-icons text-sm">{step.icon}</span>
                )}
              </button>

              {/* Step Content */}
              <div className="mt-3">
                <h3 
                  className={cn(
                    "text-sm font-medium transition-colors duration-300",
                    isCurrent && "text-blue-600",
                    isCompleted && "text-gray-900 dark:text-gray-100",
                    !isCompleted && !isCurrent && "text-gray-500 dark:text-gray-400"
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Keyboard Navigation Instructions */}
      <div className="sr-only" aria-live="polite">
        বর্তমান ধাপ: {currentStep} এর {steps.length}। {steps[currentStep - 1]?.title}
      </div>
    </div>
  );
}