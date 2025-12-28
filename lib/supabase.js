import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("SUPABASE ENV VARS MISSING")
}

let supabase

if (typeof window !== "undefined") {
  // browser: gebruik globale singleton
  if (!window.__SUPABASE__) {
    window.__SUPABASE__ = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    })
  }
  supabase = window.__SUPABASE__
} else {
  // server-side fallback
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

// Export als named export
export { supabase }

// Export ook een getter functie voor server-side
export function getSupabase() {
  return supabase
}
