
import { RateLimiter, RateLimiterConfig } from "./types";

// Configure rate limits for various operations
const DEFAULT_RATE_LIMIT: RateLimiterConfig = {
  maxRequests: 100,  // Max requests per window
  windowMs: 60000    // Window size in milliseconds (1 minute)
};

// Rate limiters for different operations
export const contactsRateLimiter: RateLimiter = {};
export const authRateLimiter: RateLimiter = {};
export const userRateLimiter: RateLimiter = {};

// Pre-defined rate limiters for specific operations
const createContactLimit: RateLimiterConfig = {
  maxRequests: 20,  // Allow 20 contact creations
  windowMs: 60000   // Per minute
};

const deleteContactLimit: RateLimiterConfig = {
  maxRequests: 10,  // Allow 10 contact deletions
  windowMs: 60000   // Per minute
};

// Generic rate limiting function
export function applyRateLimiting(
  operation: string = "generic",
  userId: string = "anonymous"
): void {
  const key = `${userId}:${operation}`;
  const now = Date.now();
  
  // Use specific rate limiter based on operation
  let rateLimiter = contactsRateLimiter;
  let config = DEFAULT_RATE_LIMIT;
  
  // Special case configurations
  if (operation === 'create_contact') {
    config = createContactLimit;
  } else if (operation === 'delete_contact') {
    config = deleteContactLimit;
  } else if (operation.includes('auth')) {
    rateLimiter = authRateLimiter;
  } else if (operation.includes('user')) {
    rateLimiter = userRateLimiter;
  }
  
  // Get current rate limiting data
  const data = rateLimiter[key] || { count: 0, resetTime: now + config.windowMs };
  
  // Reset if window expired
  if (now > data.resetTime) {
    data.count = 1;
    data.resetTime = now + config.windowMs;
  } else {
    data.count++;
  }
  
  // Save updated data
  rateLimiter[key] = data;
  
  // Check if rate limit exceeded
  if (data.count > config.maxRequests) {
    const retryAfter = Math.ceil((data.resetTime - now) / 1000);
    throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
  }
}

// Helper function that checks rate limit without incrementing
export function checkRateLimit(rateLimiter: RateLimiter, userId: string, operation: string = "generic"): void {
  const key = `${userId}:${operation}`;
  const now = Date.now();
  const data = rateLimiter[key];
  
  // If no data exists or window has expired, no limit is being hit
  if (!data || now > data.resetTime) {
    return;
  }
  
  // Check if rate limit exceeded
  const config = DEFAULT_RATE_LIMIT; // Default config, can be made more specific
  if (data.count > config.maxRequests) {
    const retryAfter = Math.ceil((data.resetTime - now) / 1000);
    throw new Error(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
  }
}
