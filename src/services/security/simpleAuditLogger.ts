
export class AuditLogger {
  static async logAuthEvent(event: string, data: any, success: boolean = true, error?: string) {
    const logEntry = {
      event,
      data,
      success,
      error,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    };

    // For now, just log to console for development
    console.log('[Auth Audit]', logEntry);
    
    // In production, this could be sent to a logging service
    // or stored in the database once the audit table is properly set up
  }
}
