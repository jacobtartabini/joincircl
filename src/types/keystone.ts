
export interface Keystone {
  id: string;
  title: string;
  date: string; // Start date stored as string to match Supabase
  end_date?: string; // End date (optional)
  all_day?: boolean; // Whether this is an all-day event
  due_date?: string; // Making this explicitly optional
  category?: string;
  contact_id?: string;
  contact_ids?: string[]; // New field for multiple contacts
  contact_name?: string; // Added to match KeystoneProps
  user_id: string;
  is_recurring?: boolean;
  recurrence_frequency?: string;
  notes?: string; // Make sure notes is optional
  created_at: string;
  updated_at: string;
}
