
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

    // Initialize query - using explicit type to avoid deep instantiation
    let query = supabase.from(table).select('*', { count: 'exact' });
    
    // Apply filters if provided
    if (options.filters) {
      Object.entries(options.filters).forEach(([field, value]) => {
        query = query.eq(field, value);
      });
    }

    // Apply pagination if provided
    if (options.page !== undefined && options.pageSize !== undefined) {
      const start = (options.page - 1) * options.pageSize;
      const end = start + options.pageSize - 1;
      query = query.range(start, end);
    } else if (options.limit !== undefined) {
      query = query.limit(options.limit);
    }
    
    // Apply offset if provided - safely applying offset
    if (options.offset !== undefined) {
      // Cast to any to bypass type checking for offset
      // This is necessary due to type limitations in the Supabase client
      (query as any) = (query as any).offset(options.offset);
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
    
    return {
      data: (data || []) as unknown as T[],
      count: count || 0,
      error: null
    };
  } catch (error) {
    return handleApiError<T>(error);
  }
}
