
export interface Contact {
  id: string;
  name: string;
  user_id: string;
  circle: "inner" | "middle" | "outer";
  notes?: string;
  tags?: string[];
  avatar_url?: string;
  personal_email?: string;
  mobile_phone?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  department?: string;
  work_address?: string;
  university?: string;
  major?: string;
  minor?: string;
  graduation_year?: number;
  birthday?: string;
  how_met?: string;
  hobbies_interests?: string;
  last_contact?: string;
  created_at?: string;
  updated_at?: string;
  connection_strength?: ConnectionStrength;
}

export interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;
  type: string;
  notes?: string;
  date: string;
  created_at?: string;
}

export interface ContactMedia {
  id: string;
  user_id: string; 
  contact_id: string;
  file_name: string;
  storage_path: string;
  file_type: string;
  is_image: boolean;
  created_at?: string;
  url?: string; // Add the url property
}

export interface ConnectionStrength {
  score: number;
  level: 'weak' | 'moderate' | 'strong';
  suggestions: string[];
}
