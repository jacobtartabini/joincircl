
export class RateLimiter {
  private static storage = new Map<string, { attempts: number; lastAttempt: number; blockedUntil?: number }>();

  static isAllowed(identifier: string, action: string, maxAttempts: number = 5, windowMs: number = 900000): { allowed: boolean; retryAfter?: number } {
    const key = `${identifier}:${action}`;
    const now = Date.now();
    const entry = this.storage.get(key);

    if (!entry) {
      this.storage.set(key, { attempts: 1, lastAttempt: now });
      return { allowed: true };
    }

    // If blocked, check if block period has expired
    if (entry.blockedUntil && now < entry.blockedUntil) {
      return { 
        allowed: false, 
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
      };
    }

    // Reset if window has expired
    if (now - entry.lastAttempt > windowMs) {
      this.storage.set(key, { attempts: 1, lastAttempt: now });
      return { allowed: true };
    }

    // Check if max attempts exceeded
    if (entry.attempts >= maxAttempts) {
      const blockedUntil = now + windowMs;
      this.storage.set(key, { 
        ...entry, 
        blockedUntil,
        lastAttempt: now
      });
      return { 
        allowed: false, 
        retryAfter: Math.ceil(windowMs / 1000)
      };
    }

    // Increment attempts
    this.storage.set(key, { 
      ...entry, 
      attempts: entry.attempts + 1,
      lastAttempt: now
    });

    return { allowed: true };
  }

  static recordSuccess(identifier: string, action: string) {
    const key = `${identifier}:${action}`;
    this.storage.delete(key);
  }

  static getStatus(identifier: string, action: string) {
    const key = `${identifier}:${action}`;
    const entry = this.storage.get(key);
    
    if (!entry) {
      return { attempts: 0, maxAttempts: 5, blockedUntil: null };
    }

    return {
      attempts: entry.attempts,
      maxAttempts: 5,
      blockedUntil: entry.blockedUntil || null
    };
  }
}
