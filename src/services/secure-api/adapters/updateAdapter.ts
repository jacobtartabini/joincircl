
import { supabase } from "@/integrations/supabase/client";
import { TableName, DataRecord, UserOwnedRecord } from "../types";
import { isValidUuid, sanitizeDataObject, validateOwnership } from "../validators";
import { applyRateLimiting } from "../rateLimiting";
import { handleDataOperationError } from "../errorHandling";

// Simple type for records
type AnyRecord = Record<string, any>;

/**
 * Adapter for update operations
 */
export const updateAdapter = {
  /**
   * Securely update data with proper validation
   * @param table The table to update
   * @param userId The user ID for ownership verification
   * @param id The record ID to update
   * @param data The data to update
   * @returns Promise with the updated data or error
   */
  async updateData<T extends DataRecord>(table: TableName, userId: string, id: string, data: AnyRecord): Promise<T> {
    // Apply rate limiting
    applyRateLimiting("update", userId);
    
    // Safe ID validation (UUID format)
    if (!isValidUuid(id)) {
      throw new Error("Invalid ID format");
    }
    
    // Apply sanitization to string fields
    const sanitizedData = sanitizeDataObject(data);
    
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
      
      // Runtime check to ensure existingData is an object with user_id
      if (typeof existingData !== 'object' || !existingData) {
        throw new Error("Invalid resource data structure");
      }
      
      // Runtime check to ensure user_id exists
      if (!('user_id' in existingData)) {
        throw new Error("Invalid resource structure: missing user_id");
      }
      
      const resourceUserId = (existingData as UserOwnedRecord).user_id;
      
      // Validate ownership
      if (!validateOwnership(resourceUserId, userId)) {
        throw new Error("You don't have permission to update this resource");
      }
      
      // Remove id and user_id from update data
      delete sanitizedData.id;
      delete sanitizedData.user_id;
      
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
      
      // Fix type conversion by using unknown as intermediate type
      return updatedData[0] as unknown as T;
    } catch (error: any) {
      throw handleDataOperationError('updating in', table, error);
    }
  }
};
