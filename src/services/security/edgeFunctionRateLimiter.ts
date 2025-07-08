// Rate limiting utilities for edge functions
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (req: Request) => string | Promise<string>;
}

export class EdgeFunctionRateLimiter {
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor(private config: RateLimitConfig) {}

  async checkRateLimit(req: Request, userId?: string): Promise<{ allowed: boolean; resetTime?: number }> {
    const key = this.config.keyGenerator 
      ? await this.config.keyGenerator(req)
      : userId || this.getClientIP(req);

    if (!key) {
      return { allowed: false };
    }

    const now = Date.now();
    const userRateData = this.rateLimitMap.get(key);
    
    if (!userRateData || now > userRateData.resetTime) {
      // Reset or initialize rate limit
      this.rateLimitMap.set(key, { 
        count: 1, 
        resetTime: now + this.config.windowMs 
      });
      return { allowed: true, resetTime: now + this.config.windowMs };
    }
    
    if (userRateData.count >= this.config.maxRequests) {
      return { 
        allowed: false, 
        resetTime: userRateData.resetTime 
      };
    }
    
    userRateData.count++;
    return { allowed: true, resetTime: userRateData.resetTime };
  }

  private getClientIP(req: Request): string {
    // Try to get real IP from headers (for deployments behind proxies)
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const xRealIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    
    return cfConnectingIP || xRealIP || (xForwardedFor?.split(',')[0]) || 'unknown';
  }

  // Security event logging
  logSecurityEvent(event: string, details: any) {
    console.log(`[SECURITY] ${event}:`, {
      timestamp: new Date().toISOString(),
      ...details
    });
  }

  // Clean up old entries periodically
  cleanup() {
    const now = Date.now();
    for (const [key, data] of this.rateLimitMap.entries()) {
      if (now > data.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}

// Predefined rate limiters for different function types
export const gmailRateLimiter = new EdgeFunctionRateLimiter({
  maxRequests: 10,
  windowMs: 60000, // 1 minute
});

export const twitterRateLimiter = new EdgeFunctionRateLimiter({
  maxRequests: 5,
  windowMs: 60000, // 1 minute
});

export const calendarRateLimiter = new EdgeFunctionRateLimiter({
  maxRequests: 15,
  windowMs: 60000, // 1 minute
});

export const aiRateLimiter = new EdgeFunctionRateLimiter({
  maxRequests: 20,
  windowMs: 60000, // 1 minute
});

export const generalRateLimiter = new EdgeFunctionRateLimiter({
  maxRequests: 30,
  windowMs: 60000, // 1 minute
});

// Helper to create rate limit response
export function createRateLimitResponse(resetTime?: number) {
  const resetInSeconds = resetTime ? Math.ceil((resetTime - Date.now()) / 1000) : 60;
  
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded',
      message: `Too many requests. Try again in ${resetInSeconds} seconds.`,
      resetIn: resetInSeconds
    }), 
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': resetInSeconds.toString(),
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': resetTime ? Math.ceil(resetTime / 1000).toString() : ''
      }
    }
  );
}