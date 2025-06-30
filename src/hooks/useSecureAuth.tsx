
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RateLimiter } from '@/services/security/simpleRateLimiter';
import { AuditLogger } from '@/services/security/simpleAuditLogger';
import { useToast } from '@/hooks/use-toast';

export const useSecureAuth = () => {
  const auth = useAuth();
  const { toast } = useToast();
  const [sessionWarningShown, setSessionWarningShown] = useState(false);

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
          email
        });
      }
      
      return result;
    } catch (error: any) {
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
          email
        });
      }
      
      return result;
    } catch (error: any) {
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
