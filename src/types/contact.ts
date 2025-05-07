
export interface Contact {
  id: string;
  user_id: string;
  name: string;
  personal_email?: string;
  mobile_phone?: string;
  avatar_url?: string;
  circle: "inner" | "middle" | "outer";
  notes?: string;
  tags?: string[];
  linkedin?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  website?: string;
  location?: string;
  company_name?: string;
  job_title?: string;
  industry?: string;
  department?: string;
  work_address?: string;
  university?: string;
  major?: string;
  minor?: string;
  birthday?: string;
  graduation_year?: number;
  how_met?: string;
  hobbies_interests?: string;
  last_contact?: string;
  created_at: string;
  updated_at: string;
  connection_strength?: ConnectionStrength;
}

export interface Interaction {
  id: string;
  user_id: string;
  contact_id: string;
  type: string;
  notes?: string;
  date: string;
  created_at: string;
}

export type ConnectionStrength = {
  level: 'weak' | 'moderate' | 'strong';
  score: number; // 0-100
  suggestions: string[];
};
