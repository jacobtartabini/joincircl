// Re-export all security services for easy importing
export { InputValidator } from './inputValidator';
export { RateLimiter } from './rateLimiter';
export { AuditLogger } from './auditLogger';
export { SessionManager } from './sessionManager';
export { Enhanced2FA } from '../enhanced2FA';

// Additional security exports
export { EnhancedInputValidator } from './enhancedInputValidator';
export { SecurityHeaders } from './securityHeaders';
export { AdvancedRateLimiter } from './advancedRateLimiter';
export { SecurityMonitor } from './securityMonitor';

// Security utilities
export const SecurityUtils = {
  // Generate secure random string
  generateSecureToken: (length: number = 32): string => {
    if (typeof window !== 'undefined' && window.crypto) {
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    
    // Fallback for environments without crypto API
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Constant-time string comparison
  constantTimeCompare: (a: string, b: string): boolean => {
    if (a.length !== b.length) return false;
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  },

  // Check if environment is secure (HTTPS)
  isSecureContext: (): boolean => {
    if (typeof window === 'undefined') return true; // Assume server is secure
    return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  },

  // Validate password strength
  validatePasswordStrength: (password: string): { 
    score: number; 
    feedback: string[];
    isStrong: boolean;
  } => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score++;
    else feedback.push('Use at least 8 characters');

    if (/[a-z]/.test(password)) score++;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score++;
    else feedback.push('Include numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Include special characters');

    if (password.length >= 12) score++;

    return {
      score,
      feedback,
      isStrong: score >= 4
    };
  }
};
