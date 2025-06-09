
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user found');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
  };
};
