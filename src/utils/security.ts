
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

/**
 * Security utility functions for the application
 */

/**
 * Validates that the provided input doesn't contain any potentially dangerous content
 * @param input The user input to sanitize
 * @returns Sanitized input string
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Basic sanitization to prevent XSS
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/`/g, '&#x60;');
}

/**
 * Checks if a user's session is valid and not expired
 * @returns Promise resolving to boolean indicating if session is valid
 */
export async function validateSession(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Session validation error:", error);
      return false;
    }
    
    if (!data.session) {
      return false;
    }
    
    // Check if session has expired
    const expiresAt = data.session.expires_at;
    if (expiresAt) {
      // expires_at is in seconds since epoch, Date.now() is in milliseconds
      const expiresAtMs = expiresAt * 1000;
      if (Date.now() >= expiresAtMs) {
        console.warn("Session has expired");
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error validating session:", error);
    return false;
  }
}

/**
 * Safely destructures user object to prevent accessing undefined properties
 * @param user User object from Supabase
 * @returns Safe user object with default values for missing properties
 */
export function getSafeUser(user: User | null): Partial<User> {
  if (!user) return {};
  
  // Only extract the properties we need, with safe defaults
  return {
    id: user.id,
    email: user.email || '',
    app_metadata: user.app_metadata || {},
    user_metadata: user.user_metadata || {},
  };
}

/**
 * Throttles requests to prevent abuse
 * Simple implementation that can be expanded
 */
export class RateLimiter {
  private requests: Record<string, number[]> = {};
  private maxRequests: number;
  private timeWindow: number; // in milliseconds

  constructor(maxRequests = 10, timeWindowSeconds = 60) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }

  /**
   * Checks if a request from the given identifier should be allowed
   * @param identifier Unique identifier for the requester (e.g., user ID, IP address)
   * @returns Boolean indicating if the request is allowed
   */
  public allowRequest(identifier: string): boolean {
    const now = Date.now();
    if (!this.requests[identifier]) {
      this.requests[identifier] = [];
    }

    // Filter out expired timestamps
    this.requests[identifier] = this.requests[identifier].filter(
      timestamp => now - timestamp < this.timeWindow
    );

    // Check if under the limit
    if (this.requests[identifier].length < this.maxRequests) {
      this.requests[identifier].push(now);
      return true;
    }

    return false;
  }
}

/**
 * Error handler that doesn't expose sensitive information
 * @param error Error object
 * @returns Sanitized error message
 */
export function handleError(error: unknown): string {
  // Generic error for production
  const genericError = "An error occurred. Please try again later.";

  // For development, log the actual error but return a generic message
  console.error("Application error:", error);

  // In a development environment, you might want to return more details
  if (process.env.NODE_ENV === 'development') {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  return genericError;
}
