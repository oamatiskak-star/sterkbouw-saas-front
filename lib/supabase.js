// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const isDevelopment = process.env.NODE_ENV === 'development'
const useLocalApi = process.env.NEXT_PUBLIC_USE_LOCAL_API === 'true'

// Debug info alleen in development
if (isDevelopment) {
  console.log('🔧 Environment config:')
  console.log('- NODE_ENV:', process.env.NODE_ENV)
  console.log('- USE_LOCAL_API:', useLocalApi)
  console.log('- Supabase URL exists:', !!supabaseUrl)
  console.log('- Supabase Key exists:', !!supabaseAnonKey)
  console.log('- API URL:', process.env.NEXT_PUBLIC_API_URL)
}

// Check of we in Railway/Productie zijn zonder goede config
if (typeof window === 'undefined') {
  // Server-side check tijdens build
  if (!supabaseUrl || !supabaseAnonKey) {
    const error = `
      ⚠️  Supabase config missing in build!
      NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}
      NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}
      
      Controleer Railway environment variables!
    `
    if (process.env.NODE_ENV === 'production') {
      // In productie, gooi error zodat build faalt
      throw new Error(error)
    } else {
      console.warn(error)
    }
  }
}

// Maak de client, gebruik dummy waarden als er iets mist
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        'x-application-name': 'sterkbouw-saas',
      },
    },
  }
)

// Helper om te checken of Supabase goed is geconfigureerd
export const isSupabaseConfigured = () => {
  const hasUrl = !!supabaseUrl && !supabaseUrl.includes('placeholder')
  const hasKey = !!supabaseAnonKey && supabaseAnonKey.length > 20 // Minimaal length check
  
  return hasUrl && hasKey
}

// Test functie die ook voor Railway werkt
export const testSupabaseConnection = async () => {
  if (!isSupabaseConfigured()) {
    return {
      connected: false,
      tableExists: false,
      error: 'Supabase not properly configured',
      config: {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        urlLength: supabaseUrl?.length || 0,
        keyLength: supabaseAnonKey?.length || 0,
      }
    }
  }

  try {
    // Simpele query om verbinding te testen
    const { data, error } = await supabase
      .from('calculaties')
      .select('id')
      .limit(1)
    
    if (error) {
      // Specifieke error handling
      if (error.code === 'PGRST301') {
        return { 
          connected: true, 
          tableExists: false, 
          error: 'Table "calculaties" does not exist' 
        }
      }
      
      if (error.message?.includes('JWT')) {
        return {
          connected: false,
          tableExists: false,
          error: 'Invalid Supabase anon key'
        }
      }
      
      return {
        connected: false,
        tableExists: false,
        error: error.message
      }
    }
    
    return {
      connected: true,
      tableExists: true,
      error: null,
      sampleData: data
    }
    
  } catch (err) {
    return {
      connected: false,
      tableExists: false,
      error: err.message,
      stack: isDevelopment ? err.stack : undefined
    }
  }
}
