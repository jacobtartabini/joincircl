
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthState, Profile } from '@/types/auth';
import { useToast } from '@/hooks/use-toast';
import { sanitizeInput, handleError } from '@/utils/security';

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
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Rate limiter for authentication attempts - only allow 5 attempts per minute
const authRateLimiter = new Map<string, { count: number, resetTime: number }>();
const MAX_AUTH_ATTEMPTS = 5;
const AUTH_WINDOW_MS = 60 * 1000; // 1 minute

// Helper to check rate limiting for auth attempts
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const rateLimit = authRateLimiter.get(identifier);
  
  if (!rateLimit) {
    // First attempt
    authRateLimiter.set(identifier, { count: 1, resetTime: now + AUTH_WINDOW_MS });
    return true;
  }
  
  if (now > rateLimit.resetTime) {
    // Reset time window has passed
    authRateLimiter.set(identifier, { count: 1, resetTime: now + AUTH_WINDOW_MS });
    return true;
  }
  
  if (rateLimit.count >= MAX_AUTH_ATTEMPTS) {
    // Too many attempts
    return false;
  }
  
  // Increment attempt count
  rateLimit.count += 1;
  authRateLimiter.set(identifier, rateLimit);
  return true;
}

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
          // Use setTimeout to prevent potential deadlock with Supabase client
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
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    
    // Check rate limiting
    if (!checkRateLimit(sanitizedEmail)) {
      toast({
        title: "Too many attempts",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw new Error("Too many sign in attempts");
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: handleError(error),
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
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    const sanitizedName = sanitizeInput(fullName.trim());
    
    // Check rate limiting
    if (!checkRateLimit(sanitizedEmail)) {
      toast({
        title: "Too many attempts",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw new Error("Too many sign up attempts");
    }
    
    try {
      const { error } = await supabase.auth.signUp({
        email: sanitizedEmail,
        password,
        options: {
          data: {
            full_name: sanitizedName,
          },
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: handleError(error),
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
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: handleError(error),
          variant: "destructive",
        });
        return;
      }
      
      // Clear any sensitive data from localStorage
      localStorage.removeItem('lastRoute');

      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: handleError(error),
        variant: "destructive",
      });
    }
  };

  const resetPassword = async (email: string) => {
    // Sanitize input
    const sanitizedEmail = sanitizeInput(email.trim().toLowerCase());
    
    // Check rate limiting
    if (!checkRateLimit(sanitizedEmail)) {
      toast({
        title: "Too many attempts",
        description: "Please try again later.",
        variant: "destructive",
      });
      throw new Error("Too many password reset attempts");
    }
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(sanitizedEmail, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        toast({
          title: "Password reset failed",
          description: handleError(error),
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
          description: handleError(error),
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
    
    // Sanitize text inputs
    const sanitizedUpdates = { ...updates };
    if (typeof sanitizedUpdates.full_name === 'string') {
      sanitizedUpdates.full_name = sanitizeInput(sanitizedUpdates.full_name);
    }
    if (typeof sanitizedUpdates.bio === 'string') {
      sanitizedUpdates.bio = sanitizeInput(sanitizedUpdates.bio);
    }
    if (typeof sanitizedUpdates.phone_number === 'string') {
      sanitizedUpdates.phone_number = sanitizeInput(sanitizedUpdates.phone_number);
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', authState.user.id);

      if (error) {
        toast({
          title: "Profile update failed",
          description: handleError(error),
          variant: "destructive",
        });
        throw error;
      }

      setProfile(prev => {
        if (!prev) return prev;
        return { ...prev, ...sanitizedUpdates };
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
  
  // Simple permission checking based on user role
  const hasPermission = (permission: string): boolean => {
    // For now, we don't have a formal role system
    // This is a placeholder for future role-based permission checks
    if (!authState.user) return false;
    
    // Basic admin check (could be expanded with a proper roles table)
    const isAdmin = authState.user.email === 'admin@example.com';
    
    switch (permission) {
      case 'contacts:create':
      case 'contacts:read':
      case 'contacts:update':
      case 'contacts:delete':
      case 'profile:read':
      case 'profile:update':
        // All authenticated users can do these operations
        return true;
      case 'users:admin':
        // Only admins can do these operations
        return isAdmin;
      default:
        return false;
    }
  };
  
  const deleteAccount = async () => {
    if (!authState.user?.id) return;
    
    try {
      // Delete user data in order (respecting foreign key constraints)
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
      
      // This would require admin privileges, which we don't have in the browser
      // We would need a secure backend/edge function to handle this
      // For now, showing an alternative approach of signing out
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Account deactivated",
        description: "Your account has been deactivated and you've been signed out.",
      });
    } catch (error: any) {
      console.error('Account deletion error:', error);
      
      toast({
        title: "Delete failed",
        description: handleError(error),
        variant: "destructive"
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
        hasPermission,
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
