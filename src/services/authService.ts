
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const authService = {
  signIn: async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      console.log('Sign in successful:', data);
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    }
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    try {
      console.log('Attempting to sign up with email:', email);

      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/reset`,
          data: metadata,
        },
      });

      if (error) {
        console.error('Sign up error:', error);
        return { data: null, error };
      }

      console.log('Sign up successful:', data);
      return { data, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  signOut: async () => {
    try {
      console.log('Attempting to sign out');

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      } else {
        console.log('Sign out successful');
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  signInWithGoogle: async () => {
    try {
      console.log('Attempting to sign in with Google');

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
        console.error('Google sign in error:', error);
        throw error;
      }

      console.log('Google sign in initiated successfully');
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) {
        console.error('Error deleting account:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  fetchProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  },
};
