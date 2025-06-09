
import { supabase } from "@/integrations/supabase/client";

interface ContactStats {
  total: number;
  inner: number;
  middle: number;
  outer: number;
}

interface Interaction {
  id: string;
  type: string;
  date: string;
  notes?: string;
  contact_name: string;
}

interface Contact {
  id: string;
  name: string;
  personal_email?: string;
  last_contact?: string;
  circle: string;
}

class EmailService {
  async canSendEmail(
    userId: string,
    emailType: string,
    cooldownHours: number
  ): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('email_logs')
        .select('sent_at')
        .eq('user_id', userId)
        .eq('email_type', emailType)
        .gte('sent_at', new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString())
        .order('sent_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error checking email cooldown:', error);
        return true; // Allow sending if we can't check
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error in canSendEmail:', error);
      return true;
    }
  }

  async sendReconnectReminder(
    userId: string,
    email: string,
    name: string,
    staleContacts: Contact[],
    suggestions: string[]
  ): Promise<boolean> {
    try {
      // Log the email attempt
      await this.logEmail(userId, email, 'reconnect_reminder');

      // In a real implementation, this would send via Resend or another email service
      console.log('Sending reconnect reminder email to:', email);
      console.log('Stale contacts:', staleContacts.length);
      console.log('Suggestions:', suggestions.length);

      return true;
    } catch (error) {
      console.error('Error sending reconnect reminder:', error);
      return false;
    }
  }

  async sendWeeklyDigest(
    userId: string,
    email: string,
    name: string,
    contactStats: ContactStats,
    interactions: Interaction[],
    staleContacts: Contact[],
    recommendations: string
  ): Promise<boolean> {
    try {
      // Log the email attempt
      await this.logEmail(userId, email, 'weekly_digest');

      // In a real implementation, this would send via Resend or another email service
      console.log('Sending weekly digest email to:', email);
      console.log('Contact stats:', contactStats);
      console.log('Interactions:', interactions.length);
      console.log('Recommendations:', recommendations);

      return true;
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      return false;
    }
  }

  async sendOnboardingEmail(
    userId: string,
    email: string,
    name?: string | null
  ): Promise<boolean> {
    try {
      // Log the email attempt
      await this.logEmail(userId, email, 'onboarding');

      // In a real implementation, this would send via Resend or another email service
      console.log('Sending onboarding email to:', email);

      return true;
    } catch (error) {
      console.error('Error sending onboarding email:', error);
      return false;
    }
  }

  async sendSecurityNotification(
    userId: string,
    email: string,
    name: string,
    notificationType: 'login_alert' | 'password_change' | 'email_change' | 'general',
    details?: string,
    location?: string
  ): Promise<boolean> {
    try {
      // Log the email attempt
      await this.logEmail(userId, email, 'security_notification');

      // In a real implementation, this would send via Resend or another email service
      console.log('Sending security notification email to:', email);
      console.log('Type:', notificationType);
      console.log('Details:', details);
      console.log('Location:', location);

      return true;
    } catch (error) {
      console.error('Error sending security notification:', error);
      return false;
    }
  }

  private async logEmail(
    userId: string,
    recipient: string,
    emailType: string
  ): Promise<void> {
    try {
      await supabase
        .from('email_logs')
        .insert({
          user_id: userId,
          recipient,
          email_type: emailType,
          status: 'sent'
        });
    } catch (error) {
      console.error('Error logging email:', error);
    }
  }
}

export const emailService = new EmailService();
