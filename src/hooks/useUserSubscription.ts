import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserSubscription = () => {
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSubscription = async () => {
    try {
      setLoading(true);
      // New: call the check-subscription edge function (syncs and retrieves from Stripe/Supabase)
      const { error, data } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;
      // After sync, load latest row from user_subscriptions
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        return;
      }
      const { data: subRow, error: subErr } = await supabase
        .from("user_subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setSubscription(subRow || null);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Error",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    // Optionally poll every 20s to refresh state
    // const interval = setInterval(fetchSubscription, 20000);
    // return () => clearInterval(interval);
  }, []);

  return { subscription, loading, refetch: fetchSubscription };
};
