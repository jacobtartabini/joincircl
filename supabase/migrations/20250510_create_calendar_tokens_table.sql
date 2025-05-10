
-- Create user_calendar_tokens table to store user calendar tokens
CREATE TABLE IF NOT EXISTS public.user_calendar_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create unique constraint to ensure one token per provider per user
ALTER TABLE public.user_calendar_tokens 
  ADD CONSTRAINT user_calendar_tokens_user_id_provider_unique 
  UNIQUE (user_id, provider);

-- Add RLS policies
ALTER TABLE public.user_calendar_tokens ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own tokens
CREATE POLICY "Users can view their own calendar tokens"
  ON public.user_calendar_tokens
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only allow users to insert their own tokens
CREATE POLICY "Users can insert their own calendar tokens"
  ON public.user_calendar_tokens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only allow users to update their own tokens
CREATE POLICY "Users can update their own calendar tokens"
  ON public.user_calendar_tokens
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to update updated_at column
CREATE TRIGGER update_user_calendar_tokens_updated_at
  BEFORE UPDATE ON public.user_calendar_tokens
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
