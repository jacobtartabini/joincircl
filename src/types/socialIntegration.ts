
import { Contact } from "./contact";

export type SocialPlatform = "facebook" | "twitter" | "linkedin" | "instagram";

export interface SocialProfile {
  id: string;
  platform: SocialPlatform;
  username: string;
  display_name?: string;
  profile_url: string;
  avatar_url?: string;
  user_id: string;
  contact_id?: string;
  last_synced?: string;
}

export interface SocialPost {
  id: string;
  platform: SocialPlatform;
  content: string;
  summary?: string;
  post_url?: string;
  posted_at: string;
  social_profile_id: string;
  contact_id?: string;
}

export interface SocialIntegrationStatus {
  platform: SocialPlatform;
  connected: boolean;
  last_synced?: string;
  username?: string;
  error?: string;
}

export interface SocialSyncResult {
  contacts_imported: number;
  contacts_updated: number;
  posts_fetched: number;
  errors: string[];
}
