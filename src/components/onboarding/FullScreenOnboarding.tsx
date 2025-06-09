
import { useState } from 'react';
import { 
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperSeparator,
  StepperTrigger,
} from '@/components/ui/stepper';
import ProfileSetupStep from './ProfileSetupStep';
import ContactImportStep from './ContactImportStep';
import FeatureTourStep from './FeatureTourStep';
import CompletionStep from './CompletionStep';

interface FullScreenOnboardingProps {
  onComplete: () => void;
}

export default function FullScreenOnboarding({ onComplete }: FullScreenOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [1, 2, 3, 4];
  const stepLabels = ['Profile', 'Contacts', 'Features', 'Complete'];

  const handleStepComplete = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleSkipStep = () => {
    handleStepComplete();
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileSetupStep onNext={handleStepComplete} />;
      case 2:
        return <ContactImportStep onNext={handleStepComplete} onSkip={handleSkipStep} />;
      case 3:
        return <FeatureTourStep onNext={handleStepComplete} />;
      case 4:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return <ProfileSetupStep onNext={handleStepComplete} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
      <div className="min-h-screen flex flex-col">
        {/* Header with logo */}
        <div className="flex justify-center pt-8 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-2xl text-foreground">Circl</span>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex items-center justify-center px-4 py-8">
          {renderCurrentStep()}
        </div>

        {/* Bottom stepper */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 p-6">
          <div className="max-w-md mx-auto">
            <Stepper value={currentStep} className="w-full">
              {steps.map((step, index) => (
                <StepperItem 
                  key={step} 
                  step={step} 
                  completed={step < currentStep}
                  className="[&:not(:last-child)]:flex-1"
                >
                  <StepperTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <StepperIndicator className="size-8 data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground [&_span]:text-xs" />
                      <span className="text-xs font-medium text-muted-foreground">
                        {stepLabels[index]}
                      </span>
                    </div>
                  </StepperTrigger>
                  {step < steps.length && <StepperSeparator className="mt-4" />}
                </StepperItem>
              ))}
            </Stepper>
          </div>
        </div>
      </div>
    </div>
  );
}
