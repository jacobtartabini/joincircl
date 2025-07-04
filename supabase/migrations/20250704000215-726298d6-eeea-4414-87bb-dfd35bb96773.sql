-- Add end_date and all_day fields to keystones table
ALTER TABLE public.keystones 
ADD COLUMN end_date timestamp with time zone,
ADD COLUMN all_day boolean DEFAULT false;

-- Add comments to clarify the fields
COMMENT ON COLUMN public.keystones.date IS 'Start date and time of the keystone/event';
COMMENT ON COLUMN public.keystones.end_date IS 'End date and time of the keystone/event (optional)';
COMMENT ON COLUMN public.keystones.all_day IS 'Whether this is an all-day event (ignores specific times)';