
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, Profile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  profile: Profile | null;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (value: boolean) => void;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
  });
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change event:', event, !!session);
        setAuthState(prev => ({
          ...prev,
          session: session,
          user: session?.user ?? null,
        }));
        
        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', !!session);
      setAuthState({
        session: session,
        user: session?.user ?? null,
        loading: false,
      });
      
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
      
      if (data?.has_seen_tutorial) {
        setHasSeenTutorial(true);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Signed out",
      description: "You've been successfully signed out.",
    });
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      toast({
        title: "Password reset email sent",
        description: "Please check your email for the password reset link.",
      });
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', authState.user.id);

      if (error) {
        toast({
          title: "Profile update failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, ...updates };
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      throw error;
    }
  };
  
  const deleteAccount = async () => {
    if (!authState.user?.id) return;
    
    try {
      await supabase
        .from('contacts')
        .delete()
        .eq('user_id', authState.user.id);
        
      await supabase
        .from('interactions')
        .delete()
        .eq('user_id', authState.user.id);
        
      await supabase
        .from('keystones')
        .delete()
        .eq('user_id', authState.user.id);
      
      const { error } = await supabase.auth.admin.deleteUser(
        authState.user.id
      );

      if (error) {
        toast({
          title: "Account deletion failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      toast({
        title: "Account deletion failed",
        description: "There was an error deleting your account. Please contact support.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signUp,
        signOut,
        resetPassword,
        signInWithGoogle,
        profile,
        updateProfile,
        hasSeenTutorial,
        setHasSeenTutorial,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
