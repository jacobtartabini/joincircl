
import { supabase } from "@/integrations/supabase/client";
import { deleteAdapter } from "./adapters/deleteAdapter";
import { fetchAdapter } from "./adapters/fetchAdapter";
import { insertAdapter } from "./adapters/insertAdapter";
import { updateAdapter } from "./adapters/updateAdapter";
import { SecureApiServiceOptions } from "./types";
import { rateLimiter } from "./rateLimiting";
import { validateRequest } from "./validators";

/**
 * SecureApiService - A secure service for handling API requests with validation,
 * rate limiting, and error handling
 */
export const secureApiService = {
  /**
   * Fetch data securely from Supabase
   */
  fetch: fetchAdapter,

  /**
   * Insert data securely into Supabase
   */
  insert: insertAdapter,

  /**
   * Update data securely in Supabase
   */
  update: updateAdapter,

  /**
   * Delete data securely from Supabase
   */
  delete: deleteAdapter,

  /**
   * Validates user session and refreshes if close to expiration
   * @returns True if session is valid, false otherwise
   */
  validateSession: async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error || !data.session) {
        console.log("No valid session found");
        return false;
      }
      
      // Check if session will expire soon (within the next hour)
      const expiresAt = data.session.expires_at;
      if (expiresAt) {
        const expiresAtMs = expiresAt * 1000; // Convert to milliseconds
        const oneHourFromNow = Date.now() + (60 * 60 * 1000);
        
        if (expiresAtMs < oneHourFromNow) {
          console.log("Session will expire soon, refreshing...");
          // Refresh session
          const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
          
          if (refreshError) {
            console.error("Failed to refresh session:", refreshError);
            return false;
          }
          
          console.log("Session refreshed successfully");
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error validating session:", error);
      return false;
    }
  },

  /**
   * Extends session duration during sign in (when keep me signed in is selected)
   * @param options Session configuration options
   * @returns Session setup result
   */
  extendSession: async (keepMeSignedIn: boolean): Promise<void> => {
    if (keepMeSignedIn) {
      const extendedExpirySeconds = 60 * 60 * 24 * 30; // 30 days in seconds
      
      try {
        // Update session expiry time
        await supabase.auth.setSession({
          refresh_token: (await supabase.auth.getSession()).data.session?.refresh_token || '',
          access_token: (await supabase.auth.getSession()).data.session?.access_token || '',
          expires_in: extendedExpirySeconds
        });
        
        console.log("Session extended to 30 days");
      } catch (error) {
        console.error("Error extending session:", error);
      }
    }
  }
};
