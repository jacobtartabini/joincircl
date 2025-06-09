
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Stepper, 
  StepperItem, 
  StepperIndicator, 
  StepperSeparator 
} from '@/components/ui/stepper';
import ProfileSetupStep from './ProfileSetupStep';
import SurveyStep from './SurveyStep';
import ContactImportStep from './ContactImportStep';
import FeatureTourStep from './FeatureTourStep';
import CompletionStep from './CompletionStep';

interface FullScreenOnboardingProps {
  onComplete: () => void;
}

export default function FullScreenOnboarding({ onComplete }: FullScreenOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { updateProfile } = useAuth();

  const steps = [
    { id: 'profile', title: 'Profile Setup' },
    { id: 'survey', title: 'Survey' },
    { id: 'contacts', title: 'Import Contacts' },
    { id: 'features', title: 'Feature Tour' },
    { id: 'completion', title: 'Complete' },
  ];

  const handleNext = () => {
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handleComplete = async () => {
    try {
      await updateProfile({ onboarding_completed: true });
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <ProfileSetupStep onNext={handleNext} />;
      case 1:
        return <SurveyStep onNext={handleNext} />;
      case 2:
        return <ContactImportStep onNext={handleNext} onSkip={handleNext} />;
      case 3:
        return <FeatureTourStep onNext={handleNext} />;
      case 4:
        return <CompletionStep onComplete={handleComplete} />;
      default:
        return <ProfileSetupStep onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Progress Stepper */}
      <div className="w-full py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <Stepper value={currentStep} className="w-full">
            {steps.map((step, index) => (
              <StepperItem
                key={step.id}
                step={index + 1}
                completed={index < currentStep}
                className="flex-1"
              >
                <StepperIndicator />
                {index < steps.length - 1 && <StepperSeparator />}
              </StepperItem>
            ))}
          </Stepper>
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        {renderStep()}
      </div>
    </div>
  );
}
