'use client';

import { useWizard } from './components/WizardProvider';
import { WizardStepper } from './components/WizardStepper';
import { WizardNavigation } from './components/WizardNavigation';
import { VoiceStep } from './components/steps/VoiceStep';
import { TranscribeStep } from './components/steps/TranscribeStep';
import { GenerateStep } from './components/steps/GenerateStep';
import { EditStep } from './components/steps/EditStep';
import { ImageStep } from './components/steps/ImageStep';
import { OutputStep } from './components/steps/OutputStep';
import { Card, CardContent } from '@/components/ui/card';

export default function CreatePage() {
  const { state } = useWizard();

  const renderStep = () => {
    switch (state.currentStep) {
      case 1:
        return <VoiceStep />;
      case 2:
        return <TranscribeStep />;
      case 3:
        return <GenerateStep />;
      case 4:
        return <EditStep />;
      case 5:
        return <ImageStep />;
      case 6:
        return <OutputStep />;
      default:
        return <VoiceStep />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Stepper */}
      <WizardStepper />

      {/* Step Content */}
      <Card>
        <CardContent className="pt-6">
          {renderStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <WizardNavigation />
    </div>
  );
}
