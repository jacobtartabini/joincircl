
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

export const useDemoOrRealAuth = () => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  const useRealAuth = import.meta.env.VITE_USE_REAL_AUTH === 'true';
  
  if (isDemo && !useRealAuth) {
    // Use demo auth for demo routes unless explicitly configured to use real auth
    return useDemoAuth();
  } else {
    // Use real auth for non-demo routes or when VITE_USE_REAL_AUTH is true
    try {
      const realAuth = useAuth();
      return realAuth;
    } catch (error) {
      console.error('[Auth] Failed to get real auth context:', error);
      // Fallback to demo auth if real auth fails
      if (isDemo) {
        console.warn('[Auth] Falling back to demo auth');
        return useDemoAuth();
      }
      // For non-demo routes, return minimal auth state to prevent crashes
      return { 
        user: null, 
        loading: false,
        session: null,
        profile: null,
        signIn: async () => ({ error: null }),
        signInWithMagicLink: async () => ({ error: null }),
        signUp: async () => ({ data: null, error: null }),
        signOut: async () => {},
        updateProfile: async () => {},
        deleteAccount: async () => {},
        signInWithGoogle: async () => {},
        signInWithLinkedIn: async () => {},
        hasPermission: () => false,
        hasSeenTutorial: false,
        setHasSeenTutorial: () => {},
        setProfile: () => {}
      };
    }
  }
};
