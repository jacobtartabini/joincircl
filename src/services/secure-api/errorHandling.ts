
/**
 * Format and log an error from data operations
 * @param operation The operation that failed
 * @param table The table being operated on
 * @param error The error object
 * @returns Formatted error message
 */
export function handleDataOperationError(operation: string, table: string, error: any): Error {
  const errorMessage = error?.message || 'Unknown error';
  console.error(`Error ${operation} ${table}:`, error);
  return new Error(`Failed to ${operation} data: ${errorMessage}`);
}
