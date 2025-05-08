
import { Session, User } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  phone_number?: string;
  has_seen_tutorial?: boolean;
  created_at?: string;
  updated_at?: string;
}
