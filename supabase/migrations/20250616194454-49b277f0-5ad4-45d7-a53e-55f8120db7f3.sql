
-- Create a table to track which notifications users have read
CREATE TABLE public.user_notification_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_id TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, notification_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.user_notification_states ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to manage their own notification states
CREATE POLICY "Users can manage their own notification states" 
  ON public.user_notification_states 
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_user_notification_states_user_id ON public.user_notification_states(user_id);
CREATE INDEX idx_user_notification_states_notification_id ON public.user_notification_states(notification_id);
