
-- 1. Create user_credits table for daily Arlo credit tracking
CREATE TABLE IF NOT EXISTS public.user_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits integer NOT NULL DEFAULT 5,
  credits_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- 2. Add RLS to user_credits
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Only users can see their own credits
CREATE POLICY "Users can view their own Arlo credits"
  ON public.user_credits
  FOR SELECT
  USING (user_id = auth.uid());

-- Only users can update their own credits
CREATE POLICY "Users can update their own Arlo credits"
  ON public.user_credits
  FOR UPDATE
  USING (user_id = auth.uid());

-- Only user can insert their own credits
CREATE POLICY "Users can insert their own Arlo credits"
  ON public.user_credits
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Only user can delete their own credits
CREATE POLICY "Users can delete their own Arlo credits"
  ON public.user_credits
  FOR DELETE
  USING (user_id = auth.uid());

-- 3. Set up RLS for user_subscriptions using proper Postgres catalog table
DO $$
BEGIN
  -- Check if policies exist using pg_policies view
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can view their own subscription'
      AND schemaname = 'public'
      AND tablename = 'user_subscriptions'
  ) THEN
    CREATE POLICY "Users can view their own subscription"
      ON public.user_subscriptions
      FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can update their own subscription'
      AND schemaname = 'public'
      AND tablename = 'user_subscriptions'
  ) THEN
    CREATE POLICY "Users can update their own subscription"
      ON public.user_subscriptions
      FOR UPDATE
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can insert their own subscription'
      AND schemaname = 'public'
      AND tablename = 'user_subscriptions'
  ) THEN
    CREATE POLICY "Users can insert their own subscription"
      ON public.user_subscriptions
      FOR INSERT
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Users can delete their own subscription'
      AND schemaname = 'public'
      AND tablename = 'user_subscriptions'
  ) THEN
    CREATE POLICY "Users can delete their own subscription"
      ON public.user_subscriptions
      FOR DELETE
      USING (user_id = auth.uid());
  END IF;
END $$;

-- 4. Enable RLS on user_subscriptions if not already enabled
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
