
import { supabase } from "@/integrations/supabase/client";
import { deleteAdapter } from "./adapters/deleteAdapter";
import { fetchAdapter } from "./adapters/fetchAdapter";
import { insertAdapter } from "./adapters/insertAdapter";
import { updateAdapter } from "./adapters/updateAdapter";
import { FetchOptions, MutationOptions, TableName } from "./types";
import { applyRateLimiting } from "./rateLimiting";
import { validateRequestParams } from "./validators";

/**
 * SecureApiService - A secure service for handling API requests with validation,
 * rate limiting, and error handling
 */
export const secureApiService = {
  /**
   * Fetch data securely from Supabase
   */
  fetch: async function<T>(table: TableName, options: FetchOptions = {}) {
    validateRequestParams(table, options);
    return fetchAdapter<T>(table, options);
  },

  /**
   * Insert data securely into Supabase
   */
  insert: async function<T>(table: TableName, data: T, options: MutationOptions = {}) {
    validateRequestParams(table, options);
    
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user.id) {
      return { data: null, error: new Error('User not authenticated') };
    }
    
    try {
      const result = await insertAdapter.insertData(table, session.data.session.user.id, data);
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Update data securely in Supabase
   */
  update: async function<T>(table: TableName, data: Partial<T>, options: MutationOptions = {}) {
    validateRequestParams(table, options);
    
    if (!options.column || options.column !== 'id' || !options.value) {
      return { data: null, error: new Error('Update requires an ID') };
    }
    
    const id = options.value;
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user.id) {
      return { data: null, error: new Error('User not authenticated') };
    }
    
    try {
      const result = await updateAdapter.updateData(table, session.data.session.user.id, id as string, data);
      return { data: result, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  },

  /**
   * Delete data securely from Supabase
   */
  delete: async function(table: TableName, options: MutationOptions = {}) {
    validateRequestParams(table, options);
    
    if (!options.column || options.column !== 'id' || !options.value) {
      return { error: new Error('Delete requires an ID') };
    }
    
    const id = options.value;
    const session = await supabase.auth.getSession();
    if (!session.data.session?.user.id) {
      return { error: new Error('User not authenticated') };
    }
    
    try {
      await deleteAdapter.deleteData(table, session.data.session.user.id, id as string);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  },

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
          const { error: refreshError } = await supabase.auth.refreshSession();
          
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
   * Extends session duration (simplified implementation without "Keep me signed in" feature)
   * @returns Session setup result
   */
  extendSession: async (): Promise<void> => {
    try {
      // Just check the current session
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        console.error("No session found");
        return;
      }
      
      // We'll still refresh the session if needed
      await supabase.auth.refreshSession();
    } catch (error) {
      console.error("Error with session:", error);
    }
  }
};
