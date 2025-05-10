
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, RateLimiter } from "@/utils/security";
import type { PostgrestQueryBuilder } from "@supabase/supabase-js";

// Create rate limiters for different API endpoints
const contactsRateLimiter = new RateLimiter(20, 60); // 20 requests per minute
const generalRateLimiter = new RateLimiter(50, 60); // 50 requests per minute

// Helper type for allowed table names
type TableName = "contacts" | "interactions" | "keystones" | "profiles" | "contact_media" | "user_calendar_tokens";

/**
 * A secure service for making API calls with proper validation,
 * rate limiting, and error handling
 */
export const secureApiService = {
  /**
   * Securely fetch data from Supabase with rate limiting and validation
   * @param table The table to fetch from
   * @param userId The user ID for rate limiting and access control
   * @returns Promise with the data or error
   */
  async fetchData(table: TableName, userId: string | undefined) {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    if (!generalRateLimiter.allowRequest(userId || 'anonymous')) {
      throw new Error("Too many requests. Please try again later.");
    }
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Error fetching from ${table}:`, error);
      throw new Error(`Failed to fetch data: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Securely insert data with proper validation
   * @param table The table to insert into
   * @param userId The user ID for ownership and rate limiting
   * @param data The data to insert
   * @returns Promise with the inserted data or error
   */
  async insertData(table: TableName, userId: string | undefined, data: any) {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    if (!contactsRateLimiter.allowRequest(userId)) {
      throw new Error("Too many requests. Please try again later.");
    }
    
    // Apply sanitization to string fields
    const sanitizedData = { ...data };
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = sanitizeInput(sanitizedData[key]);
      }
    });
    
    // Ensure user_id is set
    sanitizedData.user_id = userId;
    
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert([sanitizedData])
        .select();
        
      if (error) throw error;
      return insertedData;
    } catch (error: any) {
      console.error(`Error inserting into ${table}:`, error);
      throw new Error(`Failed to save data: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Securely update data with proper validation
   * @param table The table to update
   * @param userId The user ID for ownership verification
   * @param id The record ID to update
   * @param data The data to update
   * @returns Promise with the updated data or error
   */
  async updateData(table: TableName, userId: string | undefined, id: string, data: any) {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    if (!contactsRateLimiter.allowRequest(userId)) {
      throw new Error("Too many requests. Please try again later.");
    }
    
    // Safe ID validation (UUID format)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error("Invalid ID format");
    }
    
    // Apply sanitization to string fields
    const sanitizedData = { ...data };
    Object.keys(sanitizedData).forEach(key => {
      if (typeof sanitizedData[key] === 'string') {
        sanitizedData[key] = sanitizeInput(sanitizedData[key]);
      }
    });
    
    // Never allow changing user_id
    delete sanitizedData.user_id;
    
    try {
      // First verify ownership
      const { data: existingData, error: fetchError } = await supabase
        .from(table)
        .select('user_id')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Double-check ownership (even though RLS would prevent this, it's a good practice)
      if (!existingData || existingData.user_id !== userId) {
        throw new Error("You don't have permission to update this resource");
      }
      
      // Proceed with update
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(sanitizedData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      return updatedData;
    } catch (error: any) {
      console.error(`Error updating ${table}:`, error);
      throw new Error(`Failed to update data: ${error.message || 'Unknown error'}`);
    }
  },
  
  /**
   * Securely delete data with ownership verification
   * @param table The table to delete from
   * @param userId The user ID for ownership verification
   * @param id The record ID to delete
   * @returns Promise with success status
   */
  async deleteData(table: TableName, userId: string | undefined, id: string) {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    if (!contactsRateLimiter.allowRequest(userId)) {
      throw new Error("Too many requests. Please try again later.");
    }
    
    // Safe ID validation (UUID format)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      throw new Error("Invalid ID format");
    }
    
    try {
      // First verify ownership
      const { data: existingData, error: fetchError } = await supabase
        .from(table)
        .select('user_id')
        .eq('id', id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Double-check ownership
      if (!existingData || existingData.user_id !== userId) {
        throw new Error("You don't have permission to delete this resource");
      }
      
      // Proceed with delete
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error(`Error deleting from ${table}:`, error);
      throw new Error(`Failed to delete: ${error.message || 'Unknown error'}`);
    }
  }
};
