
import { PostgrestError } from "@supabase/supabase-js";
import { DataRecord, QueryResult } from "./types";

/**
 * Handles errors from data operations in a secure way
 * @param operation The operation being performed
 * @param table The table being operated on
 * @param error The error object
 * @returns Error with safe message
 */
export const handleDataOperationError = (operation: string, table: string, error: any): Error => {
  // Log original error for debugging
  console.error(`Error ${operation} ${table}:`, error);
  
  // Default safe error message
  let errorMessage = `An error occurred while ${operation} ${table}`;

  // If it's a PostgrestError, we can provide more specific but still safe messages
  if (error && 'code' in error) {
    switch (error.code) {
      case '23505': // Unique violation
        errorMessage = 'A record with this information already exists.';
        break;
      case '23503': // Foreign key violation
        errorMessage = 'This operation references a record that does not exist.';
        break;
      case '42P01': // Undefined table
        errorMessage = 'The requested resource type does not exist.';
        break;
      case '42703': // Undefined column
        errorMessage = 'Invalid field specified in request.';
        break;
      default:
        if (error.message && !error.message.includes('password') && !error.message.includes('token')) {
          // Only include the error message if it doesn't contain sensitive information
          errorMessage = `Operation failed: ${error.message}`;
        }
    }
  } else if (error instanceof Error) {
    // For standard errors, use the message but ensure it doesn't contain sensitive info
    const sensitivePattern = /(password|token|secret|key|auth|cred)/i;
    if (!sensitivePattern.test(error.message)) {
      errorMessage = error.message;
    }
  }
  
  return new Error(errorMessage);
};

/**
 * Transforms a Supabase query result to a standard format
 * @param result The query result from Supabase
 * @returns Standardized result format
 */
export const transformQueryResult = <T extends DataRecord>(result: QueryResult<T>): QueryResult<T> => {
  // This can be expanded to standardize results across different providers
  return result;
};
