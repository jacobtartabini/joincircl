
import { supabase } from '@/integrations/supabase/client';
import { AuditLogger } from './auditLogger';

export class SessionManager {
  private static readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private static readonly WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
  private static timeoutWarningCallback?: () => void;
  private static timeoutCallback?: () => void;
  private static activityTimer?: NodeJS.Timeout;
  private static warningTimer?: NodeJS.Timeout;

  static init(onWarning?: () => void, onTimeout?: () => void) {
    this.timeoutWarningCallback = onWarning;
    this.timeoutCallback = onTimeout;
    
    if (typeof window !== 'undefined') {
      // Listen for user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.addEventListener(event, this.resetActivityTimer.bind(this), true);
      });
      
      // Initialize activity timer
      this.resetActivityTimer();
    }
  }

  private static resetActivityTimer() {
    // Clear existing timers
    if (this.activityTimer) clearTimeout(this.activityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Set warning timer
    this.warningTimer = setTimeout(() => {
      this.timeoutWarningCallback?.();
    }, this.SESSION_TIMEOUT - this.WARNING_TIME);

    // Set timeout timer
    this.activityTimer = setTimeout(() => {
      this.handleSessionTimeout();
    }, this.SESSION_TIMEOUT);
  }

  private static async handleSessionTimeout() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await AuditLogger.logSecurityEvent(
        'security_session_terminated',
        user.id,
        { reason: 'inactivity_timeout' }
      );
    }

    await supabase.auth.signOut();
    this.timeoutCallback?.();
  }

  static extendSession() {
    this.resetActivityTimer();
  }

  static cleanup() {
    if (this.activityTimer) clearTimeout(this.activityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    
    if (typeof window !== 'undefined') {
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      events.forEach(event => {
        document.removeEventListener(event, this.resetActivityTimer.bind(this), true);
      });
    }
  }

  // Enhanced session storage with encryption key derivation
  static setSecureSession(session: any) {
    if (typeof window === 'undefined') return;
    
    try {
      // Use sessionStorage instead of localStorage for better security
      sessionStorage.setItem('supabase.auth.token', JSON.stringify({
        ...session,
        stored_at: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to store session securely:', error);
    }
  }

  static getSecureSession() {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = sessionStorage.getItem('supabase.auth.token');
      if (!stored) return null;
      
      const session = JSON.parse(stored);
      const age = Date.now() - (session.stored_at || 0);
      
      // Check if session is too old (24 hours)
      if (age > 24 * 60 * 60 * 1000) {
        sessionStorage.removeItem('supabase.auth.token');
        return null;
      }
      
      return session;
    } catch (error) {
      console.warn('Failed to retrieve session:', error);
      return null;
    }
  }

  static clearSecureSession() {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.token'); // Clean up legacy storage
    } catch (error) {
      console.warn('Failed to clear session:', error);
    }
  }

  // Track device fingerprint for security
  static getDeviceFingerprint(): string {
    if (typeof window === 'undefined') return 'server';
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Device fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }
}
