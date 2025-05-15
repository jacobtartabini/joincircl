
import { supabase } from "@/integrations/supabase/client";
import { DataRecord, FetchOptions, MutationOptions } from "./types";

/**
 * Validates that input is a valid UUID
 * @param id The ID to validate
 * @returns True if valid UUID, false otherwise
 */
export const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Validates that the user owns the resource
 * @param resourceUserId The user ID of the resource
 * @param requestUserId The user ID making the request
 * @returns True if ownership is valid, false otherwise
 */
export const validateOwnership = (resourceUserId: string, requestUserId: string): boolean => {
  return resourceUserId === requestUserId;
};

/**
 * Sanitizes data object to prevent injection attacks
 * @param data The data to sanitize
 * @returns Sanitized data
 */
export const sanitizeDataObject = (data: DataRecord): DataRecord => {
  if (!data || typeof data !== 'object') return data;

  const sanitizedData: DataRecord = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Simple sanitization to prevent SQL injection
      sanitizedData[key] = value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"');
    } else if (Array.isArray(value)) {
      // Sanitize array elements
      sanitizedData[key] = value.map(item => 
        typeof item === 'string' ? item
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/"/g, '\\"') 
        : item
      );
    } else if (value && typeof value === 'object') {
      // Recursively sanitize nested objects
      sanitizedData[key] = sanitizeDataObject(value);
    } else {
      sanitizedData[key] = value;
    }
  }
  return sanitizedData;
};

/**
 * Validates request parameters to prevent injection attacks
 * @param params Parameters to validate
 * @returns True if valid, false otherwise
 */
export const validateRequest = (params: any): boolean => {
  // Check for null or undefined
  if (!params) {
    console.error("Invalid request: parameters are null or undefined");
    return false;
  }
  
  // Check for SQL injection attempts in string values
  if (typeof params === "string") {
    const sqlInjectionPattern = /('|"|;|--|\/\*|\*\/|@@|@|char|nchar|varchar|nvarchar|alter|begin|cast|create|cursor|declare|delete|drop|end|exec|execute|fetch|insert|kill|open|select|sys|sysobjects|syscolumns|table|update|values|xp_)/i;
    if (sqlInjectionPattern.test(params)) {
      console.error("Invalid request: potential SQL injection detected");
      return false;
    }
  }
  
  // For objects, validate each property
  if (typeof params === "object" && params !== null) {
    for (const key in params) {
      if (Object.prototype.hasOwnProperty.call(params, key)) {
        if (!validateRequest(params[key])) {
          return false;
        }
      }
    }
  }
  
  return true;
};

/**
 * Validates query parameters for fetch operations
 * @param options The query options to validate
 * @returns True if valid, false otherwise
 */
export const validateQueryParams = (options?: FetchOptions): boolean => {
  if (!options) return true;
  
  // Validate column names to prevent SQL injection
  if (options.column && !isValidColumnName(options.column)) {
    return false;
  }
  
  if (options.order && !isValidColumnName(options.order.column)) {
    return false;
  }

  if (options.orderBy && !isValidColumnName(options.orderBy.column)) {
    return false;
  }
  
  // Validate filters
  if (options.filters) {
    for (const filter of options.filters) {
      if (!isValidColumnName(filter.column)) {
        return false;
      }
    }
  }
  
  return true;
};

/**
 * Validates that a column name is safe for use in a query
 * @param columnName The column name to validate
 * @returns True if valid, false otherwise
 */
export const isValidColumnName = (columnName: string): boolean => {
  // Column names should only contain alphanumeric characters, underscores, and dots (for nested objects)
  const validColumnPattern = /^[a-zA-Z0-9_\.]+$/;
  return validColumnPattern.test(columnName);
};

/**
 * Validates that the user has appropriate permissions for a resource
 * @param resourceType The type of resource being accessed
 * @param action The action being performed (read, create, update, delete)
 * @returns Promise resolving to true if authorized, false otherwise
 */
export const validatePermission = async (
  resourceType: string, 
  action: 'read' | 'create' | 'update' | 'delete'
): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      console.error("Permission denied: No active session");
      return false;
    }
    
    // This is a simplified permission check
    // In a real application, you would check against a roles/permissions system
    
    // For now, all authenticated users have basic permissions
    return true;
  } catch (error) {
    console.error("Error validating permissions:", error);
    return false;
  }
};
