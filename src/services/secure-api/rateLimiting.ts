
import { RateLimiter } from "@/utils/security";

// Create rate limiters for different API endpoints
export const contactsRateLimiter = new RateLimiter(20, 60); // 20 requests per minute
export const generalRateLimiter = new RateLimiter(50, 60); // 50 requests per minute

/**
 * Check if a request should be allowed based on rate limits
 * @param limiter The rate limiter to use
 * @param userId The user ID to check
 * @returns Boolean indicating if request is allowed
 * @throws Error if rate limit is exceeded
 */
export function checkRateLimit(limiter: RateLimiter, userId: string): boolean {
  if (!limiter.allowRequest(userId)) {
    throw new Error("Too many requests. Please try again later.");
  }
  return true;
}
