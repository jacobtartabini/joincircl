
-- Social profiles table to store connected social media accounts for contacts
CREATE TABLE IF NOT EXISTS public.social_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp')),
  username text NOT NULL,
  display_name text,
  profile_url text NOT NULL,
  avatar_url text,
  last_synced timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Enforce unique profile per platform per contact
  UNIQUE (contact_id, platform)
);

-- Add RLS policy for social_profiles
ALTER TABLE public.social_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own social profiles"
  ON public.social_profiles
  FOR ALL
  USING (user_id = auth.uid());

-- Social posts table to store posts from contacts' social media
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp')),
  content text NOT NULL,
  summary text,
  post_url text,
  posted_at timestamp with time zone NOT NULL,
  social_profile_id uuid NOT NULL REFERENCES public.social_profiles(id) ON DELETE CASCADE,
  contact_id uuid REFERENCES public.contacts(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Add RLS policy for social_posts
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their contacts' social posts"
  ON public.social_posts
  FOR ALL
  USING ((SELECT user_id FROM public.social_profiles WHERE id = social_profile_id) = auth.uid());

-- User social integration tokens table to store OAuth tokens
CREATE TABLE IF NOT EXISTS public.user_social_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'instagram', 'whatsapp')),
  username text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamp with time zone NOT NULL,
  last_synced timestamp with time zone,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Enforce one account per platform per user
  UNIQUE (user_id, platform)
);

-- Add RLS policy for user_social_integrations
ALTER TABLE public.user_social_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own social integrations"
  ON public.user_social_integrations
  FOR ALL
  USING (user_id = auth.uid());

-- Add triggers to update the updated_at column
CREATE TRIGGER update_social_profiles_updated_at
BEFORE UPDATE ON public.social_profiles
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_social_posts_updated_at
BEFORE UPDATE ON public.social_posts
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_user_social_integrations_updated_at
BEFORE UPDATE ON public.user_social_integrations
FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

-- Add indexes for common queries
CREATE INDEX idx_social_profiles_contact_id ON public.social_profiles (contact_id);
CREATE INDEX idx_social_posts_social_profile_id ON public.social_posts (social_profile_id);
CREATE INDEX idx_social_posts_contact_id ON public.social_posts (contact_id);
CREATE INDEX idx_social_posts_platform_posted_at ON public.social_posts (platform, posted_at DESC);
