
import { supabase } from "@/integrations/supabase/client";

export interface MakeWebhookData {
  userId: string;
  triggerType: 'reconnect_reminder' | 'weekly_digest' | 'contact_sync' | 'message_automation';
  data: any;
}

export interface MakeScenario {
  id: string;
  name: string;
  webhookUrl: string;
  isActive: boolean;
  triggerType: string;
}

export interface AutomationPreferences {
  userId: string;
  reconnectReminderDays: number;
  weeklyDigestEnabled: boolean;
  preferredCommunicationChannel: 'email' | 'sms' | 'in-app';
  digestDay: 'sunday' | 'monday';
  automationsEnabled: boolean;
}

class MakeService {
  private apiKey = 'e85e0c88-e664-49fc-bb71-3e9751480f22';
  private baseUrl = 'https://hook.integromat.com';

  async triggerMakeWebhook(scenarioId: string, data: MakeWebhookData): Promise<boolean> {
    try {
      const webhookUrl = `${this.baseUrl}/webhook/${scenarioId}`;
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          ...data,
          timestamp: new Date().toISOString(),
          source: 'circl-app'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Error triggering Make webhook:', error);
      return false;
    }
  }

  async checkStaleContacts(userId: string, dayThreshold: number = 30): Promise<any[]> {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select(`
          id,
          name,
          circle,
          last_contact,
          personal_email,
          mobile_phone,
          company_name,
          job_title
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - dayThreshold);

      return contacts?.filter(contact => {
        const lastContact = contact.last_contact ? new Date(contact.last_contact) : new Date(0);
        return lastContact < cutoffDate;
      }) || [];
    } catch (error) {
      console.error('Error checking stale contacts:', error);
      return [];
    }
  }

  async getUserAutomationPreferences(userId: string): Promise<AutomationPreferences | null> {
    try {
      // Use raw SQL query to avoid TypeScript type issues with new table
      const { data, error } = await supabase.rpc('exec_sql', {
        sql: `SELECT * FROM user_automation_preferences WHERE user_id = $1`,
        params: [userId]
      }).single();

      if (error && error.code !== 'PGRST116') {
        // If RPC doesn't exist, fall back to direct query
        const { data: directData, error: directError } = await supabase
          .from('user_automation_preferences' as any)
          .select('*')
          .eq('user_id', userId)
          .single();
        
        if (directError && directError.code !== 'PGRST116') throw directError;
        
        if (directData) {
          return {
            userId: directData.user_id,
            reconnectReminderDays: directData.reconnect_reminder_days,
            weeklyDigestEnabled: directData.weekly_digest_enabled,
            preferredCommunicationChannel: directData.preferred_communication_channel,
            digestDay: directData.digest_day,
            automationsEnabled: directData.automations_enabled
          };
        }
      }

      if (data) {
        return {
          userId: data.user_id,
          reconnectReminderDays: data.reconnect_reminder_days,
          weeklyDigestEnabled: data.weekly_digest_enabled,
          preferredCommunicationChannel: data.preferred_communication_channel,
          digestDay: data.digest_day,
          automationsEnabled: data.automations_enabled
        };
      }

      // Return default preferences if none exist
      return {
        userId,
        reconnectReminderDays: 30,
        weeklyDigestEnabled: true,
        preferredCommunicationChannel: 'email',
        digestDay: 'sunday',
        automationsEnabled: true
      };
    } catch (error) {
      console.error('Error fetching automation preferences:', error);
      return {
        userId,
        reconnectReminderDays: 30,
        weeklyDigestEnabled: true,
        preferredCommunicationChannel: 'email',
        digestDay: 'sunday',
        automationsEnabled: true
      };
    }
  }

  async updateAutomationPreferences(preferences: AutomationPreferences): Promise<boolean> {
    try {
      // Convert to database format
      const dbPreferences = {
        user_id: preferences.userId,
        reconnect_reminder_days: preferences.reconnectReminderDays,
        weekly_digest_enabled: preferences.weeklyDigestEnabled,
        preferred_communication_channel: preferences.preferredCommunicationChannel,
        digest_day: preferences.digestDay,
        automations_enabled: preferences.automationsEnabled
      };

      const { error } = await supabase
        .from('user_automation_preferences' as any)
        .upsert(dbPreferences);

      return !error;
    } catch (error) {
      console.error('Error updating automation preferences:', error);
      return false;
    }
  }

  async scheduleReconnectReminders(userId: string): Promise<boolean> {
    const preferences = await this.getUserAutomationPreferences(userId);
    if (!preferences?.automationsEnabled) return false;

    const staleContacts = await this.checkStaleContacts(userId, preferences.reconnectReminderDays);
    
    if (staleContacts.length === 0) return true;

    return await this.triggerMakeWebhook('reconnect-reminder-scenario', {
      userId,
      triggerType: 'reconnect_reminder',
      data: {
        contacts: staleContacts.slice(0, 5), // Limit to top 5 for automation
        preferences,
        reminderThreshold: preferences.reconnectReminderDays
      }
    });
  }

  async generateWeeklyDigest(userId: string): Promise<boolean> {
    const preferences = await this.getUserAutomationPreferences(userId);
    if (!preferences?.weeklyDigestEnabled) return false;

    try {
      // Get recent interactions
      const { data: recentInteractions, error: interactionsError } = await supabase
        .from('interactions')
        .select(`
          id,
          type,
          date,
          contact_id,
          contacts (name, circle)
        `)
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('date', { ascending: false });

      if (interactionsError) throw interactionsError;

      // Get contact counts by circle
      const { data: contactStats, error: statsError } = await supabase
        .from('contacts')
        .select('circle')
        .eq('user_id', userId);

      if (statsError) throw statsError;

      const stats = {
        total: contactStats?.length || 0,
        inner: contactStats?.filter(c => c.circle === 'inner').length || 0,
        middle: contactStats?.filter(c => c.circle === 'middle').length || 0,
        outer: contactStats?.filter(c => c.circle === 'outer').length || 0
      };

      return await this.triggerMakeWebhook('weekly-digest-scenario', {
        userId,
        triggerType: 'weekly_digest',
        data: {
          recentInteractions: recentInteractions || [],
          contactStats: stats,
          preferences,
          weekStarting: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error generating weekly digest:', error);
      return false;
    }
  }

  async syncContactsToExternal(userId: string, platform: 'google' | 'outlook'): Promise<boolean> {
    try {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return await this.triggerMakeWebhook('contact-sync-scenario', {
        userId,
        triggerType: 'contact_sync',
        data: {
          contacts: contacts || [],
          platform,
          syncDirection: 'export'
        }
      });
    } catch (error) {
      console.error('Error syncing contacts:', error);
      return false;
    }
  }

  async sendAutomatedMessage(userId: string, contactId: string, message: string, channel: string): Promise<boolean> {
    try {
      const { data: contact, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', contactId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return await this.triggerMakeWebhook('message-automation-scenario', {
        userId,
        triggerType: 'message_automation',
        data: {
          contact,
          message,
          channel,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Error sending automated message:', error);
      return false;
    }
  }

  // New methods for enhanced automation features
  async scheduleRecurringAutomations(userId: string): Promise<boolean> {
    try {
      const preferences = await this.getUserAutomationPreferences(userId);
      if (!preferences?.automationsEnabled) return false;

      // Schedule weekly digest if enabled and it's the right day
      const today = new Date().getDay(); // 0 = Sunday, 1 = Monday
      const shouldSendDigest = (preferences.digestDay === 'sunday' && today === 0) || 
                              (preferences.digestDay === 'monday' && today === 1);

      if (shouldSendDigest && preferences.weeklyDigestEnabled) {
        await this.generateWeeklyDigest(userId);
      }

      // Check for reconnect reminders
      await this.scheduleReconnectReminders(userId);

      return true;
    } catch (error) {
      console.error('Error scheduling recurring automations:', error);
      return false;
    }
  }

  async getAutomationSuggestions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('automation_suggestions' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching automation suggestions:', error);
      return [];
    }
  }

  async markSuggestionAsRead(suggestionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('automation_suggestions' as any)
        .update({ is_read: true })
        .eq('id', suggestionId);

      return !error;
    } catch (error) {
      console.error('Error marking suggestion as read:', error);
      return false;
    }
  }
}

export const makeService = new MakeService();
