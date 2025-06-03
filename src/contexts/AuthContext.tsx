
import React, { createContext, useContext } from 'react';
import { AuthContextProps } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { authService } from '@/services/authService';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    session,
    profile,
    loading,
    hasSeenTutorial,
    setProfile,
    setLoading,
    setHasSeenTutorial,
  } = useAuthState();

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await authService.signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    setLoading(true);
    try {
      return await authService.signUp(email, password, metadata);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await authService.signOut();
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await authService.signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<typeof profile>) => {
    if (!user) return;

    await authService.updateProfile(user.id, updates);
    setProfile(prev => (prev ? { ...prev, ...updates } : null));
  };

  const deleteAccount = async () => {
    if (!user) return;
    await authService.deleteAccount();
  };

  const hasPermission = (permission: string) => {
    return !!user; // Modify as needed for more granular permission logic
  };

  const contextValue: AuthContextProps = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    deleteAccount,
    signInWithGoogle,
    hasPermission,
    hasSeenTutorial,
    setHasSeenTutorial,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
