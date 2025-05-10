
import { supabase } from "@/integrations/supabase/client";
import { applyRateLimiting } from "../rateLimiting";
import { handleApiError } from "../errorHandling";
import { DataRecord, FetchOptions, QueryResult, TableName } from "../types";

export async function fetchAdapter<T extends DataRecord>(
  table: TableName,
  options: FetchOptions = {}
): Promise<QueryResult<T>> {
  try {
    // Apply rate limiting
    await applyRateLimiting();

    // Initialize query
    let query = supabase.from(table).select('*');
    
    // Apply filters if provided
    if (options.filters) {
      for (const [field, value] of Object.entries(options.filters)) {
        query = query.eq(field, value);
      }
    }

    // Apply pagination if provided
    if (options.page && options.pageSize) {
      const start = (options.page - 1) * options.pageSize;
      query = query.range(start, start + options.pageSize - 1);
    }
    
    // Execute the query
    const { data, error, count } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Cast the data to the expected type and return
    return {
      data: (data || []) as unknown as T[],
      count: count || 0,
      error: null
    };
  } catch (error) {
    return handleApiError<T>(error);
  }
}
