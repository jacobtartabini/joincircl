
-- Create job applications table
CREATE TABLE public.job_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'applied',
  applied_date DATE,
  interview_date TIMESTAMP WITH TIME ZONE,
  follow_up_date DATE,
  notes TEXT,
  salary_range TEXT,
  job_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career documents table
CREATE TABLE public.career_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  job_application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  document_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  file_url TEXT,
  storage_path TEXT,
  file_size INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview practice sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  job_application_id UUID REFERENCES public.job_applications(id) ON DELETE SET NULL,
  session_title TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  responses JSONB NOT NULL DEFAULT '[]'::jsonb,
  arlo_feedback JSONB NOT NULL DEFAULT '{}'::jsonb,
  duration_minutes INTEGER,
  confidence_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create career events table
CREATE TABLE public.career_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL,
  location TEXT,
  notes TEXT,
  contacts_met INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add career-specific columns to existing contacts table
ALTER TABLE public.contacts 
ADD COLUMN IF NOT EXISTS career_priority BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS career_tags TEXT[],
ADD COLUMN IF NOT EXISTS referral_potential TEXT,
ADD COLUMN IF NOT EXISTS career_event_id UUID REFERENCES public.career_events(id) ON DELETE SET NULL;

-- Enable Row Level Security for all new tables
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for job_applications
CREATE POLICY "Users can view their own job applications" 
  ON public.job_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own job applications" 
  ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job applications" 
  ON public.job_applications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job applications" 
  ON public.job_applications FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_documents
CREATE POLICY "Users can view their own career documents" 
  ON public.career_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own career documents" 
  ON public.career_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own career documents" 
  ON public.career_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own career documents" 
  ON public.career_documents FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" 
  ON public.interview_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own interview sessions" 
  ON public.interview_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interview sessions" 
  ON public.interview_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interview sessions" 
  ON public.interview_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for career_events
CREATE POLICY "Users can view their own career events" 
  ON public.career_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own career events" 
  ON public.career_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own career events" 
  ON public.career_events FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own career events" 
  ON public.career_events FOR DELETE USING (auth.uid() = user_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_documents_updated_at
  BEFORE UPDATE ON public.career_documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_career_events_updated_at
  BEFORE UPDATE ON public.career_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
