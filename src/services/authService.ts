
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const authService = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signInWithMagicLink: async (email: string) => {
    return await supabase.auth.signInWithOtp({ email });
  },

  signUp: async (email: string, password: string, fullName?: string) => {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  fetchProfile: async (userId: string): Promise<Profile | null> => {
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
  },

  updateProfile: async (userId: string, updates: Partial<Profile>) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) {
      throw error;
    }
  },

  deleteAccount: async () => {
    // This would need to be implemented as an edge function
    throw new Error('Delete account functionality not implemented');
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
  },

  signInWithLinkedIn: async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'linkedin_oidc',
    });
  },
};
