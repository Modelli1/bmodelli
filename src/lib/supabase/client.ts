import { createClient as createSupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iknwwfejvjhvvlhigdjg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlrbnd3ZmVqdmpodnZsaGlnZGpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MDM0MTMsImV4cCI6MjA5MDE3OTQxM30.MDaN9Czmr4li-OuMddcGrFUjVqNCB5kjfDVTalVjCgI'

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
