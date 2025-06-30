import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SessionManager } from '@/services/security/sessionManager';
import { RateLimiter } from '@/services/security/rateLimiter';
import { AuditLogger } from '@/services/security/auditLogger';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export const useSecureAuth = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

  useEffect(() => {
    // Initialize session management
    SessionManager.init(
      // Warning callback
      () => {
        if (!sessionWarningShown) {
          setSessionWarningShown(true);
          toast({
            title: "Session Expiring",
            description: "Your session will expire in 5 minutes due to inactivity. Click here to extend it.",
            duration: 30000,
            action: (
              <ToastAction 
                altText="Extend Session"
                onClick={() => {
                  SessionManager.extendSession();
                  setSessionWarningShown(false);
                  toast({
                    title: "Session Extended",
                    description: "Your session has been extended."
                  });
                }}
              >
                Extend Session
              </ToastAction>
            )
          });
        }
      },
      // Timeout callback
      () => {
        toast({
          title: "Session Expired",
          description: "You have been logged out due to inactivity.",
          variant: "destructive",
        });
      }
    );

    return () => {
      SessionManager.cleanup();
    };
  }, [sessionWarningShown, toast]);

  const secureSignIn = async (email: string, password: string) => {
    const identifier = email.toLowerCase();
    
    // Check rate limiting
    const rateLimitStatus = RateLimiter.isAllowed(identifier, 'auth');
    if (!rateLimitStatus.allowed) {
      await AuditLogger.logAuthEvent('auth_failed', { email }, false, 'Rate limit exceeded');
      throw new Error(`Too many attempts. Please try again in ${rateLimitStatus.retryAfter} seconds.`);
    }

    try {
      const result = await auth.signIn(email, password);
      
      if (result.error) {
        await AuditLogger.logAuthEvent('auth_failed', { email }, false, result.error.message);
        throw result.error;
      } else {
        RateLimiter.recordSuccess(identifier, 'auth');
        await AuditLogger.logAuthEvent('auth_signin', { 
          email, 
          device_fingerprint: SessionManager.getDeviceFingerprint() 
        });
      }
      
      return result;
    } catch (error) {
      await AuditLogger.logAuthEvent('auth_failed', { email }, false, error.message);
      throw error;
    }
  };

  const secureSignUp = async (email: string, password: string, fullName?: string) => {
    const identifier = email.toLowerCase();
    
    // Check rate limiting
    const rateLimitStatus = RateLimiter.isAllowed(identifier, 'auth');
    if (!rateLimitStatus.allowed) {
      await AuditLogger.logAuthEvent('auth_failed', { email }, false, 'Rate limit exceeded');
      throw new Error(`Too many attempts. Please try again in ${rateLimitStatus.retryAfter} seconds.`);
    }

    try {
      const result = await auth.signUp(email, password, fullName);
      
      if (result.error) {
        await AuditLogger.logAuthEvent('auth_failed', { email }, false, result.error.message);
        throw result.error;
      } else {
        RateLimiter.recordSuccess(identifier, 'auth');
        await AuditLogger.logAuthEvent('auth_signup', { 
          email,
          device_fingerprint: SessionManager.getDeviceFingerprint()
        });
      }
      
      return result;
    } catch (error) {
      await AuditLogger.logAuthEvent('auth_failed', { email }, false, error.message);
      throw error;
    }
  };

  const secureSignOut = async () => {
    if (auth.user) {
      await AuditLogger.logAuthEvent('auth_signout', { 
        user_id: auth.user.id,
        email: auth.user.email 
      });
    }
    
    SessionManager.clearSecureSession();
    await auth.signOut();
  };

  return {
    ...auth,
    signIn: secureSignIn,
    signUp: secureSignUp,
    signOut: secureSignOut,
    rateLimitStatus: auth.user ? RateLimiter.getStatus(auth.user.email || '', 'auth') : null
  };
};
