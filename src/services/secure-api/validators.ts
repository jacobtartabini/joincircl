
import { v4 as uuidv4, validate as isUuid } from 'uuid';
import { FetchOptions, MutationOptions, TableName } from './types';

/**
 * Validates if a string is a valid UUID
 * @param uuid String to check for UUID format
 * @returns True if valid UUID, false otherwise
 */
export const isValidUuid = (uuid: string): boolean => {
  return isUuid(uuid);
};

/**
 * Validates ownership of a resource
 * @param resourceUserId User ID of the resource
 * @param requestUserId User ID making the request
 * @returns True if user owns resource, false otherwise
 */
export const validateOwnership = (resourceUserId: string, requestUserId: string): boolean => {
  // Simple equality check for basic ownership validation
  return resourceUserId === requestUserId;
};

/**
 * Sanitizes data objects to prevent injection and XSS
 * @param data Data object to sanitize
 * @returns Sanitized data object
 */
export const sanitizeDataObject = (data: Record<string, any>): Record<string, any> => {
  const sanitized = { ...data };
  
  // Sanitize string fields
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      // Simple HTML tag removal (for basic XSS protection)
      sanitized[key] = sanitized[key].replace(/<[^>]*>/g, '');
    }
  });
  
  return sanitized;
};

/**
 * Validates query parameters for security
 * @param options Query options to validate
 */
export const validateQueryParams = (options: FetchOptions): void => {
  // Check for SQL injection in column names
  const validateColumnName = (name: string) => {
    const forbiddenChars = /[;'"\\\/<>]/g;
    if (forbiddenChars.test(name)) {
      throw new Error("Invalid column name format");
    }
  };
  
  // Validate column names in ordering
  if (options.order) {
    validateColumnName(options.order.column);
  }
  
  // Validate column names in filters
  if (options.filters) {
    options.filters.forEach(filter => {
      validateColumnName(filter.column);
    });
  }
};

/**
 * Validates request parameters for security
 * @param table Table name to validate
 * @param options Options to validate
 */
export const validateRequestParams = (table: TableName, options?: FetchOptions | MutationOptions): void => {
  // Validate table name (should be constrained by the TableName type)
  const validTables: TableName[] = ["contact_media", "contacts", "profiles", "interactions", "keystones", "user_calendar_tokens"];
  
  if (!validTables.includes(table)) {
    throw new Error(`Invalid table name: ${table}`);
  }
  
  // Run the same checks as validateQueryParams if options are provided
  if (options) {
    const fetchOptions = options as FetchOptions;
    if (fetchOptions.order || fetchOptions.filters) {
      validateQueryParams(fetchOptions);
    }
  }
};

/**
 * Applies rate limiting for an API operation
 * This is just a stub - real implementation is in rateLimiting.ts
 * @param operation Operation name
 */
export const applyRateLimiting = async (operation: string): Promise<void> => {
  // Implementation moved to rateLimiting.ts
  return;
};
