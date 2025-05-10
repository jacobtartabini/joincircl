
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
