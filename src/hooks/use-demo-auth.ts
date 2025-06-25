
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDemoAuth } from '@/contexts/DemoAuthContext';

export const useDemoOrRealAuth = () => {
  const location = useLocation();
  const isDemo = location.pathname.startsWith('/demo');
  
  if (isDemo) {
    try {
      const demoAuth = useDemoAuth();
      console.log('[Demo] Using demo auth:', demoAuth?.user?.email);
      return demoAuth;
    } catch (error) {
      console.error('[Demo] Failed to get demo auth context:', error);
      // Return a fallback demo auth object
      return {
        user: {
          id: 'demo-user-1',
          email: 'demo@circl.com',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: { full_name: 'Demo User' },
          identities: [],
          factors: []
        },
        session: null,
        profile: {
          id: 'demo-user-1',
          email: 'demo@circl.com',
          full_name: 'Demo User',
          avatar_url: null,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          has_seen_tutorial: true,
          onboarding_completed: true,
          onboarding_completed_at: '2024-01-01T00:00:00Z',
          onboarding_step_completed: {},
          first_name: 'Demo',
          last_name: 'User',
          phone_number: null,
          location: null,
          company_name: null,
          job_title: null,
          bio: null,
          role: null,
          how_heard_about_us: null,
          goals: null,
          additional_notes: null
        },
        loading: false,
        signIn: async () => ({ error: null }),
        signInWithMagicLink: async () => ({ error: null }),
        signUp: async () => ({ data: null, error: null }),
        signOut: async () => {},
        updateProfile: async () => {},
        deleteAccount: async () => {},
        signInWithGoogle: async () => {},
        signInWithLinkedIn: async () => {},
        hasPermission: () => true,
        hasSeenTutorial: true,
        setHasSeenTutorial: () => {},
        setProfile: () => {}
      };
    }
  } else {
    try {
      const realAuth = useAuth();
      console.log('[Auth] Using real auth:', realAuth?.user?.email);
      return realAuth;
    } catch (error) {
      console.error('[Auth] Failed to get real auth context:', error);
      return { user: null, loading: false };
    }
  }
};
