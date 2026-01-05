// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
} else {
  console.error('❌ Supabase environment variables are missing!')
  // In development, we might want to throw an error, but in production we might not want to crash the app.
  // Instead, we can create a dummy client that throws errors when used.
  supabase = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: new Error('Missing env variables') }),
      getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Missing env variables') }),
      // ... andere methods die je gebruikt
    },
    from: () => ({
      select: () => ({
        data: null,
        error: new Error('Missing env variables'),
      }),
      // ... andere methods
    }),
    // ... andere modules
  }
}

export { supabase }

export const testSupabaseConnection = async () => {
  // Als de variabelen ontbreken, geef dan een foutmelding
  if (!supabaseUrl || !supabaseAnonKey) {
    return { connected: false, tableExists: false, error: 'Missing environment variables' }
  }

  try {
    const { data, error } = await supabase
      .from('calculaties')
      .select('count', { count: 'exact', head: true })
    
    if (error && error.code === 'PGRST301') {
      return { connected: true, tableExists: false, error: null }
    }
    
    return { 
      connected: !error, 
      tableExists: true, 
      error: error ? error.message : null 
    }
  } catch (err) {
    return { connected: false, tableExists: false, error: err.message }
  }
}
