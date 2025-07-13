-- Create a table for storing mock interview sessions
CREATE TABLE public.mock_interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  job_title TEXT NOT NULL,
  company_name TEXT,
  job_description TEXT,
  experience_level TEXT DEFAULT 'mid',
  session_data JSONB NOT NULL DEFAULT '{}',
  questions JSONB NOT NULL DEFAULT '[]',
  responses JSONB NOT NULL DEFAULT '[]',
  overall_analysis JSONB NOT NULL DEFAULT '{}',
  total_duration INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own mock interview sessions" 
ON public.mock_interview_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mock interview sessions" 
ON public.mock_interview_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mock interview sessions" 
ON public.mock_interview_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mock interview sessions" 
ON public.mock_interview_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mock_interview_sessions_updated_at
BEFORE UPDATE ON public.mock_interview_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();