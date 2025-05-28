
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export const use2FA = () => {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const { toast } = useToast();

  const enable2FA = async () => {
    setLoading(true);
    try {
      // Call edge function to generate 2FA setup
      const { data, error } = await supabase.functions.invoke('setup-2fa', {
        method: 'POST'
      });

      if (error) throw error;
      
      setSetupData(data);
      return data;
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to setup 2FA",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async (token: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        method: 'POST',
        body: { token }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "2FA enabled successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      toast({
        title: "Error",
        description: "Invalid verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const disable2FA = async (password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('disable-2fa', {
        method: 'POST',
        body: { password }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "2FA disabled successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast({
        title: "Error",
        description: "Failed to disable 2FA",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setupData,
    enable2FA,
    verify2FA,
    disable2FA
  };
};
