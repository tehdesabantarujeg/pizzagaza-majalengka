
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://gchyweianhphhhndmgoq.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdjaHl3ZWlhbmhwaGhobmRtZ29xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxMzQwMTAsImV4cCI6MjA1ODcxMDAxMH0.9AaUz_jl5GUJlltOz3S__o7-a_8TvQhMNliOGfL5Ezs';

if (!supabaseUrl) {
  throw new Error('Supabase URL is not defined');
}

if (!supabaseKey) {
  throw new Error('Supabase Key is not defined');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
