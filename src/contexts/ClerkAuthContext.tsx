
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { Profile } from '@/types/auth';
import { offlineStorage } from '@/services/offlineStorage';

interface AuthContextProps {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any, data: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const ClerkAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut: clerkSignOut } = useClerkAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(false);

  // Function to cache profile image
  const cacheProfileImage = async (imageUrl: string, userId: string) => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        console.error('Failed to fetch profile image for caching');
        return;
      }
      
      const imageBlob = await response.blob();
      await offlineStorage.profileImage.save(userId, imageBlob);
      console.log('Profile image cached successfully');
    } catch (error) {
      console.error('Error caching profile image:', error);
    }
  };

  // Function to fetch and cache user profile
  const fetchAndCacheProfile = async (userId: string) => {
    try {
      // Try to get from offline storage first
      let cachedProfile: Profile | null = null;
      
      try {
        cachedProfile = await offlineStorage.profile.get(userId);
        
        if (cachedProfile) {
          console.log('Found profile in offline storage:', cachedProfile);
          setProfile(cachedProfile);
          setHasSeenTutorial(cachedProfile.has_seen_tutorial || false);
          
          if (cachedProfile.avatar_url) {
            if (navigator.onLine) {
              cacheProfileImage(cachedProfile.avatar_url, userId);
            }
          }
        }
      } catch (cacheError) {
        console.error('Error checking cache for profile:', cacheError);
      }
      
      // Create profile from Clerk user data
      if (clerkUser && navigator.onLine) {
        const clerkProfile: Profile = {
          id: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          full_name: clerkUser.fullName || '',
          avatar_url: clerkUser.imageUrl || '',
          has_seen_tutorial: cachedProfile?.has_seen_tutorial || false,
        };
        
        setProfile(clerkProfile);
        setHasSeenTutorial(clerkProfile.has_seen_tutorial || false);
        
        // Cache profile for offline use
        await offlineStorage.profile.save(clerkProfile);
        console.log('Updated profile cache with Clerk data');
        
        // Cache profile image if it exists
        if (clerkProfile.avatar_url) {
          cacheProfileImage(clerkProfile.avatar_url, userId);
        }
      }
    } catch (error) {
      console.error('Error in fetchAndCacheProfile:', error);
    }
  };

  useEffect(() => {
    if (isLoaded && clerkUser) {
      fetchAndCacheProfile(clerkUser.id);
    } else if (isLoaded && !clerkUser) {
      setProfile(null);
      setHasSeenTutorial(false);
    }
  }, [clerkUser, isLoaded]);

  // Auth methods - these will be handled by Clerk's components
  const signIn = async (email: string, password: string) => {
    // This will be handled by Clerk's SignIn component
    return { error: new Error("Use Clerk's SignIn component") };
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    // This will be handled by Clerk's SignUp component
    return { data: null, error: new Error("Use Clerk's SignUp component") };
  };

  const signOut = async () => {
    await clerkSignOut();
    setProfile(null);
    setHasSeenTutorial(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!clerkUser) throw new Error("User must be logged in");
    
    if (profile) {
      const updatedProfile = { ...profile, ...updates };
      setProfile(updatedProfile);
      
      if (updates.has_seen_tutorial !== undefined) {
        setHasSeenTutorial(updates.has_seen_tutorial);
      }
      
      await offlineStorage.profile.save(updatedProfile);
      
      if (updates.avatar_url && navigator.onLine) {
        cacheProfileImage(updates.avatar_url, clerkUser.id);
      }
    }
  };

  const signInWithGoogle = async () => {
    // This will be handled by Clerk's OAuth
    throw new Error("Use Clerk's OAuth components");
  };

  const deleteAccount = async () => {
    if (!clerkUser) throw new Error("User must be logged in");
    
    try {
      // Delete user through Clerk
      await clerkUser.delete();
      
      // Clear local state
      setProfile(null);
      setHasSeenTutorial(false);
      
      // Remove from offline storage
      await offlineStorage.profile.delete(clerkUser.id);
      await offlineStorage.profileImage.delete(clerkUser.id);
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  const hasPermission = (permission: string) => {
    if (!clerkUser) return false;
    return true; // Basic implementation
  };

  return (
    <AuthContext.Provider value={{
      user: clerkUser,
      session: null, // Clerk handles sessions internally
      profile,
      loading: !isLoaded,
      signIn,
      signUp,
      signOut,
      updateProfile,
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
    throw new Error('useAuth must be used within a ClerkAuthProvider');
  }
  return context;
};
