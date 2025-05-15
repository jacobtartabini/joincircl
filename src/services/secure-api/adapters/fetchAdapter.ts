
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
    await applyRateLimiting("fetch");
    
    // Validate query parameters
    validateQueryParams(options);

    // Initialize query with a type assertion to avoid deep instantiation
    let query = supabase.from(table).select('*', { count: 'exact' }) as any;
    
    // Apply filters if provided
    if (options.filters && options.filters.length > 0) {
      options.filters.forEach(filter => {
        switch (filter.operator) {
          case 'eq': 
            query = query.eq(filter.column, filter.value);
            break;
          case 'neq':
            query = query.neq(filter.column, filter.value);
            break;
          case 'gt':
            query = query.gt(filter.column, filter.value);
            break;
          case 'lt':
            query = query.lt(filter.column, filter.value);
            break;
          case 'gte':
            query = query.gte(filter.column, filter.value);
            break;
          case 'lte':
            query = query.lte(filter.column, filter.value);
            break;
          case 'like':
            query = query.like(filter.column, filter.value);
            break;
          case 'ilike':
            query = query.ilike(filter.column, filter.value);
            break;
        }
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
      // Use type assertion instead of importing the specific type
      query = query.offset(options.offset);
    }
    
    // Apply ordering if provided
    if (options.orderBy) {
      const ascending = options.orderBy.direction === 'asc';
      query = query.order(options.orderBy.column, { ascending });
    } else if (options.order) {
      query = query.order(options.order.column, { 
        ascending: options.order.ascending ?? false 
      });
    } else {
      // Default ordering by created_at if it exists
      query = query.order('created_at', { ascending: false });
    }
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    return {
      data: (data || []) as unknown as T[],
      error: null,
      count
    };
  } catch (error) {
    return handleApiError<T>(error);
  }
}
