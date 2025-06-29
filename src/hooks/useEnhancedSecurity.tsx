
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { SessionManager } from '@/services/security/sessionManager';
import { SecurityAuditLogger } from '@/services/security/securityAuditLogger';
import { InputValidator } from '@/services/security/inputValidator';
import { EnhancedSecurityHeaders } from '@/services/security/enhancedSecurityHeaders';

export const useEnhancedSecurity = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Initialize session management
    SessionManager.initializeSession();

    // Set up security event listeners
    const handleSecurityEvent = async (event: string, details?: any) => {
      await SecurityAuditLogger.logSecurityEvent({
        event_type: event as any,
        event_details: details
      });
    };

    // Monitor for suspicious activity
    let failedAttempts = 0;
    const maxFailedAttempts = 5;
    
    const handleFailedAuth = () => {
      failedAttempts++;
      if (failedAttempts >= maxFailedAttempts) {
        handleSecurityEvent('suspicious_activity', {
          reason: 'multiple_failed_auth_attempts',
          count: failedAttempts
        });
        
        toast({
          title: "Security Alert",
          description: "Multiple authentication failures detected. Account temporarily restricted.",
          variant: "destructive",
        });
      }
    };

    // Listen for authentication events
    window.addEventListener('auth_failure', handleFailedAuth);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('auth_failure', handleFailedAuth);
      SessionManager.terminateSession();
    };
  }, [toast]);

  const validateAndSanitizeInput = (data: any, type: 'contact' | 'keystone' = 'contact') => {
    if (type === 'contact') {
      const validation = InputValidator.validateContactData(data);
      if (!validation.isValid) {
        toast({
          title: "Input Validation Error",
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return null;
      }
    } else if (type === 'keystone') {
      const validation = InputValidator.validateKeystoneData(data);
      if (!validation.isValid) {
        toast({
          title: "Input Validation Error", 
          description: validation.errors.join(', '),
          variant: "destructive",
        });
        return null;
      }
    }

    // Sanitize text fields
    const sanitized = { ...data };
    Object.keys(sanitized).forEach(key => {
      if (typeof sanitized[key] === 'string') {
        sanitized[key] = InputValidator.sanitizeText(sanitized[key]);
      }
    });

    return sanitized;
  };

  const checkRateLimit = (action: string, maxRequests: number = 10) => {
    const allowed = InputValidator.checkRateLimit(action, maxRequests);
    if (!allowed) {
      toast({
        title: "Rate Limit Exceeded",
        description: "Too many requests. Please wait before trying again.",
        variant: "destructive",
      });
      
      SecurityAuditLogger.logSecurityEvent({
        event_type: 'rate_limit_exceeded',
        event_details: { action, maxRequests }
      });
    }
    return allowed;
  };

  const getSecureHeaders = () => {
    return EnhancedSecurityHeaders.getEnhancedHeaders();
  };

  return {
    validateAndSanitizeInput,
    checkRateLimit,
    getSecureHeaders,
    logSecurityEvent: SecurityAuditLogger.logSecurityEvent
  };
};
