
import { sanitizeInput } from "@/utils/security";

/**
 * Validates UUID format
 * @param id The ID to validate
 * @returns Boolean indicating if valid
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Sanitizes all string values in an object
 * @param data The data object to sanitize
 * @returns Sanitized data object
 */
export function sanitizeDataObject(data: Record<string, any>): Record<string, any> {
  const sanitizedData = { ...data };
  
  Object.keys(sanitizedData).forEach(key => {
    if (typeof sanitizedData[key] === 'string') {
      sanitizedData[key] = sanitizeInput(sanitizedData[key]);
    }
  });
  
  return sanitizedData;
}

/**
 * Validates ownership of a resource
 * @param resourceUserId The user ID on the resource
 * @param currentUserId The current user's ID
 * @returns Boolean indicating if the user owns the resource
 */
export function validateOwnership(resourceUserId: string, currentUserId: string): boolean {
  return resourceUserId === currentUserId;
}
