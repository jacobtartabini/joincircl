
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ubxepyzyzctzwsxxzjot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVieGVweXp5emN0endzeHh6am90Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYxNTQ1OTIsImV4cCI6MjA2MTczMDU5Mn0.9Ba1jhlDqSvtu7qNUDCWVQkjMB837m_5MdjELNjIUCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
