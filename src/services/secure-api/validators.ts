
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

  // Validate orderBy
  if (options.orderBy && !options.orderBy.column) {
    throw new Error("Order by column must be specified");
  }
}
