
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FullScreenOnboarding from '@/components/onboarding/FullScreenOnboarding';

export default function OnboardingPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate('/', { replace: true });
  };

  return <FullScreenOnboarding onComplete={handleComplete} />;
}
