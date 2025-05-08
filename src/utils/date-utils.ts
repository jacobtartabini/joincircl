
import { format, isToday, isYesterday } from "date-fns";

/**
 * Formats the last contact date in a human-readable format
 * @param date The date to format
 * @returns A formatted string (Today, Yesterday, or MMM d)
 */
export function getFormattedLastContact(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, 'MMM d');
  }
}
