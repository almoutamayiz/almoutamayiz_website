import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zpnsmgwkouwwnmvyikcr.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbnNtZ3drb3V3d25tdnlpa2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0MzA0OTgsImV4cCI6MjA4MDAwNjQ5OH0.psJrDLl2DDZft7D0Nuf4S8MsCdgJBBKIcW8IFoICi0U';

export const supabase = createClient(supabaseUrl, supabaseKey);