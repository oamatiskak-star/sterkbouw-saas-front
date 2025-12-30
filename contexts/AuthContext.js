import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

/*
========================
SUPABASE CLIENT
========================
*/
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

/*
========================
AUTH CONTEXT
========================
*/
const AuthContext = createContext(null)

/*
========================
AUTH PROVIDER
========================
*/
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /*
  ------------------------
  INIT: bestaande sessie
  ------------------------
  */
  useEffect(() => {
    let mounted = true

    async function init() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      if (session?.user) {
        await hydrateUser(session.user)
      } else {
        setUser(null)
      }

      setLoading(false)
    }

    init()

    /*
    ------------------------
    AUTH STATE LISTENER
    ------------------------
    */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return

      if (session?.user) {
        await hydrateUser(session.user)
      } else {
        setUser(null)
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  /*
  ------------------------
  USER HYDRATION (DB → ROLE)
  ------------------------
  */
  async function hydrateUser(authUser) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name, is_active')
      .eq('id', authUser.id)
      .single()

    if (error || !data || data.is_active === false) {
      await supabase.auth.signOut()
      setUser(null)
      return
    }

    setUser({
      id: data.id,
      email: data.email,
      role: data.role,
      fullName: data.full_name,
    })
  }

  /*
  ------------------------
  LOGIN
  ------------------------
  */
  async function login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (data?.user) {
      await hydrateUser(data.user)
      return { success: true }
    }

    return { success: false, error: 'LOGIN_FAILED' }
  }

  /*
  ------------------------
  LOGOUT
  ------------------------
  */
  async function logout() {
    await supabase.auth.signOut()
    setUser(null)
  }

  /*
  ------------------------
  CONTEXT VALUE
  ------------------------
  */
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/*
========================
HOOK
========================
*/
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}
