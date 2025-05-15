
import { supabase } from "@/integrations/supabase/client";
import { TableName, DataRecord } from "../types";
import { sanitizeDataObject } from "../validators";
import { applyRateLimiting } from "../rateLimiting";
import { handleDataOperationError } from "../errorHandling";

// Simple type for records
type AnyRecord = Record<string, any>;

/**
 * Adapter for insert operations
 */
export const insertAdapter = {
  /**
   * Securely insert data with proper validation
   * @param table The table to insert into
   * @param userId The user ID for ownership and rate limiting
   * @param data The data to insert
   * @returns Promise with the inserted data or error
   */
  async insertData<T extends DataRecord>(table: TableName, userId: string, data: AnyRecord): Promise<T> {
    // Apply rate limiting
    applyRateLimiting("insert", userId);
    
    // Apply sanitization to string fields
    const sanitizedData = sanitizeDataObject(data);
    
    // Ensure user_id is set
    sanitizedData.user_id = userId;
    
    try {
      // Use a more direct type assertion approach
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(sanitizedData as any)
        .select();
        
      if (error) throw error;
      
      if (!insertedData || insertedData.length === 0) {
        throw new Error("Failed to insert data: No data returned");
      }
      
      // Simple casting to avoid excessive type depth
      return insertedData[0] as unknown as T;
    } catch (error: any) {
      throw handleDataOperationError('inserting into', table, error);
    }
  }
};
