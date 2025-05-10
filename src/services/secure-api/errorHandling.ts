
import { QueryResult, DataRecord } from "./types";

export function handleApiError<T extends DataRecord>(error: any): QueryResult<T> {
  console.error("API error:", error);
  
  return {
    data: [] as T[],
    count: 0,
    error: {
      message: error.message || "An unexpected error occurred",
      details: error.details || error
    }
  };
}

export function handleDataOperationError(operation: string, tableName: string, error: any): Error {
  const errorMessage = error.message || 'An unexpected error occurred';
  const errorDetails = error.details || '';
  
  console.error(`Error ${operation} ${tableName}:`, error);
  
  return new Error(`Failed ${operation} ${tableName}: ${errorMessage}${errorDetails ? ' - ' + errorDetails : ''}`);
}
