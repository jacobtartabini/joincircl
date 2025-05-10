
import { supabase } from "@/integrations/supabase/client";
import { FetchOptions, QueryResult, DataRecord, TableName } from "../types";
import { validateQueryParams } from "../validators";
import { handleApiError } from "../errorHandling";
import { applyRateLimiting } from "../rateLimiting";

export async function fetchAdapter<T extends DataRecord>(
  tableName: TableName,
  options: FetchOptions = {}
): Promise<QueryResult<T>> {
  try {
    // Apply rate limiting before executing the query
    await applyRateLimiting();

    // Validate query parameters
    validateQueryParams(options);

    // Initialize query builder
    let query = supabase.from(tableName).select();

    // Apply filters if provided
    if (options.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        query = query.eq(key, value);
      }
    }

    // Execute the query
    const { data, error } = await query;

    // Handle errors
    if (error) {
      throw error;
    }

    // Return the result - fix the deep type instantiation error with a proper cast
    return {
      data: (data || []) as unknown as T[],
      count: data?.length || 0,
    };
  } catch (error) {
    return handleApiError<T>(error);
  }
}
