
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { offlineStorage } from '@/services/offlineStorage';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  // Add missing properties
  deleteAccount: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(false);

  // Function to fetch and cache user profile
  const fetchAndCacheProfile = async (userId: string) => {
    try {
      // Try to get from offline storage first if not online
      if (!navigator.onLine) {
        const cachedProfile = await offlineStorage.profile.get(userId);
        if (cachedProfile) {
          setProfile(cachedProfile);
          setHasSeenTutorial(cachedProfile.has_seen_tutorial || false);
          console.log('Loaded profile from offline storage');
          return;
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        // Store profile in state
        setProfile(data);
        setHasSeenTutorial(data.has_seen_tutorial || false);
        
        // Cache profile for offline use
        await offlineStorage.profile.save(data);
      }
    } catch (error) {
      console.error('Error in fetchAndCacheProfile:', error);
    }
  };

  // Initial session check and auth subscription setup
  useEffect(() => {
    setLoading(true);
    
    // First, set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state change event:', event, Boolean(currentSession));
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Fetch profile with setTimeout to prevent auth deadlocks
        if (currentSession?.user?.id) {
          setTimeout(() => {
            fetchAndCacheProfile(currentSession.user.id);
          }, 0);
        }
      }
    );
    
    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Initial session check:', Boolean(currentSession));
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user?.id) {
        fetchAndCacheProfile(currentSession.user.id);
      }
      
      setLoading(false);
    });
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: { 
        data: metadata 
      } 
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error("User must be logged in");
    
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (error) throw error;
    
    // Update local state and cache
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      await offlineStorage.profile.save(updatedProfile);
    }
  };

  // Implement the missing methods
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const deleteAccount = async () => {
    if (!user) throw new Error("User must be logged in");
    
    try {
      // Delete profile
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      // Delete user auth account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      if (error) throw error;
      
      // Clear local state
      setProfile(null);
      setUser(null);
      setSession(null);
      
      // Remove from offline storage
      await offlineStorage.profile.delete(user.id);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const hasPermission = (permission: string) => {
    // For now, implement a simple permission check
    // This can be expanded later based on user roles or specific permissions
    if (!user) return false;
    
    // Basic implementation - return true for authenticated users
    // In real application, you would check against user's permissions in profile
    return true;
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signIn,
      signUp,
      signOut,
      updateProfile,
      // Add the missing properties
      deleteAccount,
      signInWithGoogle,
      hasPermission,
      hasSeenTutorial,
      setHasSeenTutorial,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
