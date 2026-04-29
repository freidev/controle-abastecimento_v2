import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vgaiwxjjmsrnlwwmcxye.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnYWl3eGpqbXNybmx3d21jeHllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0MDY5MzIsImV4cCI6MjA5Mjk4MjkzMn0.8bhZWbdizObdpnLU7N16BmzgJqbA9niAM25fvL-XIVw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
