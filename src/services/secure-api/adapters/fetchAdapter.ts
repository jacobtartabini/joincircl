
import { supabase } from "@/integrations/supabase/client";
import { applyRateLimiting } from "../rateLimiting";
import { handleApiError } from "../errorHandling";
import { DataRecord, FetchOptions, QueryResult, TableName } from "../types";
import { validateQueryParams } from "../validators";

export async function fetchAdapter<T extends DataRecord>(
  table: TableName,
  options: FetchOptions = {}
): Promise<QueryResult<T>> {
  try {
    // Apply rate limiting
    await applyRateLimiting();
    
    // Validate query parameters
    validateQueryParams(options);

    // Initialize query
    let query = supabase.from(table).select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (options.filters) {
      for (const [field, value] of Object.entries(options.filters)) {
        query = query.eq(field, value);
      }
    }

    // Apply pagination if provided
    if (options.page !== undefined && options.pageSize !== undefined) {
      const start = (options.page - 1) * options.pageSize;
      query = query.range(start, start + options.pageSize - 1);
    } else if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    
    // Apply offset if provided
    if (options.offset !== undefined) {
      query = query.offset(options.offset);
    }
    
    // Apply ordering if provided
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? false 
      });
    } else {
      // Default ordering by created_at
      query = query.order('created_at', { ascending: false });
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Use unknown as intermediate casting to avoid deep instantiation issues
    return {
      data: (data || []) as unknown as T[],
      count: count || 0,
      error: null
    };
  } catch (error) {
    return handleApiError<T>(error);
  }
}
