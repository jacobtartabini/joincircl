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
      // Try to get from offline storage first
      let cachedProfile: Profile | null = null;
      
      try {
        cachedProfile = await offlineStorage.profile.get(userId);
        
        // If we have a cached profile, use it immediately while we fetch the latest
        if (cachedProfile) {
          console.log('Found profile in offline storage:', cachedProfile);
          setProfile(cachedProfile);
          setHasSeenTutorial(cachedProfile.has_seen_tutorial || false);
        }
      } catch (cacheError) {
        console.error('Error checking cache for profile:', cacheError);
      }
      
      // If online, fetch the latest profile from the server
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          console.error('Error fetching profile:', error);
          // If we failed to fetch but have a cached version, don't throw
          if (cachedProfile) return;
          throw error;
        }
        
        if (data) {
          // Store profile in state
          setProfile(data);
          setHasSeenTutorial(data.has_seen_tutorial || false);
          
          // Cache profile for offline use
          await offlineStorage.profile.save(data);
          console.log('Updated profile cache with latest data');
        }
      } else {
        // If offline and we found a cached profile earlier, we're good
        // If not, show an error
        if (!cachedProfile) {
          console.error('No cached profile available while offline');
        }
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

  // Update the profile when hasSeenTutorial changes
  useEffect(() => {
    if (profile && profile.has_seen_tutorial !== hasSeenTutorial) {
      updateProfile({ has_seen_tutorial: hasSeenTutorial })
        .catch(error => console.error('Error updating tutorial status:', error));
    }
  }, [hasSeenTutorial]);

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
    
    // First update local state
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      // If has_seen_tutorial is being updated, also update the local state
      if (updates.has_seen_tutorial !== undefined) {
        setHasSeenTutorial(updates.has_seen_tutorial);
      }
      
      // Cache the updated profile
      await offlineStorage.profile.save(updatedProfile);
    }
    
    // Then if online, update the database
    if (navigator.onLine) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', user.id);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error updating profile in database:', error);
        // Queue for sync when back online
        if (profile) {
          await offlineStorage.sync.queue('update', 'profiles', { 
            id: user.id, 
            ...updates 
          });
        }
      }
    } else {
      // If offline, queue for sync
      if (profile) {
        await offlineStorage.sync.queue('update', 'profiles', { 
          id: user.id, 
          ...updates 
        });
      }
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
