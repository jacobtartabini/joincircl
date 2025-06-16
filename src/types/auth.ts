
import { User, Session } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  has_seen_tutorial: boolean | null;
  onboarding_completed: boolean | null;
  onboarding_completed_at: string | null;
  onboarding_step_completed: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  location: string | null;
  company_name: string | null;
  job_title: string | null;
  bio: string | null;
  role: string | null;
  how_heard_about_us: string | null;
  goals: string | null;
  additional_notes: string | null;
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithLinkedIn: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (value: boolean) => void;
  setProfile: (profile: Profile | null) => void;
}
