import { supabase } from '@/integrations/supabase/client';

// Security event types
export enum SecurityEventType {
  FAILED_LOGIN = 'failed_login',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  API_ABUSE = 'api_abuse',
  TOKEN_REFRESH_FAILED = 'token_refresh_failed',
  SECURITY_HEADER_VIOLATION = 'security_header_violation',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt'
}

interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  clientIp?: string;
  userAgent?: string;
  details: Record<string, any>;
  timestamp: string;
}

class SecurityMonitor {
  private eventQueue: SecurityEvent[] = [];
  private isProcessing = false;

  // Log security event
  async logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>) {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString()
    };

    // Add to queue
    this.eventQueue.push(securityEvent);

    // Process immediately for critical events
    if (this.isCriticalEvent(event.type)) {
      await this.processEventQueue();
    }

    // Log to console for immediate visibility
    console.warn(`[SECURITY EVENT] ${event.type}:`, securityEvent);
  }

  // Check if event is critical and needs immediate processing
  private isCriticalEvent(type: SecurityEventType): boolean {
    return [
      SecurityEventType.UNAUTHORIZED_ACCESS,
      SecurityEventType.API_ABUSE,
      SecurityEventType.XSS_ATTEMPT,
      SecurityEventType.SQL_INJECTION_ATTEMPT
    ].includes(type);
  }

  // Process queued security events
  private async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Batch insert security events
      const { error } = await supabase
        .from('security_events')
        .insert(events.map(event => ({
          type: event.type,
          user_id: event.userId,
          client_ip: event.clientIp,
          user_agent: event.userAgent,
          details: event.details,
          occurred_at: event.timestamp
        })));

      if (error) {
        console.error('Failed to log security events:', error);
        // Re-queue events if they failed to save
        this.eventQueue.unshift(...events);
      }
    } catch (error) {
      console.error('Error processing security event queue:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  // Start periodic processing of events
  startPeriodicProcessing() {
    setInterval(() => {
      this.processEventQueue();
    }, 30000); // Process every 30 seconds
  }

  // Analyze patterns for suspicious activity
  async analyzeSecurityPatterns(userId?: string): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    patterns: string[];
    recommendations: string[];
  }> {
    try {
      const query = supabase
        .from('security_events')
        .select('*')
        .gte('occurred_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // Last 24 hours
        .order('occurred_at', { ascending: false })
        .limit(100);

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data: events, error } = await query;

      if (error || !events) {
        return { riskLevel: 'low', patterns: [], recommendations: [] };
      }

      const patterns: string[] = [];
      const recommendations: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // Check for multiple failed login attempts
      const failedLogins = events.filter(e => e.type === SecurityEventType.FAILED_LOGIN);
      if (failedLogins.length > 5) {
        patterns.push(`${failedLogins.length} failed login attempts detected`);
        riskLevel = 'medium';
        recommendations.push('Consider enabling 2FA for enhanced security');
      }

      // Check for rate limiting events
      const rateLimitEvents = events.filter(e => e.type === SecurityEventType.RATE_LIMIT_EXCEEDED);
      if (rateLimitEvents.length > 10) {
        patterns.push(`Excessive rate limiting events (${rateLimitEvents.length})`);
        riskLevel = 'high';
        recommendations.push('Review API usage patterns');
      }

      // Check for critical security events
      const criticalEvents = events.filter(e => this.isCriticalEvent(e.type as SecurityEventType));
      if (criticalEvents.length > 0) {
        patterns.push(`${criticalEvents.length} critical security events detected`);
        riskLevel = 'high';
        recommendations.push('Immediate security review required');
      }

      return { riskLevel, patterns, recommendations };
    } catch (error) {
      console.error('Error analyzing security patterns:', error);
      return { riskLevel: 'low', patterns: [], recommendations: [] };
    }
  }

  // Get security dashboard data
  async getSecurityDashboardData(timeRange: '1h' | '24h' | '7d' = '24h') {
    const timeRangeMap = {
      '1h': 1,
      '24h': 24,
      '7d': 168
    };

    const hours = timeRangeMap[timeRange];
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

    try {
      const { data: events, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('occurred_at', startTime)
        .order('occurred_at', { ascending: false });

      if (error || !events) {
        return { totalEvents: 0, eventsByType: {}, timeline: [] };
      }

      // Group events by type
      const eventsByType = events.reduce((acc, event) => {
        acc[event.type] = (acc[event.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Create timeline data
      const timeline = events.reduce((acc, event) => {
        const hour = new Date(event.occurred_at).toISOString().slice(0, 13);
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalEvents: events.length,
        eventsByType,
        timeline: Object.entries(timeline).map(([time, count]) => ({ time, count }))
      };
    } catch (error) {
      console.error('Error fetching security dashboard data:', error);
      return { totalEvents: 0, eventsByType: {}, timeline: [] };
    }
  }
}

// Singleton instance
export const securityMonitor = new SecurityMonitor();

// Initialize periodic processing
if (typeof window !== 'undefined') {
  securityMonitor.startPeriodicProcessing();
}

// Helper functions for common security checks
export function detectSuspiciousInput(input: string): boolean {
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /(union|select|insert|delete|update|drop|create|alter)\s+/gi,
    /['";]+.*?(or|and)\s+['"]?\d+['"]?\s*=\s*['"]?\d+/gi
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

export function logFailedAuthentication(details: Record<string, any>) {
  securityMonitor.logSecurityEvent({
    type: SecurityEventType.FAILED_LOGIN,
    details,
    clientIp: getClientIP(),
    userAgent: getUserAgent()
  });
}

export function logRateLimitExceeded(userId: string, endpoint: string) {
  securityMonitor.logSecurityEvent({
    type: SecurityEventType.RATE_LIMIT_EXCEEDED,
    userId,
    details: { endpoint },
    clientIp: getClientIP(),
    userAgent: getUserAgent()
  });
}

export function logUnauthorizedAccess(userId: string, resource: string) {
  securityMonitor.logSecurityEvent({
    type: SecurityEventType.UNAUTHORIZED_ACCESS,
    userId,
    details: { resource },
    clientIp: getClientIP(),
    userAgent: getUserAgent()
  });
}

// Helper functions to get client information
function getClientIP(): string {
  // In a browser environment, we can't directly get the real IP
  // This would typically be handled by the server/proxy
  return 'unknown';
}

function getUserAgent(): string {
  return typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown';
}