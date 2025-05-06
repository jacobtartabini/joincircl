
export interface Keystone {
  id: string;
  title: string;
  date: string; // Date stored as string to match Supabase
  category?: string;
  contact_id?: string;
  user_id: string;
  is_recurring?: boolean; // Added field
  recurrence_frequency?: string; // Added field
  created_at: string;
  updated_at: string;
}
