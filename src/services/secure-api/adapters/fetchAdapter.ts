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
      const response = await supabase
        .from<T>(table)
        .select("*")
        .eq("user_id", userId);

      if (response.error) {
        throw response.error;
      }

      if (!response.data) {
        return [];
      }

      return response.data;
    } catch (err) {
      throw handleDataOperationError("fetching from", table, err);
    }
  },
};
