import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Development warning instead of throwing error
if (!supabaseUrl || !supabaseAnonKey) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('Supabase environment variables are missing. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
}

let supabaseClient = null

// Singleton pattern for client
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client in development if env vars are missing
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock Supabase client for development')
      return {
        auth: {
          getSession: () => Promise.resolve({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
          signOut: () => Promise.resolve({ error: null }),
          signUp: () => Promise.resolve({ data: { user: null }, error: null }),
          updateUser: () => Promise.resolve({ error: null }),
          resetPasswordForEmail: () => Promise.resolve({ error: null })
        },
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null })
            }),
            insert: () => ({
              select: () => ({
                single: () => Promise.resolve({ data: null, error: null })
              })
            }),
            update: () => ({
              eq: () => ({
                select: () => ({
                  single: () => Promise.resolve({ data: null, error: null })
                })
              })
            })
          })
        }),
        storage: {
          from: () => ({
            upload: () => Promise.resolve({ data: null, error: null }),
            getPublicUrl: () => ({ data: { publicUrl: '' } })
          })
        }
      }
    }
    throw new Error("Supabase environment variables are required for production")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
      storageKey: 'sterkbouw-supabase-auth',
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'sterkbouw-frontend',
        'x-client-info': 'nextjs-frontend'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  })
}

// Getter function with singleton pattern
export const getSupabase = () => {
  if (!supabaseClient) {
    supabaseClient = createSupabaseClient()
  }
  return supabaseClient
}

// For browser environment - attach to window for dev tools
if (typeof window !== 'undefined') {
  window.__STERKBOUW_SUPABASE__ = getSupabase()
}

// Named export
export const supabase = getSupabase()

// Default export
export default supabase

// Helper functions
export const uploadFile = async (bucket, path, file, options = {}) => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        ...options
      })

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('File upload error:', error)
    return { success: false, error }
  }
}

export const getFileUrl = (bucket, path) => {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path, {
      download: false,
      transform: {
        width: 800,
        height: 600,
        quality: 80
      }
    })
  return data.publicUrl
}

export const deleteFile = async (bucket, path) => {
  try {
    const { data, error } = await supabase
      .storage
      .from(bucket)
      .remove([path])

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('File delete error:', error)
    return { success: false, error }
  }
}

export const subscribeToTable = (table, event, callback) => {
  return supabase
    .channel('public:' + table)
    .on(
      'postgres_changes',
      {
        event,
        schema: 'public',
        table
      },
      callback
    )
    .subscribe()
}

export const unsubscribe = (channel) => {
  if (channel) {
    supabase.removeChannel(channel)
  }
}

// Auth helper functions
export const getCurrentUser = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.user || null
}

export const getUserProfile = async (userId) => {
  if (!userId) return null
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Profile fetch error:', error)
    return null
  }
  
  return data
}

export const updateUserProfile = async (userId, profileData) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Database helper functions
export const fetchTable = async (table, query = {}, options = {}) => {
  let queryBuilder = supabase.from(table).select('*')

  // Apply filters
  if (query.filters) {
    query.filters.forEach(filter => {
      queryBuilder = queryBuilder.eq(filter.column, filter.value)
    })
  }

  // Apply ordering
  if (query.orderBy) {
    queryBuilder = queryBuilder.order(query.orderBy.column, {
      ascending: query.orderBy.ascending !== false
    })
  }

  // Apply pagination
  if (query.range) {
    queryBuilder = queryBuilder.range(query.range.from, query.range.to)
  }

  const { data, error, count } = await queryBuilder

  if (error) throw error
  return { data, count }
}

export const insertRecord = async (table, record) => {
  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single()

  if (error) throw error
  return data
}

export const updateRecord = async (table, id, updates) => {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteRecord = async (table, id) => {
  const { data, error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Error handling utilities
export const handleSupabaseError = (error, context = '') => {
  console.error(`Supabase error ${context}:`, error)
  
  // Common error messages
  const errorMessages = {
    'Invalid login credentials': 'Ongeldige inloggegevens',
    'Email not confirmed': 'Email niet bevestigd. Controleer je inbox.',
    'User already registered': 'Dit emailadres is al geregistreerd',
    'Network request failed': 'Netwerkfout. Controleer je internetverbinding.',
    'JWT expired': 'Sessie verlopen. Log opnieuw in.'
  }

  const message = errorMessages[error.message] || error.message || 'Er is een fout opgetreden'
  
  return {
    success: false,
    error: message,
    originalError: error
  }
}

// Type definitions for better IDE support
/**
 * @typedef {Object} SupabaseQuery
 * @property {Array<{column: string, value: any}>} [filters]
 * @property {{column: string, ascending: boolean}} [orderBy]
 * @property {{from: number, to: number}} [range]
 */

/**
 * @typedef {Object} UploadOptions
 * @property {string} [cacheControl]
 * @property {boolean} [upsert]
 */

// Health check
export const checkSupabaseHealth = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true })
    
    return {
      healthy: !error,
      connected: true,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    return {
      healthy: false,
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }
  }
}
