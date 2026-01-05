import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase environment variables are missing!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '*** set ***' : '❌ missing')
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Test connection
export const testSupabaseConnection = async () => {
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

// Export a function that returns the supabase client (for those who use getSupabase)
export const getSupabase = () => supabase

// Export the supabase client as default
export default supabase
