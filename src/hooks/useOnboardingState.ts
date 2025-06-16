
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface OnboardingStepState {
  completed: boolean;
  skipped: boolean;
  data?: any;
}

export interface OnboardingState {
  profile: OnboardingStepState;
  contacts: OnboardingStepState;
  integrations: OnboardingStepState;
  tutorial: OnboardingStepState;
  completion: OnboardingStepState;
}

const defaultOnboardingState: OnboardingState = {
  profile: { completed: false, skipped: false },
  contacts: { completed: false, skipped: false },
  integrations: { completed: false, skipped: false },
  tutorial: { completed: false, skipped: false },
  completion: { completed: false, skipped: false },
};

export function useOnboardingState() {
  const { user, profile, setProfile } = useAuth();
  const { toast } = useToast();
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(defaultOnboardingState);
  const [loading, setLoading] = useState(true);

  // Load onboarding state from profile
  useEffect(() => {
    if (profile) {
      try {
        const savedState = profile.onboarding_step_completed 
          ? (typeof profile.onboarding_step_completed === 'string' 
              ? JSON.parse(profile.onboarding_step_completed) 
              : profile.onboarding_step_completed)
          : defaultOnboardingState;
        
        setOnboardingState({ ...defaultOnboardingState, ...savedState });
      } catch (error) {
        console.error('Error parsing onboarding state:', error);
        setOnboardingState(defaultOnboardingState);
      }
      setLoading(false);
    }
  }, [profile]);

  // Save onboarding state to database
  const saveOnboardingState = async (newState: OnboardingState) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_step_completed: JSON.stringify(newState),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving onboarding state:', error);
        toast({
          title: 'Error saving progress',
          description: 'Your progress could not be saved. Please try again.',
          variant: 'destructive',
        });
        return false;
      }

      setOnboardingState(newState);
      
      // Update profile context
      if (setProfile && profile) {
        setProfile({
          ...profile,
          onboarding_step_completed: JSON.stringify(newState),
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      return false;
    }
  };

  // Complete a specific step
  const completeStep = async (stepName: keyof OnboardingState, data?: any) => {
    const newState = {
      ...onboardingState,
      [stepName]: {
        completed: true,
        skipped: false,
        data,
      },
    };
    return await saveOnboardingState(newState);
  };

  // Skip a specific step
  const skipStep = async (stepName: keyof OnboardingState) => {
    const newState = {
      ...onboardingState,
      [stepName]: {
        completed: false,
        skipped: true,
      },
    };
    return await saveOnboardingState(newState);
  };

  // Mark entire onboarding as completed
  const completeOnboarding = async () => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error completing onboarding:', error);
        return false;
      }

      // Update profile context
      if (setProfile && profile) {
        setProfile({
          ...profile,
          onboarding_completed: true,
        });
      }

      return true;
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return false;
    }
  };

  // Get completion progress
  const getProgress = () => {
    const steps = Object.values(onboardingState);
    const completedSteps = steps.filter(step => step.completed || step.skipped).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  // Check if step is accessible (previous steps completed)
  const isStepAccessible = (stepIndex: number) => {
    const stepNames = Object.keys(onboardingState) as (keyof OnboardingState)[];
    for (let i = 0; i < stepIndex; i++) {
      const step = onboardingState[stepNames[i]];
      if (!step.completed && !step.skipped) {
        return false;
      }
    }
    return true;
  };

  return {
    onboardingState,
    loading,
    completeStep,
    skipStep,
    completeOnboarding,
    getProgress,
    isStepAccessible,
    isOnboardingCompleted: profile?.onboarding_completed || false,
  };
}
