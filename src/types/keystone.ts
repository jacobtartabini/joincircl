
export interface Keystone {
  id: string;
  title: string;
  date: string; // Changed from Date to string to match Supabase
  category?: string;
  contact_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}
