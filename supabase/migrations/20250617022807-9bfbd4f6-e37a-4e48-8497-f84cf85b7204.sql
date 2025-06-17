
-- Add emails JSONB field to contacts table for scalable email storage
ALTER TABLE public.contacts 
ADD COLUMN emails JSONB DEFAULT '[]'::jsonb;

-- Create index on emails JSONB field for efficient querying
CREATE INDEX idx_contacts_emails_gin ON public.contacts USING gin (emails);

-- Add a computed column index for email search across the JSONB array using jsonb_path_ops
CREATE INDEX idx_contacts_emails_search ON public.contacts USING gin (emails jsonb_path_ops);
