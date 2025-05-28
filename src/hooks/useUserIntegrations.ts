
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserIntegration {
  id: string;
  user_id: string;
  provider: string;
  provider_id?: string;
  connected_at: string;
  last_synced?: string;
  is_active: boolean;
  metadata?: any;
}

export const useUserIntegrations = () => {
  const [integrations, setIntegrations] = useState<UserIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchIntegrations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error fetching integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleIntegration = async (provider: string, enable: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (enable) {
        // Simulate connection - in reality this would involve OAuth flows
        const { error } = await supabase
          .from('user_integrations')
          .upsert({
            user_id: user.id,
            provider,
            is_active: true,
            connected_at: new Date().toISOString(),
          });

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `${provider} connected successfully`,
        });
      } else {
        const { error } = await supabase
          .from('user_integrations')
          .update({ is_active: false })
          .eq('user_id', user.id)
          .eq('provider', provider);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: `${provider} disconnected successfully`,
        });
      }

      await fetchIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({
        title: "Error",
        description: `Failed to ${enable ? 'connect' : 'disconnect'} ${provider}`,
        variant: "destructive",
      });
    }
  };

  const isConnected = (provider: string) => {
    return integrations.some(integration => 
      integration.provider === provider && integration.is_active
    );
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  return { integrations, loading, toggleIntegration, isConnected, refetch: fetchIntegrations };
};
