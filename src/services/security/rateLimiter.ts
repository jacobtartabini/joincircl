
interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitEntry {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
}

export class RateLimiter {
  private static storage = new Map<string, RateLimitEntry>();
  
  private static configs: Record<string, RateLimitConfig> = {
    auth: {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 30 * 60 * 1000, // 30 minutes
    },
    contact_operations: {
      maxAttempts: 10,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 5 * 60 * 1000, // 5 minutes
    },
    api_calls: {
      maxAttempts: 100,
      windowMs: 60 * 1000, // 1 minute
      blockDurationMs: 60 * 1000, // 1 minute
    }
  };

  static isAllowed(identifier: string, type: keyof typeof this.configs): { allowed: boolean; retryAfter?: number } {
    const config = this.configs[type];
    const key = `${type}:${identifier}`;
    const now = Date.now();
    
    let entry = this.storage.get(key);
    
    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      };
    }
    
    // Reset entry if outside time window
    if (!entry || (now - entry.firstAttempt) > config.windowMs) {
      entry = {
        attempts: 1,
        firstAttempt: now
      };
      this.storage.set(key, entry);
      return { allowed: true };
    }
    
    // Increment attempts
    entry.attempts++;
    
    // Check if exceeded max attempts
    if (entry.attempts > config.maxAttempts) {
      entry.blockedUntil = now + config.blockDurationMs;
      this.storage.set(key, entry);
      return {
        allowed: false,
        retryAfter: Math.ceil(config.blockDurationMs / 1000)
      };
    }
    
    this.storage.set(key, entry);
    return { allowed: true };
  }

  static recordSuccess(identifier: string, type: keyof typeof this.configs): void {
    const key = `${type}:${identifier}`;
    this.storage.delete(key);
  }

  static cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.storage.entries()) {
      const config = this.configs[key.split(':')[0] as keyof typeof this.configs];
      if (config && (now - entry.firstAttempt) > Math.max(config.windowMs, config.blockDurationMs)) {
        this.storage.delete(key);
      }
    }
  }

  // Get current status for UI feedback
  static getStatus(identifier: string, type: keyof typeof this.configs): { 
    attempts: number; 
    maxAttempts: number; 
    blockedUntil?: number;
    timeRemaining?: number;
  } {
    const config = this.configs[type];
    const key = `${type}:${identifier}`;
    const entry = this.storage.get(key);
    const now = Date.now();
    
    if (!entry) {
      return { attempts: 0, maxAttempts: config.maxAttempts };
    }
    
    return {
      attempts: entry.attempts,
      maxAttempts: config.maxAttempts,
      blockedUntil: entry.blockedUntil,
      timeRemaining: entry.blockedUntil ? Math.max(0, entry.blockedUntil - now) : undefined
    };
  }
}

// Cleanup old entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    RateLimiter.cleanup();
  }, 5 * 60 * 1000);
}
