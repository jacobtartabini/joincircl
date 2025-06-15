
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Keystone } from '@/types/keystone';

export function useKeystones() {
  const { user } = useAuth();

  const { data: keystones = [], isLoading, error, refetch } = useQuery({
    queryKey: ['keystones', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

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
    enabled: !!user?.id,
  });

  return {
    keystones,
    isLoading,
    error,
    refetch,
  };
}
