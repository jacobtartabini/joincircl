-- Create security_events table for monitoring and logging
CREATE TABLE public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_ip TEXT,
  user_agent TEXT,
  details JSONB DEFAULT '{}',
  occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Create policies for security events
CREATE POLICY "Users can view their own security events" 
ON public.security_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all security events" 
ON public.security_events 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for efficient querying
CREATE INDEX idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX idx_security_events_type ON public.security_events(type);
CREATE INDEX idx_security_events_occurred_at ON public.security_events(occurred_at);
CREATE INDEX idx_security_events_user_occurred ON public.security_events(user_id, occurred_at);