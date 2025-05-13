
import { fetchAdapter } from "./adapters/fetchAdapter";
import { DataRecord, FetchOptions, QueryResult, TableName } from "./types";

/**
 * Service to interact with the secure API
 */
export const secureApiService = {
  /**
   * Fetches data from a table with optional filtering and pagination
   * @param table The table to fetch from
   * @param options Optional query parameters
   * @returns Promise with query result
   */
  fetch: async <T extends DataRecord>(
    table: TableName, 
    options: FetchOptions = {}
  ): Promise<QueryResult<T>> => {
    return await fetchAdapter<T>(table, options);
  }
};
