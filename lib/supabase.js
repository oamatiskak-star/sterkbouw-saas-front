import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

let supabase = null

/**
 * Singleton Supabase client
 * - Geschikt voor Next.js (client-side)
 * - Persistente sessie
 * - Token refresh actief
 */
export function getSupabase() {
  if (!supabase) {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'sterkbouw-auth',
      },
    })
  }

  return supabase
}

// Default export voor bestaande imports
export default getSupabase()

// Helper functions (gebruiken altijd dezelfde instance)
export const getSession = async () => {
  const { data, error } = await getSupabase().auth.getSession()
  if (error) throw error
  return data.session
}

export const getUser = async () => {
  const { data, error } = await getSupabase().auth.getUser()
  if (error) throw error
  return data.user
}

export const signOut = async () => {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}
