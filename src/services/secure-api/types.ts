
import { PostgrestError } from "@supabase/supabase-js";

// Updated interface to match the actual usage
export interface SecureApiService {
  fetch: <T>(table: string, options?: FetchOptions) => Promise<{ data: T[] | null; error: PostgrestError | null }>;
  insert: <T>(table: string, data: T, options?: MutationOptions) => Promise<{ data: T | null; error: PostgrestError | null }>;
  update: <T>(table: string, data: Partial<T>, options?: MutationOptions) => Promise<{ data: T | null; error: PostgrestError | null }>;
  delete: (table: string, options: MutationOptions) => Promise<{ error: PostgrestError | null }>;
  validateSession: () => Promise<boolean>;
  extendSession: () => Promise<void>;
}

// Basic types for tables and records
export type TableName = string;
export type DataRecord = Record<string, any>;
export type UserOwnedRecord = DataRecord & { user_id: string };
export type QueryResult<T> = { data: T[] | null; error: PostgrestError | null };

export interface FetchOptions {
  column?: string;
  value?: any;
  limit?: number;
  offset?: number; // Added for pagination support
  page?: number;    // Added for pagination support
  pageSize?: number; // Added for pagination support
  order?: {
    column: string;
    ascending?: boolean;
  };
  orderBy?: {      // Alternative format for ordering
    column: string;
    direction?: 'asc' | 'desc';
  };
  select?: string;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike';
    value: any;
  }>;
}

export interface MutationOptions {
  column?: string;
  value?: any;
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike';
    value: any;
  }>;
  returning?: boolean;
}

// Alias for backward compatibility
export type SecureApiServiceOptions = MutationOptions;
