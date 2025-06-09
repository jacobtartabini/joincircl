import { makeService, AutomationPreferences } from "@/services/makeService";
import { emailService } from "@/services/emailService";
import { supabase } from "@/integrations/supabase/client";

class EnhancedMakeService {
  // Enhanced reconnect reminders with email integration
  async scheduleReconnectRemindersWithEmail(userId: string): Promise<boolean> {
    try {
      // Get user preferences
      const preferences = await makeService.getUserAutomationPreferences(userId);
      if (!preferences?.automationsEnabled) return false;

      // Get user profile for email
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError);
        return false;
      }

      // Check if we can send reminder email (avoid spam)
      const canSendEmail = await emailService.canSendEmail(userId, 'reconnect_reminder', 48);
      if (!canSendEmail) {
        console.log('Reconnect reminder email cooldown active for user:', userId);
        return false;
      }

      // Get stale contacts
      const staleContacts = await makeService.checkStaleContacts(userId, preferences.reconnectReminderDays);
      if (staleContacts.length === 0) return true;

      // Generate AI suggestions if available
      let suggestions: string[] = [];
      try {
        const aiSuggestions = await makeService.getAutomationSuggestions(userId);
        suggestions = aiSuggestions
          .filter(s => s.type === 'reconnect_reminder')
          .slice(0, staleContacts.length)
          .map(s => s.suggestion);
      } catch (error) {
        console.error('Failed to get AI suggestions:', error);
      }

      // Send email based on communication preference
      if (preferences.preferredCommunicationChannel === 'email') {
        const emailSent = await emailService.sendReconnectReminder(
          userId,
          profile.email,
          profile.full_name || 'there',
          staleContacts.slice(0, 5), // Limit to top 5 for email
          suggestions
        );

        if (!emailSent) {
          console.error('Failed to send reconnect reminder email');
        }
      }

      // Also trigger Make.com automation for other channels
      const makeTriggered = await makeService.scheduleReconnectReminders(userId);
      
      return true;
    } catch (error) {
      console.error('Error in enhanced reconnect reminders:', error);
      return false;
    }
  }

  // Enhanced weekly digest with email
  async generateWeeklyDigestWithEmail(userId: string): Promise<boolean> {
    try {
      const preferences = await makeService.getUserAutomationPreferences(userId);
      if (!preferences?.weeklyDigestEnabled) return false;

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Failed to get user profile:', profileError);
        return false;
      }

      // Check email cooldown
      const canSendEmail = await emailService.canSendEmail(userId, 'weekly_digest', 168); // 7 days
      if (!canSendEmail) {
        console.log('Weekly digest email cooldown active for user:', userId);
        return false;
      }

      // Get digest data
      const [interactions, contactStats, staleContacts] = await Promise.all([
        this.getRecentInteractions(userId),
        this.getContactStats(userId),
        makeService.checkStaleContacts(userId, preferences.reconnectReminderDays)
      ]);

      // Generate AI recommendations
      let recommendations = "";
      try {
        const suggestions = await makeService.getAutomationSuggestions(userId);
        if (suggestions.length > 0) {
          recommendations = suggestions[0].suggestion;
        }
      } catch (error) {
        console.error('Failed to get recommendations:', error);
      }

      // Send email digest
      if (preferences.preferredCommunicationChannel === 'email') {
        const emailSent = await emailService.sendWeeklyDigest(
          userId,
          profile.email,
          profile.full_name || 'there',
          contactStats,
          interactions,
          staleContacts.slice(0, 5),
          recommendations
        );

        if (!emailSent) {
          console.error('Failed to send weekly digest email');
        }
      }

      // Also trigger Make.com automation
      const makeTriggered = await makeService.generateWeeklyDigest(userId);
      
      return true;
    } catch (error) {
      console.error('Error in enhanced weekly digest:', error);
      return false;
    }
  }

  // Send onboarding email for new users
  async sendOnboardingEmail(userId: string): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Failed to get user profile for onboarding:', error);
        return false;
      }

      return await emailService.sendOnboardingEmail(
        userId,
        profile.email,
        profile.full_name
      );
    } catch (error) {
      console.error('Error sending onboarding email:', error);
      return false;
    }
  }

  // Send security notifications
  async sendSecurityNotification(
    userId: string,
    notificationType: 'login_alert' | 'password_change' | 'email_change' | 'general',
    details?: string,
    location?: string
  ): Promise<boolean> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', userId)
        .single();

      if (error || !profile) {
        console.error('Failed to get user profile for security notification:', error);
        return false;
      }

      return await emailService.sendSecurityNotification(
        userId,
        profile.email,
        profile.full_name || 'User',
        notificationType,
        details,
        location
      );
    } catch (error) {
      console.error('Error sending security notification:', error);
      return false;
    }
  }

  private async getRecentInteractions(userId: string) {
    try {
      const { data, error } = await supabase
        .from('interactions')
        .select(`
          id,
          type,
          date,
          notes,
          contacts!inner(name)
        `)
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });

      if (error) throw error;

      return data?.map(interaction => ({
        ...interaction,
        contact_name: interaction.contacts?.name || 'Unknown'
      })) || [];
    } catch (error) {
      console.error('Error fetching recent interactions:', error);
      return [];
    }
  }

  private async getContactStats(userId: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('circle')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data?.length || 0,
        inner: data?.filter(c => c.circle === 'inner').length || 0,
        middle: data?.filter(c => c.circle === 'middle').length || 0,
        outer: data?.filter(c => c.circle === 'outer').length || 0
      };

      return stats;
    } catch (error) {
      console.error('Error fetching contact stats:', error);
      return { total: 0, inner: 0, middle: 0, outer: 0 };
    }
  }
}

export const enhancedMakeService = new EnhancedMakeService();
