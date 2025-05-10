
import { TableName, DataRecord } from "./types";
import { fetchAdapter } from "./adapters/fetchAdapter";
import { insertAdapter } from "./adapters/insertAdapter";
import { updateAdapter } from "./adapters/updateAdapter";
import { deleteAdapter } from "./adapters/deleteAdapter";

// Simple type for records
type AnyRecord = Record<string, any>;

/**
 * A secure service for making API calls with proper validation,
 * rate limiting, and error handling
 */
export const secureApiService = {
  /**
   * Securely fetch data from Supabase with rate limiting and validation
   * @param table The table to fetch from
   * @param userId The user ID for rate limiting and access control
   * @returns Promise with the data or error
   */
  async fetchData<T extends DataRecord>(table: TableName, userId: string | undefined): Promise<T[]> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    return fetchAdapter.fetchData<T>(table, userId);
  },
  
  /**
   * Securely insert data with proper validation
   * @param table The table to insert into
   * @param userId The user ID for ownership and rate limiting
   * @param data The data to insert
   * @returns Promise with the inserted data or error
   */
  async insertData<T extends DataRecord>(table: TableName, userId: string | undefined, data: AnyRecord): Promise<T> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    return insertAdapter.insertData<T>(table, userId, data);
  },
  
  /**
   * Securely update data with proper validation
   * @param table The table to update
   * @param userId The user ID for ownership verification
   * @param id The record ID to update
   * @param data The data to update
   * @returns Promise with the updated data or error
   */
  async updateData<T extends DataRecord>(table: TableName, userId: string | undefined, id: string, data: AnyRecord): Promise<T> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    return updateAdapter.updateData<T>(table, userId, id, data);
  },
  
  /**
   * Securely delete data with ownership verification
   * @param table The table to delete from
   * @param userId The user ID for ownership verification
   * @param id The record ID to delete
   * @returns Promise with success status
   */
  async deleteData(table: TableName, userId: string | undefined, id: string): Promise<boolean> {
    if (!userId) {
      throw new Error("Authentication required");
    }
    
    return deleteAdapter.deleteData(table, userId, id);
  }
};
