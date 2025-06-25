
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextProps } from '@/types/auth';

const DemoAuthContext = createContext<AuthContextProps | undefined>(undefined);

interface DemoAuthProviderProps {
  children: ReactNode;
}

export const DemoAuthProvider: React.FC<DemoAuthProviderProps> = ({ children }) => {
  // Mock demo user with all required Supabase User properties
  const demoUser = {
    id: 'demo-user-1',
    email: 'demo@circl.com',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    aud: 'authenticated',
    role: 'authenticated',
    app_metadata: {},
    user_metadata: {
      full_name: 'Demo User'
    },
    identities: [],
    factors: []
  };

  const demoSession = {
    user: demoUser,
    access_token: 'demo-token',
    refresh_token: 'demo-refresh',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer'
  };

  const demoProfile = {
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
  };

  const contextValue: AuthContextProps = {
    user: demoUser,
    session: demoSession,
    profile: demoProfile,
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

  return (
    <DemoAuthContext.Provider value={contextValue}>
      {children}
    </DemoAuthContext.Provider>
  );
};

export const useDemoAuth = () => {
  const context = useContext(DemoAuthContext);
  if (!context) {
    throw new Error('useDemoAuth must be used within a DemoAuthProvider');
  }
  return context;
};
