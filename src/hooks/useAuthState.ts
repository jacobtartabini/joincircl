import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { offlineStorage } from '@/services/offlineStorage';
import { authService } from '@/services/authService';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasSeenTutorial, setHasSeenTutorial] = useState<boolean>(false);

  const fetchAndCacheProfile = async (userId: string): Promise<void> => {
    try {
      let cachedProfile: Profile | null = null;

      try {
        cachedProfile = await offlineStorage.profile.get(userId);
        if (cachedProfile) {
          setProfile(cachedProfile);
          setHasSeenTutorial(cachedProfile.has_seen_tutorial || false);
        }
      } catch (cacheError) {
        console.error('Error checking cache for profile:', cacheError);
      }

      if (navigator.onLine) {
        const data = await authService.fetchProfile(userId);

        if (data) {
          setProfile(data);
          setHasSeenTutorial(data.has_seen_tutorial || false);

          try {
            await offlineStorage.profile.save(data);
          } catch (cacheError) {
            console.error('Error caching profile:', cacheError);
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchAndCacheProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth state...');
        
        if (typeof window !== 'undefined') {
          try {
            const storedSession = localStorage.getItem('supabase.auth.token');
            if (storedSession) {
              const parsedSession = JSON.parse(storedSession);
              console.log('Found stored session:', !!parsedSession);
            }
          } catch (error) {
            console.warn('Error checking stored session:', error);
          }
        }
        
        const {
          data: { session: initialSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
          return;
        }

        console.log('Initial session found:', !!initialSession);

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            console.log('Fetching profile for user:', initialSession.user.id);
            await fetchAndCacheProfile(initialSession.user.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);

        if (!mounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (event === 'SIGNED_IN' && newSession?.user) {
          console.log('User signed in, fetching profile...');
          
          if (typeof window !== 'undefined' && newSession) {
            try {
              localStorage.setItem('supabase.auth.token', JSON.stringify(newSession));
            } catch (error) {
              console.warn('Failed to store session:', error);
            }
          }
          
          setTimeout(() => {
            if (mounted) {
              fetchAndCacheProfile(newSession.user.id);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing state...');
          setProfile(null);
          setHasSeenTutorial(false);
          
          if (typeof window !== 'undefined') {
            try {
              localStorage.removeItem('supabase.auth.token');
            } catch (error) {
              console.warn('Failed to clear stored session:', error);
            }
          }
        } else if (event === 'TOKEN_REFRESHED' && newSession?.user) {
          console.log('Token refreshed for user:', newSession.user.id);
          
          if (typeof window !== 'undefined' && newSession) {
            try {
              localStorage.setItem('supabase.auth.token', JSON.stringify(newSession));
            } catch (error) {
              console.warn('Failed to update stored session:', error);
            }
          }
        }

        if (mounted) {
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      console.log('Cleaning up auth state listener...');
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    session,
    profile,
    loading,
    hasSeenTutorial,
    setUser,
    setSession,
    setProfile,
    setLoading,
    setHasSeenTutorial,
    fetchAndCacheProfile,
  };
};
