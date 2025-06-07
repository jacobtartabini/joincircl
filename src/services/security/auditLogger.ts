import { supabase } from '@/integrations/supabase/client';

export type AuditEventType = 
  | 'auth_signin' 
  | 'auth_signout' 
  | 'auth_signup'
  | 'auth_failed'
  | 'contact_created'
  | 'contact_updated'
  | 'contact_deleted'
  | 'profile_updated'
  | 'security_2fa_enabled'
  | 'security_2fa_disabled'
  | 'security_session_terminated'
  | 'data_export'
  | 'account_deleted';

export interface AuditEvent {
  event_type: AuditEventType;
  user_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
  error_message?: string;
}

export class AuditLogger {
  private static getClientInfo() {
    if (typeof window === 'undefined') return {};
    
    return {
      ip_address: 'client-side', // This would be set by the server
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  }

  static async log(event: Omit<AuditEvent, 'ip_address' | 'user_agent'>) {
    try {
      const clientInfo = this.getClientInfo();
      const fullEvent = {
        ...event,
        ...clientInfo,
        created_at: new Date().toISOString()
      };

      // Log to console for development
      console.log('Audit Event:', fullEvent);

      // In production, send to backend audit service
      if (typeof window !== 'undefined') {
        // Store in localStorage as backup for critical events
        const auditLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
        auditLogs.push(fullEvent);
        
        // Keep only last 100 events in localStorage
        if (auditLogs.length > 100) {
          auditLogs.splice(0, auditLogs.length - 100);
        }
        
        localStorage.setItem('audit_logs', JSON.stringify(auditLogs));
      }

      // TODO: Send to Supabase audit table or external audit service
      // await supabase.from('audit_logs').insert(fullEvent);
      
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  static async logAuthEvent(
    type: 'auth_signin' | 'auth_signout' | 'auth_signup' | 'auth_failed',
    details: Record<string, any>,
    success: boolean = true,
    error?: string
  ) {
    await this.log({
      event_type: type,
      user_id: details.user_id,
      details: {
        email: details.email,
        method: details.method || 'email',
        ...details
      },
      success,
      error_message: error
    });
  }

  static async logDataEvent(
    type: 'contact_created' | 'contact_updated' | 'contact_deleted' | 'profile_updated',
    user_id: string,
    details: Record<string, any>,
    success: boolean = true,
    error?: string
  ) {
    await this.log({
      event_type: type,
      user_id,
      details,
      success,
      error_message: error
    });
  }

  static async logSecurityEvent(
    type: 'security_2fa_enabled' | 'security_2fa_disabled' | 'security_session_terminated',
    user_id: string,
    details: Record<string, any> = {},
    success: boolean = true,
    error?: string
  ) {
    await this.log({
      event_type: type,
      user_id,
      details,
      success,
      error_message: error
    });
  }
}
