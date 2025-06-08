
import { RateLimiter } from './rateLimiter';

interface AdvancedRateLimit {
  attempts: number;
  firstAttempt: number;
  blockedUntil?: number;
  suspiciousActivity: boolean;
  lastAttemptInterval: number[];
}

export class AdvancedRateLimiter extends RateLimiter {
  private static advancedStorage = new Map<string, AdvancedRateLimit>();
  
  // Define configs locally since we can't access private parent configs
  private static advancedConfigs = {
    auth: { maxAttempts: 5, windowMs: 15 * 60 * 1000, blockDurationMs: 30 * 60 * 1000 },
    api_calls: { maxAttempts: 100, windowMs: 60 * 1000, blockDurationMs: 5 * 60 * 1000 },
    contact_creation: { maxAttempts: 10, windowMs: 60 * 1000, blockDurationMs: 2 * 60 * 1000 }
  };

  // Progressive rate limiting with suspicion detection
  static isAllowedAdvanced(
    identifier: string, 
    type: keyof typeof AdvancedRateLimiter['advancedConfigs'],
    requestPattern?: { userAgent?: string; endpoint?: string }
  ): { allowed: boolean; retryAfter?: number; suspicious?: boolean } {
    const config = this.advancedConfigs[type];
    const key = `${type}:${identifier}`;
    const now = Date.now();
    
    let entry = this.advancedStorage.get(key);
    
    // Check if currently blocked
    if (entry?.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        retryAfter: Math.ceil((entry.blockedUntil - now) / 1000),
        suspicious: entry.suspiciousActivity
      };
    }
    
    // Initialize or reset entry if outside time window
    if (!entry || (now - entry.firstAttempt) > config.windowMs) {
      entry = {
        attempts: 1,
        firstAttempt: now,
        suspiciousActivity: false,
        lastAttemptInterval: [now]
      };
      this.advancedStorage.set(key, entry);
      return { allowed: true };
    }
    
    // Track request intervals for suspicious activity detection
    entry.lastAttemptInterval.push(now);
    if (entry.lastAttemptInterval.length > 10) {
      entry.lastAttemptInterval = entry.lastAttemptInterval.slice(-10);
    }
    
    // Detect suspicious patterns
    const intervals = entry.lastAttemptInterval.slice(1).map((time, i) => 
      time - entry.lastAttemptInterval[i]
    );
    
    // Check for bot-like behavior (too regular intervals)
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, interval) => 
      acc + Math.pow(interval - avgInterval, 2), 0
    ) / intervals.length;
    
    if (variance < 100 && intervals.length > 5) { // Very regular timing
      entry.suspiciousActivity = true;
    }
    
    // Check for rapid-fire requests
    if (intervals.some(interval => interval < 100)) { // Less than 100ms between requests
      entry.suspiciousActivity = true;
    }
    
    // Check user agent patterns
    if (requestPattern?.userAgent) {
      const suspiciousAgents = ['bot', 'crawler', 'spider', 'scraper'];
      if (suspiciousAgents.some(agent => 
        requestPattern.userAgent?.toLowerCase().includes(agent)
      )) {
        entry.suspiciousActivity = true;
      }
    }
    
    entry.attempts++;
    
    // Apply stricter limits for suspicious activity
    const effectiveMaxAttempts = entry.suspiciousActivity ? 
      Math.floor(config.maxAttempts / 2) : config.maxAttempts;
    
    // Check if exceeded max attempts
    if (entry.attempts > effectiveMaxAttempts) {
      const blockDuration = entry.suspiciousActivity ? 
        config.blockDurationMs * 2 : config.blockDurationMs;
        
      entry.blockedUntil = now + blockDuration;
      this.advancedStorage.set(key, entry);
      
      return {
        allowed: false,
        retryAfter: Math.ceil(blockDuration / 1000),
        suspicious: entry.suspiciousActivity
      };
    }
    
    this.advancedStorage.set(key, entry);
    return { 
      allowed: true, 
      suspicious: entry.suspiciousActivity 
    };
  }

  // Get detailed status including suspicious activity
  static getAdvancedStatus(identifier: string, type: keyof typeof AdvancedRateLimiter['advancedConfigs']) {
    const baseStatus = this.getStatus(identifier, type);
    const key = `${type}:${identifier}`;
    const advancedEntry = this.advancedStorage.get(key);
    
    return {
      ...baseStatus,
      suspiciousActivity: advancedEntry?.suspiciousActivity || false,
      requestPattern: advancedEntry?.lastAttemptInterval || [],
      riskLevel: advancedEntry?.suspiciousActivity ? 'high' : 'low'
    };
  }

  // Enhanced cleanup for advanced storage
  static cleanupAdvanced(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.advancedStorage.entries()) {
      const configKey = key.split(':')[0] as keyof typeof this.advancedConfigs;
      const config = this.advancedConfigs[configKey];
      if (config && (now - entry.firstAttempt) > Math.max(config.windowMs, config.blockDurationMs)) {
        this.advancedStorage.delete(key);
      }
    }
    
    // Also run base cleanup
    this.cleanup();
  }
}

// Enhanced cleanup every 3 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    AdvancedRateLimiter.cleanupAdvanced();
  }, 3 * 60 * 1000);
}
