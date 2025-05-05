

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

