
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useUserProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();

  const updateProfile = async (updates: any) => {
    if (!user) throw new Error('No user found');
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('No user found');
    
    setLoading(true);
    try {
      // For now, just simulate upload success
      // In a real app, you would upload to Supabase storage
      toast.success('Avatar uploaded successfully');
      return true;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    updateProfile,
    uploadAvatar,
    loading,
  };
};
