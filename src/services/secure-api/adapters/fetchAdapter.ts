
import { supabase } from "@/integrations/supabase/client";
import { TableName, DataRecord } from "../types";
import { checkRateLimit, generalRateLimiter } from "../rateLimiting";
import { handleDataOperationError } from "../errorHandling";

/**
 * Adapter for fetch operations
 */
export const fetchAdapter = {
  /**
   * Securely fetch data from Supabase with rate limiting and validation
   * @param table The table to fetch from
   * @param userId The user ID for rate limiting and access control
   * @returns Promise with the data or error
   */
  async fetchData<T extends DataRecord>(
    table: TableName,
    userId: string
  ): Promise<T[]> {
    // Apply rate limiting
    checkRateLimit(generalRateLimiter, userId);

    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      // First cast to unknown to break the deep type checking, 
      // then cast to the desired type
      return (data || []) as unknown as T[];
    } catch (err) {
      throw handleDataOperationError("fetching from", table, err);
    }
  },
};
