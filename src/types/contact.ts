
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  personal_email?: string;
  mobile_phone?: string;
  avatar_url?: string;
  circle: 'inner' | 'middle' | 'outer';
  last_contact?: string; // Date stored as string to match Supabase
  notes?: string;
  tags?: string[];
  // Added fields
  website?: string;
  birthday?: string; // Date stored as string to match Supabase
  location?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string; // Added field
  instagram?: string; // Added field
  company_name?: string;
  job_title?: string;
  industry?: string;
  department?: string;
  work_address?: string;
  university?: string;
  major?: string;
  minor?: string;
  graduation_year?: number;
  how_met?: string;
  hobbies_interests?: string; // Added field
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

export interface ContactMedia {
  id: string;
  contact_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  storage_path: string;
  is_image: boolean;
  created_at: string;
  url?: string; // Client-side URL for display
}
