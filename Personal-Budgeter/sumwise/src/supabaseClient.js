import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const devHouseholdId = import.meta.env.VITE_DEV_HOUSEHOLD_ID;

export const supabase = createClient(supabaseUrl, supabasePublishableKey);