
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import FullScreenOnboarding from '@/components/onboarding/FullScreenOnboarding';

const OnboardingPage = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to home if onboarding is already completed
  if (profile?.onboarding_completed) {
    return <Navigate to="/" replace />;
  }

  const handleComplete = () => {
    // The onboarding completion will be handled by the FullScreenOnboarding component
    // which will update the profile and trigger a redirect
    window.location.href = '/';
  };

  return <FullScreenOnboarding onComplete={handleComplete} />;
};

export default OnboardingPage;
