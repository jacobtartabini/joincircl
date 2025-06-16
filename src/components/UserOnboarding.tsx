
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FullScreenOnboarding from './onboarding/FullScreenOnboarding';

export const UserOnboarding = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Check if user needs onboarding
    if (user && profile) {
      const hasCompletedOnboarding = profile.onboarding_completed;
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      
      // Show onboarding if not completed and not seen before
      if (!hasCompletedOnboarding && !hasSeenOnboarding) {
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 1000); // Reduced delay for better UX
        
        return () => clearTimeout(timer);
      }
    }
  }, [user, profile]);
  
  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen || !user) {
    return null;
  }
  
  return <FullScreenOnboarding onComplete={handleComplete} />;
};

export default UserOnboarding;
