
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserPreferences {
  id: string;
  user_id: string;
  language: string;
  timezone: string;
  theme: string;
  email_notifications: boolean;
  push_notifications: boolean;
  marketing_emails: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) {
        // Create default preferences if none exist
        const defaultPrefs = {
          user_id: user.id,
          language: 'en',
          timezone: 'America/New_York',
          theme: 'system',
          email_notifications: true,
          push_notifications: false,
          marketing_emails: false
        };
        
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPrefs)
          .select()
          .single();
        
        if (insertError) throw insertError;
        setPreferences(newPrefs);
      } else {
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, ...updates } : null);
      
      // Apply theme immediately if changed
      if (updates.theme) {
        applyTheme(updates.theme);
      }
      
      toast({
        title: "Success",
        description: "Preferences updated successfully",
      });
      
      return true;
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update preferences",
        variant: "destructive",
      });
      return false;
    }
  };

  const applyTheme = (theme: string) => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
    
    // Store theme preference in localStorage for immediate access
    localStorage.setItem('theme', theme);
    
    // Trigger a custom event to notify components of theme change
    window.dispatchEvent(new CustomEvent('themeChange', { detail: { theme } }));
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  // Apply theme on initial load and listen for system theme changes
  useEffect(() => {
    if (preferences?.theme) {
      applyTheme(preferences.theme);
    } else {
      // Apply stored theme immediately on load
      const storedTheme = localStorage.getItem('theme') || 'system';
      applyTheme(storedTheme);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (preferences?.theme === 'system' || !preferences?.theme) {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences?.theme]);

  // Initialize theme immediately on component mount
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'system';
    applyTheme(storedTheme);
  }, []);

  return { preferences, loading, updatePreferences, refetch: fetchPreferences };
};
