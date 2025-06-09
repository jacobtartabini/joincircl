
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, Profile } from '@/types/auth';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const profileData = await authService.fetchProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        authService.fetchProfile(session.user.id).then(setProfile);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    return authService.signIn(email, password);
  };

  const signInWithMagicLink = async (email: string) => {
    return authService.signInWithMagicLink(email);
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    return authService.signUp(email, password, fullName);
  };

  const signOut = async () => {
    await authService.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user found');
    await authService.updateProfile(user.id, updates);
    
    // Refresh profile data
    const updatedProfile = await authService.fetchProfile(user.id);
    setProfile(updatedProfile);
  };

  const deleteAccount = async () => {
    await authService.deleteAccount();
  };

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signInWithLinkedIn = async () => {
    await authService.signInWithLinkedIn();
  };

  const hasPermission = (permission: string) => {
    // Basic permission check - can be extended
    return true;
  };

  const value: AuthContextProps = {
    user,
    session,
    profile,
    loading,
    signIn,
    signInWithMagicLink,
    signUp,
    signOut,
    updateProfile,
    deleteAccount,
    signInWithGoogle,
    signInWithLinkedIn,
    hasPermission,
    hasSeenTutorial,
    setHasSeenTutorial,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
