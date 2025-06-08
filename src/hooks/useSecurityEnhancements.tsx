
import { useEffect, useState } from 'react';
import { SecurityMonitor } from '@/services/security/securityMonitor';
import { AdvancedRateLimiter } from '@/services/security/advancedRateLimiter';
import { SecurityHeaders } from '@/services/security/securityHeaders';
import { useToast } from '@/hooks/use-toast';

export const useSecurityEnhancements = () => {
  const [securityScore, setSecurityScore] = useState(100);
  const [threats, setThreats] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Monitor security score
    const checkSecurity = () => {
      const { score, factors } = SecurityMonitor.getSecurityScore();
      setSecurityScore(score);
      
      if (score < 70) {
        setThreats(factors);
        
        if (score < 50) {
          toast({
            title: "Security Alert",
            description: "Multiple security events detected. Enhanced monitoring active.",
            variant: "destructive",
          });
        }
      } else {
        setThreats([]);
      }
    };

    // Check security every minute
    const interval = setInterval(checkSecurity, 60000);
    checkSecurity(); // Initial check

    return () => clearInterval(interval);
  }, [toast]);

  const validateRequest = (endpoint: string, options?: RequestInit) => {
    const userAgent = navigator.userAgent;
    
    // Check rate limiting
    const rateLimitResult = AdvancedRateLimiter.isAllowedAdvanced(
      'global',
      'api_calls',
      { userAgent, endpoint }
    );

    if (!rateLimitResult.allowed) {
      SecurityMonitor.logSecurityEvent({
        type: 'rate_limit_exceeded',
        severity: rateLimitResult.suspicious ? 'high' : 'medium',
        details: {
          endpoint,
          userAgent,
          retryAfter: rateLimitResult.retryAfter
        }
      });
      
      throw new Error(`Rate limit exceeded. Try again in ${rateLimitResult.retryAfter} seconds.`);
    }

    if (rateLimitResult.suspicious) {
      SecurityMonitor.logSecurityEvent({
        type: 'suspicious_activity',
        severity: 'medium',
        details: {
          endpoint,
          userAgent,
          reason: 'suspicious_request_pattern'
        }
      });
    }

    return true;
  };

  const secureHeaders = SecurityHeaders.getSecurityHeaders();

  return {
    securityScore,
    threats,
    validateRequest,
    secureHeaders,
    isSecure: securityScore >= 70
  };
};
