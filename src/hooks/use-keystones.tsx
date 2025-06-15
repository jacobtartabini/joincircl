
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Keystone } from '@/types/keystone';

export function useKeystones() {
  const { user, loading: isAuthLoading } = useAuth();

  const {
    data: keystones = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['keystones', user?.id],
    queryFn: async () => {
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
        console.error('Error fetching keystones:', error);
        throw error;
      }

      return data as Keystone[];
    },
    enabled: !!user?.id && !isAuthLoading, // Only enable when we have a user and auth isn't loading
    refetchOnWindowFocus: true,
  });

  return {
    keystones,
    isLoading: isLoading || isAuthLoading,
    error,
    refetch,
  };
}
