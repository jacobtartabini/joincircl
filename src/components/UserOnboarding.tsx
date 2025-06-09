
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import FullScreenOnboarding from './onboarding/FullScreenOnboarding';

// Named export for consistency
export const UserOnboarding = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Check if this is the user's first visit
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    
    if (user && !hasSeenOnboarding) {
      // Delay showing the onboarding flow to prevent it from showing immediately on login
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  const handleComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setIsOpen(false);
  };

  if (!isOpen) {
    return null;
  }
  
  return <FullScreenOnboarding onComplete={handleComplete} />;
};

// Add default export as well for backward compatibility
export default UserOnboarding;
