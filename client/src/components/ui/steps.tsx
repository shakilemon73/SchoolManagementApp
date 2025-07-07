import React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

interface StepsProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function Steps({ steps, currentStep, className }: StepsProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isActive = currentStep >= index;
          const isComplete = currentStep > index;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center relative z-10">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full mb-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                    isComplete && "bg-success"
                  )}
                >
                  {isComplete ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>
                <div
                  className={cn(
                    "text-xs text-center max-w-[80px]",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {step}
                </div>
              </div>

              {/* Connector line between steps */}
              {!isLast && (
                <div
                  className={cn(
                    "absolute h-[2px] top-5 -translate-y-1/2",
                    isActive && currentStep > index
                      ? "bg-primary"
                      : "bg-muted",
                    index === 0
                      ? "left-[calc(0%+20px)] right-[calc(50%-20px)]"
                      : index === steps.length - 2
                      ? "left-[calc(50%-20px)] right-[calc(0%+20px)]"
                      : `left-[calc(${(index * 100) / (steps.length - 1)}%-20px)] right-[calc(${
                          100 - ((index + 1) * 100) / (steps.length - 1)
                        }%-20px)]`
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}