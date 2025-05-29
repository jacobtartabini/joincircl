
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

interface UserMetadata {
  two_fa_enabled?: boolean;
  two_fa_secret?: string;
  backup_codes?: string[];
}

export const use2FA = () => {
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState<TwoFactorSetup | null>(null);
  const { toast } = useToast();

  const enable2FA = async () => {
    setLoading(true);
    try {
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

  const verify2FA = async (token: string, isBackupCode = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-2fa', {
        method: 'POST',
        body: { token, isBackupCode }
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
        description: isBackupCode ? "Invalid backup code" : "Invalid verification code",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const verifyLogin2FA = async (email: string, password: string, totpCode: string, isBackupCode = false) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-login-2fa', {
        method: 'POST',
        body: { email, password, totpCode, isBackupCode }
      });

      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error verifying login 2FA:', error);
      toast({
        title: "Error",
        description: error.message || "2FA verification failed",
        variant: "destructive",
      });
      throw error;
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

  const check2FAStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('metadata')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking 2FA status:', error);
        return false;
      }

      // Safely parse metadata and check for 2FA status
      const metadata = data?.metadata as UserMetadata | null;
      return metadata?.two_fa_enabled || false;
    } catch (error) {
      console.error('Error checking 2FA status:', error);
      return false;
    }
  };

  return {
    loading,
    setupData,
    enable2FA,
    verify2FA,
    verifyLogin2FA,
    disable2FA,
    check2FAStatus
  };
};
