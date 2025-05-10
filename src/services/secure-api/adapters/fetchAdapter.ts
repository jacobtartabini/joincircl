
import { supabase } from "@/integrations/supabase/client";
import { TableName, DataRecord } from "../types";
import { checkRateLimit } from "../rateLimiting";
import { generalRateLimiter } from "../rateLimiting";
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

      if (error) throw error;

      // Use a simple cast to avoid deep type instantiation
      return (data || []) as unknown as T[];
    } catch (error: any) {
      throw handleDataOperationError("fetching from", table, error);
    }
  },
};
