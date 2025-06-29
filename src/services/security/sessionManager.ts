
import { supabase } from '@/integrations/supabase/client';
import { SecurityAuditLogger } from './securityAuditLogger';

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 24 * 60 * 60 * 1000; // 24 hours
  private static readonly ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static sessionTimer: NodeJS.Timeout | null = null;

  static async initializeSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create or update session record
      const sessionData = {
        user_id: user.id,
        session_token: await this.generateSessionToken(),
        device_info: this.getDeviceInfo(),
        ip_address: 'client-side',
        location: await this.getApproximateLocation(),
        last_active: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_sessions')
        .upsert([sessionData], { onConflict: 'user_id' });

      if (error) {
        console.error('Failed to initialize session:', error);
      }

      // Start activity monitoring
      this.startActivityMonitoring();

      // Log successful session initialization
      await SecurityAuditLogger.logSecurityEvent({
        event_type: 'login_success',
        event_details: { device_info: sessionData.device_info }
      });

    } catch (error) {
      console.error('Session initialization failed:', error);
    }
  }

  private static async generateSessionToken(): Promise<string> {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private static getDeviceInfo(): string {
    if (typeof window === 'undefined') return 'server';
    
    const { userAgent } = navigator;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isTablet = /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/i.test(userAgent);
    
    let deviceType = 'Desktop';
    if (isTablet) deviceType = 'Tablet';
    else if (isMobile) deviceType = 'Mobile';
    
    return `${deviceType} - ${userAgent.substring(0, 100)}`;
  }

  private static async getApproximateLocation(): Promise<string> {
    try {
      // In production, this would use IP geolocation service
      return 'Unknown';
    } catch {
      return 'Unknown';
    }
  }

  private static startActivityMonitoring() {
    if (this.sessionTimer) {
      clearInterval(this.sessionTimer);
    }

    this.sessionTimer = setInterval(async () => {
      await this.updateLastActivity();
      await this.checkForSuspiciousActivity();
    }, this.ACTIVITY_CHECK_INTERVAL);

    // Listen for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const updateActivity = () => this.updateLastActivity();
    
    events.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });
  }

  private static async updateLastActivity() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('user_sessions')
        .update({ last_active: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update activity:', error);
      }
    } catch (error) {
      console.error('Activity update failed:', error);
    }
  }

  private static async checkForSuspiciousActivity() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for multiple active sessions
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('last_active', new Date(Date.now() - this.SESSION_TIMEOUT).toISOString());

      if (error) return;

      if (sessions && sessions.length > 3) {
        await SecurityAuditLogger.logSecurityEvent({
          event_type: 'suspicious_activity',
          event_details: { 
            reason: 'multiple_active_sessions',
            session_count: sessions.length 
          }
        });
      }
    } catch (error) {
      console.error('Suspicious activity check failed:', error);
    }
  }

  static async terminateSession() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Clear session timer
      if (this.sessionTimer) {
        clearInterval(this.sessionTimer);
        this.sessionTimer = null;
      }

      // Remove session record
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', user.id);

      // Log logout
      await SecurityAuditLogger.logSecurityEvent({
        event_type: 'logout'
      });

      // Sign out from Supabase
      await supabase.auth.signOut();

    } catch (error) {
      console.error('Session termination failed:', error);
    }
  }
}
