
-- Add workflow fields to job_applications table
ALTER TABLE job_applications 
ADD COLUMN workflow_stage text DEFAULT 'application_info',
ADD COLUMN stage_completion jsonb DEFAULT '{}',
ADD COLUMN arlo_insights jsonb DEFAULT '{}',
ADD COLUMN job_description text,
ADD COLUMN interviewer_contacts text[] DEFAULT '{}';

-- Create application workflow data table for stage-specific data
CREATE TABLE application_workflow_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_application_id uuid REFERENCES job_applications(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  stage text NOT NULL,
  data jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the new table
ALTER TABLE application_workflow_data ENABLE ROW LEVEL SECURITY;

-- Create policies for application_workflow_data
CREATE POLICY "Users can view their own workflow data" 
  ON application_workflow_data 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own workflow data" 
  ON application_workflow_data 
  FOR INSERT 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own workflow data" 
  ON application_workflow_data 
  FOR UPDATE 
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own workflow data" 
  ON application_workflow_data 
  FOR DELETE 
  USING (user_id = auth.uid());

-- Create trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_data_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflow_data_updated_at_trigger
  BEFORE UPDATE ON application_workflow_data
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_data_updated_at();
