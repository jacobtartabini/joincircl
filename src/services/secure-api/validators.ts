
import { supabase } from "@/integrations/supabase/client";

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
