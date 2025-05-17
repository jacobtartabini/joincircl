
-- User social integration tokens table to store OAuth tokens
CREATE TABLE IF NOT EXISTS public.user_social_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('facebook', 'twitter', 'linkedin', 'instagram')),
  username text NOT NULL,
  access_token text NOT NULL,
  refresh_token text,
  expires_at timestamp with time zone NOT NULL,
  last_synced timestamp with time zone DEFAULT now(),
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

-- Add trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_social_integrations_updated_at
BEFORE UPDATE ON public.user_social_integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
