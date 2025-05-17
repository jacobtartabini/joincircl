
export type SocialPlatform = "twitter" | "facebook" | "linkedin" | "instagram" | "gmail" | "calendar";

export interface SocialIntegrationStatus {
  platform: SocialPlatform;
  connected: boolean;
  username?: string;
  last_synced?: string;
  error?: string;
}

export interface SocialProfile {
  id: string;
  platform: SocialPlatform;
  username: string;
  display_name?: string;
  profile_url?: string;
  avatar_url?: string;
  contact_id?: string;
  user_id: string;
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

export interface SocialSyncResult {
  contacts_imported: number;
  contacts_updated: number;
  posts_fetched: number;
  errors: string[];
}
