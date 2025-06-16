
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
import IntegrationSetupStep from './IntegrationSetupStep';
import AppTutorialStep from './AppTutorialStep';
import CompletionStep from './CompletionStep';
import { useOnboardingState } from '@/hooks/useOnboardingState';

interface FullScreenOnboardingProps {
  onComplete: () => void;
}

export default function FullScreenOnboarding({ onComplete }: FullScreenOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const { onboardingState, completeStep, skipStep, completeOnboarding, getProgress, isStepAccessible } = useOnboardingState();

  const steps = [1, 2, 3, 4, 5];
  const stepLabels = ['Profile', 'Contacts', 'Integrations', 'Tutorial', 'Complete'];
  const stepNames = ['profile', 'contacts', 'integrations', 'tutorial', 'completion'] as const;

  const handleStepComplete = async (data?: any) => {
    const stepName = stepNames[currentStep - 1];
    const success = await completeStep(stepName, data);
    
    if (success) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await completeOnboarding();
        onComplete();
      }
    }
  };

  const handleSkipStep = async () => {
    const stepName = stepNames[currentStep - 1];
    const success = await skipStep(stepName);
    
    if (success) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        await completeOnboarding();
        onComplete();
      }
    }
  };

  const handleComplete = async () => {
    await completeOnboarding();
    onComplete();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <ProfileSetupStep onNext={handleStepComplete} onSkip={handleSkipStep} />;
      case 2:
        return <ContactImportStep onNext={handleStepComplete} onSkip={handleSkipStep} />;
      case 3:
        return <IntegrationSetupStep onNext={handleStepComplete} onSkip={handleSkipStep} />;
      case 4:
        return <AppTutorialStep onNext={handleStepComplete} onSkip={handleSkipStep} />;
      case 5:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return <ProfileSetupStep onNext={handleStepComplete} onSkip={handleSkipStep} />;
    }
  };

  // Check if step is completed
  const isStepCompleted = (stepIndex: number) => {
    const stepName = stepNames[stepIndex - 1];
    return onboardingState[stepName]?.completed || onboardingState[stepName]?.skipped;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-background via-muted/20 to-background overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header with logo and progress - Fixed at top */}
        <div className="flex-shrink-0 glass-nav border-b border-white/10">
          <div className="flex justify-between items-center px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="font-bold text-xl text-foreground">Circl</span>
            </div>
            
            <div className="glass-card px-3 py-1.5">
              <div className="text-sm font-medium text-foreground">
                {getProgress()}% Complete
              </div>
            </div>
          </div>
        </div>

        {/* Main scrollable content area */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            {renderCurrentStep()}
          </div>
        </div>

        {/* Bottom stepper - Fixed at bottom */}
        <div className="flex-shrink-0 glass-nav border-t border-white/10 p-4">
          <div className="max-w-md mx-auto">
            <Stepper value={currentStep} className="w-full">
              {steps.map((step, index) => (
                <StepperItem 
                  key={step} 
                  step={step} 
                  completed={isStepCompleted(step)}
                  disabled={!isStepAccessible(index)}
                  className="[&:not(:last-child)]:flex-1"
                >
                  <StepperTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <StepperIndicator className="size-3 data-[state=active]:border-2 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=completed]:bg-primary data-[state=completed]:text-primary-foreground [&_span]:sr-only [&_svg]:size-2" />
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
