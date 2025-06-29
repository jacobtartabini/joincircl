
import { supabase } from '@/integrations/supabase/client';

export type SecurityEventType = 
  | 'login_attempt'
  | 'login_success'
  | 'login_failure'
  | 'logout'
  | 'password_change'
  | 'suspicious_activity'
  | 'rate_limit_exceeded'
  | 'unauthorized_access'
  | 'data_export'
  | 'profile_update'
  | 'session_timeout';

export interface SecurityEvent {
  event_type: SecurityEventType;
  event_details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

export class SecurityAuditLogger {
  private static getClientInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      ip_address: 'client-side', // This would be set by the server in production
      user_agent: navigator.userAgent
    };
  }

  static async logSecurityEvent(event: SecurityEvent) {
    try {
      const clientInfo = this.getClientInfo();
      const { data: { user } } = await supabase.auth.getUser();
      
      const auditEntry = {
        user_id: user?.id || null,
        event_type: event.event_type,
        event_details: event.event_details || {},
        ip_address: event.ip_address || clientInfo.ip_address,
        user_agent: event.user_agent || clientInfo.user_agent
      };

      // Log to console for development
      console.log('[Security Audit]', auditEntry);

      // Insert into audit logs table
      const { error } = await supabase
        .from('security_audit_logs')
        .insert([auditEntry]);

      if (error) {
        console.error('Failed to log security event:', error);
      }
      
    } catch (error) {
      console.error('Security audit logging failed:', error);
    }
  }
}
