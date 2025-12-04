'use client';

import { useWizard } from './WizardProvider';
import { STEP_LABELS, WizardStep } from '@/types/wizard';
import { cn } from '@/lib/utils';

export function WizardStepper() {
  const { state, goToStep } = useWizard();
  const steps = [1, 2, 3, 4, 5, 6] as WizardStep[];

  const canNavigateToStep = (step: WizardStep): boolean => {
    // Can always go to current or previous steps
    if (step <= state.currentStep) return true;

    // Can't skip ahead
    return false;
  };

  return (
    <div className="w-full">
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center flex-1">
            <button
              onClick={() => canNavigateToStep(step) && goToStep(step)}
              disabled={!canNavigateToStep(step)}
              className={cn(
                'flex items-center gap-2 group',
                canNavigateToStep(step) ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  step === state.currentStep
                    ? 'bg-primary text-primary-foreground'
                    : step < state.currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {step < state.currentStep ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  step === state.currentStep
                    ? 'text-foreground'
                    : step < state.currentStep
                    ? 'text-muted-foreground'
                    : 'text-muted-foreground/50'
                )}
              >
                {STEP_LABELS[step]}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  step < state.currentStep ? 'bg-primary' : 'bg-muted'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Step {state.currentStep} of 6
          </span>
          <span className="text-sm text-muted-foreground">
            {STEP_LABELS[state.currentStep]}
          </span>
        </div>
        <div className="flex gap-1">
          {steps.map((step) => (
            <div
              key={step}
              className={cn(
                'flex-1 h-2 rounded-full',
                step <= state.currentStep ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
