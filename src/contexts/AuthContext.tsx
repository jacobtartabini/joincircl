
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
    console.log('AuthContext: signIn called');
    setLoading(true);
    try {
      const result = await authService.signIn(email, password);
      console.log('AuthContext: signIn result:', result);
      return result;
    } catch (error) {
      console.error('AuthContext: signIn error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    console.log('AuthContext: signUp called');
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, fullName);
      console.log('AuthContext: signUp result:', result);
      return result;
    } catch (error) {
      console.error('AuthContext: signUp error:', error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('AuthContext: signOut called');
    setLoading(true);
    try {
      await authService.signOut();
    } catch (error) {
      console.error('AuthContext: signOut error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    console.log('AuthContext: signInWithGoogle called');
    setLoading(true);
    try {
      await authService.signInWithGoogle();
      // Don't set loading to false here as the redirect will happen
    } catch (error) {
      console.error('AuthContext: signInWithGoogle error:', error);
      setLoading(false);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<typeof profile>) => {
    if (!user) {
      console.warn('AuthContext: updateProfile called without user');
      return;
    }

    try {
      await authService.updateProfile(user.id, updates);
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
    } catch (error) {
      console.error('AuthContext: updateProfile error:', error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      console.warn('AuthContext: deleteAccount called without user');
      return;
    }
    
    try {
      await authService.deleteAccount();
    } catch (error) {
      console.error('AuthContext: deleteAccount error:', error);
      throw error;
    }
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
