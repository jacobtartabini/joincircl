
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  circle: 'inner' | 'middle' | 'outer';
  last_contact?: string; // Changed from Date to string to match Supabase
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  contact_id: string;
  user_id: string;
  type: string;
  notes?: string;
  date: string; // Changed from Date to string to match Supabase
  created_at: string;
}

export interface ConnectionStrength {
  score: number;
  level: 'weak' | 'moderate' | 'strong';
  suggestions: string[];
}
