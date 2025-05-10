
import { supabase } from "@/integrations/supabase/client";
import { TableName, DataRecord } from "./types";
import { isValidUuid, sanitizeDataObject, validateOwnership } from "./validators";
import { contactsRateLimiter, generalRateLimiter, checkRateLimit } from "./rateLimiting";
import { handleDataOperationError } from "./errorHandling";

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
  async fetchData<T = DataRecord>(table: TableName, userId: string | undefined): Promise<T[]> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    checkRateLimit(generalRateLimiter, userId);
    
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('user_id', userId);
        
      if (error) throw error;
      
      // First convert to unknown then to T[] to avoid deep type instantiation
      return (data || []) as unknown as T[];
    } catch (error: any) {
      throw handleDataOperationError('fetching from', table, error);
    }
  },
  
  /**
   * Securely insert data with proper validation
   * @param table The table to insert into
   * @param userId The user ID for ownership and rate limiting
   * @param data The data to insert
   * @returns Promise with the inserted data or error
   */
  async insertData<T = DataRecord>(table: TableName, userId: string | undefined, data: Record<string, any>): Promise<T> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    checkRateLimit(contactsRateLimiter, userId);
    
    // Apply sanitization to string fields
    const sanitizedData = sanitizeDataObject(data);
    
    // Ensure user_id is set
    sanitizedData.user_id = userId;
    
    try {
      // Use the array format for insert as required by supabase
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert([sanitizedData]) // Use array format as expected by Supabase
        .select();
        
      if (error) throw error;
      
      if (!insertedData || insertedData.length === 0) {
        throw new Error("Failed to insert data: No data returned");
      }
      
      // First convert to unknown then to T to avoid deep type instantiation
      return insertedData[0] as unknown as T;
    } catch (error: any) {
      throw handleDataOperationError('inserting into', table, error);
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
  async updateData<T = DataRecord>(table: TableName, userId: string | undefined, id: string, data: Record<string, any>): Promise<T> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    checkRateLimit(contactsRateLimiter, userId);
    
    // Safe ID validation (UUID format)
    if (!isValidUuid(id)) {
      throw new Error("Invalid ID format");
    }
    
    // Apply sanitization to string fields
    const sanitizedData = sanitizeDataObject(data);
    
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
      
      if (!existingData) {
        throw new Error("Resource not found");
      }
      
      // Type check for existingData
      if (typeof existingData !== 'object') {
        throw new Error("Invalid resource data");
      }
      
      // Proper null check before accessing properties
      if (!existingData || !('user_id' in existingData)) {
        throw new Error("Invalid resource data structure");
      }
      
      // Safely access user_id with proper type checking
      const resourceUserId = existingData.user_id;
      
      if (typeof resourceUserId !== 'string') {
        throw new Error("Invalid resource user ID");
      }
      
      // Validate ownership with type-safe property access
      if (!validateOwnership(resourceUserId, userId)) {
        throw new Error("You don't have permission to update this resource");
      }
      
      // Proceed with update
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(sanitizedData)
        .eq('id', id)
        .select();
        
      if (error) throw error;
      
      if (!updatedData || updatedData.length === 0) {
        throw new Error("Failed to update data: No data returned");
      }
      
      // First convert to unknown then to T to avoid deep type instantiation
      return updatedData[0] as unknown as T;
    } catch (error: any) {
      throw handleDataOperationError('updating', table, error);
    }
  },
  
  /**
   * Securely delete data with ownership verification
   * @param table The table to delete from
   * @param userId The user ID for ownership verification
   * @param id The record ID to delete
   * @returns Promise with success status
   */
  async deleteData(table: TableName, userId: string | undefined, id: string): Promise<boolean> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    // Apply rate limiting
    checkRateLimit(contactsRateLimiter, userId);
    
    // Safe ID validation (UUID format)
    if (!isValidUuid(id)) {
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
      
      if (!existingData) {
        throw new Error("Resource not found");
      }
      
      // Proper null check before accessing properties
      if (!existingData || !('user_id' in existingData)) {
        throw new Error("Invalid resource data structure");
      }
      
      // Safely access user_id with proper type checking
      const resourceUserId = existingData.user_id;
      
      if (typeof resourceUserId !== 'string') {
        throw new Error("Invalid resource user ID");
      }
      
      // Validate ownership with type-safe property access
      if (!validateOwnership(resourceUserId, userId)) {
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
      throw handleDataOperationError('deleting from', table, error);
    }
  }
};
