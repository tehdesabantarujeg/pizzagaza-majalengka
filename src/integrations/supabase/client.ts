// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wbnpwldfcspeoiwofbiq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndibnB3bGRmY3NwZW9pd29mYmlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNTYyMDksImV4cCI6MjA1ODczMjIwOX0.yZ-SSI5m-QKgyBPAMLIpkn13MvGN8HszZN-PDusRh1s";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);