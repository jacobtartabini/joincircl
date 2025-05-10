
// Types for the secure API service

/**
 * Allowed database table names
 */
export type TableName = "contacts" | "interactions" | "keystones" | "profiles" | "contact_media" | "user_calendar_tokens";

/**
 * Common interface for returned data records
 * All returned records must have an id and optionally a user_id
 */
export interface DataRecord {
  id: string;
  user_id?: string;
  [key: string]: any;
}

/**
 * Error response shape
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Database record with user_id
 */
export interface UserOwnedRecord {
  user_id: string;
  [key: string]: any;
}
