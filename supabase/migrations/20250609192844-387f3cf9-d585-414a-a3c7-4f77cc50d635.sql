
-- Add onboarding completion and survey data to profiles table
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN role TEXT,
ADD COLUMN how_heard_about_us TEXT,
ADD COLUMN goals TEXT,
ADD COLUMN additional_notes TEXT;

-- Create an index for faster lookup of onboarding status
CREATE INDEX idx_profiles_onboarding_completed ON public.profiles(onboarding_completed);
