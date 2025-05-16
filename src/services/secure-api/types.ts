
import { SupabaseClient } from "@supabase/supabase-js";

export type DataRecord = Record<string, any>;

export interface UserOwnedRecord {
  user_id: string;
  [key: string]: any;
}

export type TableName = 
  | "contacts"
  | "profiles"
  | "interactions"
  | "keystones"
  | "contact_media"
  | "user_calendar_tokens";

export interface FetchOptions {
  filters?: Record<string, any>;
  limit?: number;
  offset?: number;
  page?: number;
  pageSize?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  error?: any;
}

export interface SecureApiService {
  fetch: <T extends DataRecord>(table: TableName, options?: FetchOptions) => Promise<QueryResult<T>>;
}
