-- Fix and enhance social integration tables
-- Add missing columns and improve existing tables

-- Update user_email_tokens to handle token refresh properly
ALTER TABLE user_email_tokens 
ADD COLUMN IF NOT EXISTS last_synced timestamp with time zone,
ADD COLUMN IF NOT EXISTS sync_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sync_frequency integer DEFAULT 15; -- minutes

-- Update user_social_integrations to track sync status better
ALTER TABLE user_social_integrations 
ADD COLUMN IF NOT EXISTS sync_enabled boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS sync_frequency integer DEFAULT 15, -- minutes
ADD COLUMN IF NOT EXISTS profile_data jsonb DEFAULT '{}';

-- Create email_interactions table to store email data from Gmail
CREATE TABLE IF NOT EXISTS email_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  email_id text NOT NULL, -- Gmail message ID
  thread_id text,
  subject text,
  sender_email text NOT NULL,
  sender_name text,
  snippet text,
  received_at timestamp with time zone NOT NULL,
  labels text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, email_id)
);

-- Create social_posts table to store social media posts
CREATE TABLE IF NOT EXISTS social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_id uuid REFERENCES contacts(id) ON DELETE CASCADE,
  platform text NOT NULL,
  post_id text NOT NULL,
  content text NOT NULL,
  summary text,
  post_url text,
  posted_at timestamp with time zone NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, platform, post_id)
);

-- Create calendar_events table to store synced calendar events
CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'google', 'outlook', etc.
  event_id text NOT NULL,
  summary text,
  description text,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  all_day boolean DEFAULT false,
  location text,
  attendees jsonb DEFAULT '[]',
  contact_ids uuid[],
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, provider, event_id)
);

-- Add RLS policies for email_interactions
ALTER TABLE email_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own email interactions" 
ON email_interactions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email interactions" 
ON email_interactions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email interactions" 
ON email_interactions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email interactions" 
ON email_interactions FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for social_posts
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own social posts" 
ON social_posts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own social posts" 
ON social_posts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own social posts" 
ON social_posts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own social posts" 
ON social_posts FOR DELETE 
USING (auth.uid() = user_id);

-- Add RLS policies for calendar_events
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own calendar events" 
ON calendar_events FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events" 
ON calendar_events FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" 
ON calendar_events FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" 
ON calendar_events FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_interactions_user_contact ON email_interactions(user_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_email_interactions_sender ON email_interactions(user_id, sender_email);
CREATE INDEX IF NOT EXISTS idx_social_posts_user_contact ON social_posts(user_id, contact_id);
CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(user_id, platform);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_time ON calendar_events(user_id, start_time);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_calendar_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for calendar_events
DROP TRIGGER IF EXISTS update_calendar_events_updated_at_trigger ON calendar_events;
CREATE TRIGGER update_calendar_events_updated_at_trigger
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_calendar_events_updated_at();