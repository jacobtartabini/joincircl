
// Rate limiter for general API calls
let lastApiCall = 0;
const MIN_API_CALL_INTERVAL = 500; // 500ms minimum between API calls

// Rate limiter for contact-related operations
interface RateLimiter {
  operations: Map<string, number[]>;
  maxOperations: number;
  timeWindowMs: number;
}

// Create a rate limiter for contacts operations
export const contactsRateLimiter: RateLimiter = {
  operations: new Map(),
  maxOperations: 5,  // Max 5 operations
  timeWindowMs: 60000 // Within 1 minute
};

export async function applyRateLimiting(): Promise<void> {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  
  if (timeSinceLastCall < MIN_API_CALL_INTERVAL) {
    // Wait for the remaining time to respect rate limiting
    const waitTime = MIN_API_CALL_INTERVAL - timeSinceLastCall;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  // Update last API call timestamp
  lastApiCall = Date.now();
}

export function checkRateLimit(limiter: RateLimiter, userId: string): void {
  const now = Date.now();
  const userKey = `user-${userId}`;
  
  // Get or initialize user's operation timestamps
  let timestamps = limiter.operations.get(userKey) || [];
  
  // Filter out timestamps outside the time window
  timestamps = timestamps.filter(time => now - time < limiter.timeWindowMs);
  
  // Check if rate limit exceeded
  if (timestamps.length >= limiter.maxOperations) {
    const oldestTimestamp = timestamps[0];
    const resetTime = oldestTimestamp + limiter.timeWindowMs - now;
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`);
  }
  
  // Add current timestamp and update the map
  timestamps.push(now);
  limiter.operations.set(userKey, timestamps);
}
