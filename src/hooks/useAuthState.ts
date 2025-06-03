
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

  const fetchAndCacheProfile = async (userId: string) => {
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
            await offlineStorage.profile.save(userId, data);
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
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
        }

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event, newSession?.user?.id);

        if (mounted) {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user && event === 'SIGNED_IN') {
            setTimeout(() => {
              fetchAndCacheProfile(newSession.user.id);
            }, 100);
          } else if (event === 'SIGNED_OUT') {
            setProfile(null);
            setHasSeenTutorial(false);
          }

          if (!loading) {
            setLoading(false);
          }
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
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
