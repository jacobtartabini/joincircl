
import { FetchOptions } from "./types";

export function validateQueryParams(options: FetchOptions = {}): void {
  // Validate limit
  if (options.limit !== undefined && (typeof options.limit !== 'number' || options.limit <= 0)) {
    throw new Error("Limit must be a positive number");
  }

  // Validate offset
  if (options.offset !== undefined && (typeof options.offset !== 'number' || options.offset < 0)) {
    throw new Error("Offset must be a non-negative number");
  }

  // Validate pagination
  if (options.page !== undefined && (typeof options.page !== 'number' || options.page <= 0)) {
    throw new Error("Page must be a positive number");
  }

  if (options.pageSize !== undefined && (typeof options.pageSize !== 'number' || options.pageSize <= 0)) {
    throw new Error("Page size must be a positive number");
  }

  // Validate orderBy
  if (options.orderBy && !options.orderBy.column) {
    throw new Error("Order by column must be specified");
  }
}

export function isValidUuid(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export function validateOwnership(resourceUserId: string, requestUserId: string): boolean {
  return resourceUserId === requestUserId;
}

export function sanitizeDataObject(data: Record<string, any>): Record<string, any> {
  const sanitized = { ...data };
  
  // Basic input sanitization for string values
  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      // Trim strings and convert empty strings to null
      sanitized[key] = sanitized[key].trim() || null;
    }
  });
  
  return sanitized;
}
