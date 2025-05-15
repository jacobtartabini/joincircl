
// Simple rate limiting implementation for API calls

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requestLimits: Map<string, RateLimitInfo> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = 10, windowSeconds = 60) {
    this.maxRequests = maxRequests;
    this.windowMs = windowSeconds * 1000;
  }

  /**
   * Check if a request should be allowed under rate limits
   * @param identifier Unique identifier for the requester (e.g., user ID, IP)
   * @returns True if request is allowed, false if rate limited
   */
  public allowRequest(identifier: string): boolean {
    const now = Date.now();
    const info = this.requestLimits.get(identifier);

    // First request from this identifier
    if (!info) {
      this.requestLimits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Reset if window has passed
    if (now > info.resetTime) {
      this.requestLimits.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return true;
    }

    // Check if under limit
    if (info.count < this.maxRequests) {
      info.count++;
      this.requestLimits.set(identifier, info);
      return true;
    }

    // Rate limited
    return false;
  }
  
  /**
   * Get remaining requests for an identifier
   * @param identifier Unique identifier
   * @returns Number of remaining requests, or max if not found
   */
  public getRemainingRequests(identifier: string): number {
    const now = Date.now();
    const info = this.requestLimits.get(identifier);
    
    if (!info || now > info.resetTime) {
      return this.maxRequests;
    }
    
    return Math.max(0, this.maxRequests - info.count);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
