
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Keystone } from '@/types/keystone';

export function useKeystones() {
  const { user, loading: isAuthLoading } = useAuth();

  console.log("[useKeystones] Hook called - Auth loading:", isAuthLoading, "User:", user?.id);

  const {
    data: keystones = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['keystones', user?.id],
    queryFn: async () => {
      console.log("[useKeystones] QueryFn called - Auth loading:", isAuthLoading, "User:", user?.id);
      
      if (isAuthLoading) {
        console.log("[useKeystones] Auth is STILL loading, returning []");
        return [];
      }
      if (!user?.id) {
        console.log("[useKeystones] No user.id in queryFn, returning []");
        return [];
      }

      console.log("[useKeystones] Fetching keystones for user.id:", user.id);
      const { data, error } = await supabase
        .from('keystones')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('[useKeystones] Error fetching keystones:', error);
        throw error;
      }

      console.log("[useKeystones] Received keystones data:", data?.length || 0, "keystones");
      console.log("[useKeystones] Sample keystone:", data?.[0]);

      return data as Keystone[];
    },
    enabled: !!user?.id && !isAuthLoading, // Only enable when we have a user and auth isn't loading
    refetchOnWindowFocus: true,
  });

  console.log("[useKeystones] Returning state - keystones:", keystones?.length || 0, "isLoading:", isLoading || isAuthLoading);

  return {
    keystones,
    isLoading: isLoading || isAuthLoading,
    error,
    refetch,
  };
}
