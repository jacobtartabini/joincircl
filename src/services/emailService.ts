
import { supabase } from "@/integrations/supabase/client";

export interface EmailData {
  type: 'reconnect_reminder' | 'onboarding' | 'weekly_digest' | 'security_notification';
  to: string;
  userId: string;
  data?: any;
}

class EmailService {
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      console.log('Sending email:', emailData);
      
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: emailData
      });

      if (error) {
        console.error('Email sending failed:', error);
        return false;
      }

      console.log('Email sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  async sendReconnectReminder(
    userId: string, 
    userEmail: string, 
    userName: string, 
    contacts: any[], 
    suggestions?: string[]
  ): Promise<boolean> {
    return this.sendEmail({
      type: 'reconnect_reminder',
      to: userEmail,
      userId,
      data: {
        userName,
        contacts,
        suggestions
      }
    });
  }

  async sendOnboardingEmail(
    userId: string, 
    userEmail: string, 
    userName?: string
  ): Promise<boolean> {
    return this.sendEmail({
      type: 'onboarding',
      to: userEmail,
      userId,
      data: {
        userName,
        userEmail
      }
    });
  }

  async sendWeeklyDigest(
    userId: string,
    userEmail: string,
    userName: string,
    stats: any,
    interactions: any[],
    staleContacts: any[],
    recommendations?: string
  ): Promise<boolean> {
    return this.sendEmail({
      type: 'weekly_digest',
      to: userEmail,
      userId,
      data: {
        userName,
        stats,
        interactions,
        staleContacts,
        recommendations
      }
    });
  }

  async sendSecurityNotification(
    userId: string,
    userEmail: string,
    userName: string,
    notificationType: 'login_alert' | 'password_change' | 'email_change' | 'general',
    details?: string,
    location?: string
  ): Promise<boolean> {
    return this.sendEmail({
      type: 'security_notification',
      to: userEmail,
      userId,
      data: {
        userName,
        notificationType,
        details,
        location,
        timestamp: new Date().toISOString()
      }
    });
  }

  // Get email sending history for a user
  async getEmailHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching email history:', error);
      return [];
    }
  }

  // Check if we can send an email (rate limiting)
  async canSendEmail(userId: string, emailType: string, cooldownHours: number = 24): Promise<boolean> {
    try {
      const cutoffTime = new Date();
      cutoffTime.setHours(cutoffTime.getHours() - cooldownHours);

      const { data, error } = await supabase
        .from('email_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('email_type', emailType)
        .eq('status', 'sent')
        .gte('sent_at', cutoffTime.toISOString())
        .limit(1);

      if (error) throw error;
      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking email cooldown:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
