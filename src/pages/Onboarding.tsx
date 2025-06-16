
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import FullScreenOnboarding from '@/components/onboarding/FullScreenOnboarding';

export default function Onboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!user) {
      navigate('/signin', { replace: true });
      return;
    }

    // Redirect to home if onboarding already completed
    if (profile?.onboarding_completed) {
      navigate('/', { replace: true });
      return;
    }
  }, [user, profile, navigate]);

  const handleComplete = () => {
    // Clear any localStorage flags and redirect to home
    localStorage.setItem('hasSeenOnboarding', 'true');
    navigate('/', { replace: true });
  };

  // Don't render anything while checking auth state
  if (!user || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if onboarding is already completed
  if (profile.onboarding_completed) {
    return null;
  }

  return <FullScreenOnboarding onComplete={handleComplete} />;
}
