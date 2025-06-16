
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const UserOnboarding = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if user needs onboarding and redirect to dedicated page
    if (user && profile) {
      const hasCompletedOnboarding = profile.onboarding_completed;
      const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
      
      // Redirect to onboarding page if not completed and not seen before
      if (!hasCompletedOnboarding && !hasSeenOnboarding) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [user, profile, navigate]);
  
  // This component no longer renders anything - onboarding is handled by the route
  return null;
};

export default UserOnboarding;
