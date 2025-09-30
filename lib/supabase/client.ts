import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
   const db = 'https://dxjjrnklbasabyknbrpe.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ampybmtsYmFzYWJ5a25icnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTU1NzUsImV4cCI6MjA3NDczMTU3NX0.k4r-J-jl_11Nz7Jn4gWGrzNcFMyJ-Js_DOCnvaJhJzo'
  const supabaseUrl = db || ''
  const supabaseAnonKey = key || ''

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Your project's URL and Key are required to create a Supabase client!\n\nCheck your Supabase project's API settings to find these values\n\nhttps://supabase.com/dashboard/project/_/settings/api`
    )
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
