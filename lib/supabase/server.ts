import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

/**
 * Create a Supabase client for server-side operations
 * Always create a new client within each function when using it
 */
export async function createClient() {
  const cookieStore = await cookies()
  const db = 'https://dxjjrnklbasabyknbrpe.supabase.co';
  const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4ampybmtsYmFzYWJ5a25icnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxNTU1NzUsImV4cCI6MjA3NDczMTU3NX0.k4r-J-jl_11Nz7Jn4gWGrzNcFMyJ-Js_DOCnvaJhJzo'
  return createServerClient(db, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // The "setAll" method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
