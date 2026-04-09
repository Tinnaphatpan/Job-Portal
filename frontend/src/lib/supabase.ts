import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://qooslkvdqfvrdbxyfyux.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFvb3Nsa3ZkcWZ2cmRieHlmeXV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzA0ODMsImV4cCI6MjA5MDEwNjQ4M30.XhnckoAcZNx4p1LPMHJeu-VAMFv0UDJb6REVBfPZ84c'
);
