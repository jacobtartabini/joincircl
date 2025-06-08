import { AuditLogger } from './auditLogger';

interface SecurityEvent {
  type: 'suspicious_activity' | 'rate_limit_exceeded' | 'invalid_input' | 'authentication_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: number;
  userId?: string;
}

export class SecurityMonitor {
  private static events: SecurityEvent[] = [];
  private static readonly MAX_EVENTS = 1000;

  static logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: Date.now()
    };

    this.events.push(securityEvent);
    
    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log to audit system for critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      AuditLogger.log({
        event_type: 'security_session_terminated',
        user_id: event.userId,
        details: {
          security_event_type: event.type,
          severity: event.severity,
          ...event.details
        },
        success: false,
        error_message: `Security event: ${event.type}`
      });
    }

    // Console warning for development
    if (event.severity === 'high' || event.severity === 'critical') {
      console.warn('🚨 Security Event:', securityEvent);
    }
  }

  static getRecentEvents(minutes: number = 60): SecurityEvent[] {
    const cutoff = Date.now() - (minutes * 60 * 1000);
    return this.events.filter(event => event.timestamp > cutoff);
  }

  static getEventsByType(type: SecurityEvent['type']): SecurityEvent[] {
    return this.events.filter(event => event.type === type);
  }

  static getSecurityScore(): { score: number; factors: string[] } {
    const recentEvents = this.getRecentEvents(60); // Last hour
    const factors: string[] = [];
    let score = 100;

    // Deduct points for recent security events
    const criticalEvents = recentEvents.filter(e => e.severity === 'critical').length;
    const highEvents = recentEvents.filter(e => e.severity === 'high').length;
    const mediumEvents = recentEvents.filter(e => e.severity === 'medium').length;

    score -= (criticalEvents * 30);
    score -= (highEvents * 15);
    score -= (mediumEvents * 5);

    if (criticalEvents > 0) factors.push(`${criticalEvents} critical security events`);
    if (highEvents > 0) factors.push(`${highEvents} high-severity security events`);
    if (mediumEvents > 0) factors.push(`${mediumEvents} medium-severity security events`);

    // Check for patterns
    const suspiciousActivity = recentEvents.filter(e => e.type === 'suspicious_activity').length;
    if (suspiciousActivity > 5) {
      score -= 20;
      factors.push('High suspicious activity');
    }

    const rateLimitExceeded = recentEvents.filter(e => e.type === 'rate_limit_exceeded').length;
    if (rateLimitExceeded > 10) {
      score -= 15;
      factors.push('Frequent rate limiting');
    }

    return {
      score: Math.max(0, score),
      factors: factors.length > 0 ? factors : ['No security issues detected']
    };
  }

  static clearEvents(): void {
    this.events = [];
  }

  // Auto-response to security threats
  static handleThreatResponse(event: SecurityEvent): void {
    if (event.severity === 'critical') {
      // For critical events, we might want to:
      // 1. Lock the user account temporarily
      // 2. Require additional authentication
      // 3. Send alerts to administrators
      
      this.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'high',
        details: {
          action: 'auto_response_triggered',
          original_event: event.type,
          response: 'enhanced_monitoring_enabled'
        },
        userId: event.userId
      });
    }
  }
}
