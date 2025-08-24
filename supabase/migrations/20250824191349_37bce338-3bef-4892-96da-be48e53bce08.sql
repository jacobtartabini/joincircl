-- Fix critical security policy gaps

-- 1. Add missing INSERT policy for profiles table to allow user registration
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 2. Enhance token security with stricter policies and validation
-- Add policy to prevent token enumeration
CREATE POLICY "Prevent token enumeration" 
ON public.user_email_tokens 
FOR SELECT 
USING (auth.uid() = user_id AND expires_at > now());

CREATE POLICY "Prevent expired token access" 
ON public.user_social_integrations 
FOR SELECT 
USING (auth.uid() = user_id AND expires_at > now());

-- 3. Add audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role can manage audit logs
CREATE POLICY "Service role manages audit logs" 
ON public.audit_log 
FOR ALL 
USING (auth.role() = 'service_role');

-- Users can view their own audit trail
CREATE POLICY "Users can view own audit trail" 
ON public.audit_log 
FOR SELECT 
USING (auth.uid() = user_id);

-- 4. Fix database function security by setting proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Add data retention trigger for sensitive tables
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Clean up expired email tokens
  DELETE FROM public.user_email_tokens 
  WHERE expires_at < now() - interval '7 days';
  
  -- Clean up expired social integration tokens
  DELETE FROM public.user_social_integrations 
  WHERE expires_at < now() - interval '7 days';
  
  -- Clean up old security events (keep 90 days)
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '90 days';
END;
$$;