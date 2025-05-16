
import { supabase } from "@/integrations/supabase/client";
import { TableName, UserOwnedRecord } from "../types";
import { isValidUuid, validateOwnership } from "../validators";
import { checkRateLimit } from "../rateLimiting";
import { contactsRateLimiter } from "../rateLimiting";
import { handleDataOperationError } from "../errorHandling";

/**
 * Adapter for delete operations
 */
export const deleteAdapter = {
  /**
   * Securely delete data with ownership verification
   * @param table The table to delete from
   * @param userId The user ID for ownership verification
   * @param id The record ID to delete
   * @returns Promise with success status
   */
  async deleteData(table: TableName, userId: string, id: string): Promise<boolean> {
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
