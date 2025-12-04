'use client';

import { useWizard } from './WizardProvider';
import { Button } from '@/components/ui/button';

export function WizardNavigation() {
  const { state, nextStep, prevStep, canGoNext, canGoPrev } = useWizard();

  // Don't show navigation on the final step (OutputStep has its own "Start Over" button)
  if (state.currentStep === 6) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <Button
        onClick={prevStep}
        variant="outline"
        disabled={!canGoPrev}
        className="min-w-[100px]"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back
      </Button>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {state.currentStep < 6 && (
          <>
            {!canGoNext && state.currentStep === 1 && (
              <span>Record or upload audio to continue</span>
            )}
            {!canGoNext && state.currentStep === 2 && state.isTranscribing && (
              <span>Transcribing...</span>
            )}
            {!canGoNext && state.currentStep === 3 && state.isGenerating && (
              <span>Generating post...</span>
            )}
            {!canGoNext && state.currentStep === 5 && state.isGeneratingImage && (
              <span>Generating image...</span>
            )}
          </>
        )}
      </div>

      <Button
        onClick={nextStep}
        disabled={!canGoNext}
        className="min-w-[100px]"
      >
        {state.currentStep === 5 ? 'Finish' : 'Next'}
        <svg
          className="w-4 h-4 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Button>
    </div>
  );
}
