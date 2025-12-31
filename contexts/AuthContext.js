// contexts/AuthContext.js
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import getSupabase from '@/lib/supabase'
import { detectAppScope } from '@/lib/appScope'
import { isAdmin } from '@/lib/permissions'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const supabase = getSupabase()
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [appScope, setAppScope] = useState('dashboard')

  useEffect(() => {
    // App scope bepalen (client)
    if (typeof window !== 'undefined') {
      setAppScope(detectAppScope(window.location.host))
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      setSession(data.session || null)
      setUser(data.session?.user || null)

      if (data.session?.user) {
        await loadRoles(data.session.user.id)
      }

      setLoading(false)
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return
        setSession(newSession)
        setUser(newSession?.user || null)

        if (newSession?.user) {
          await loadRoles(newSession.user.id)
        } else {
          setRoles([])
        }
      }
    )

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const loadRoles = async (userId) => {
    // Verwacht tabel: user_roles (user_id, role)
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (!error && Array.isArray(data)) {
      const r = data.map(x => x.role)
      setRoles(r)
    } else {
      setRoles([])
    }
  }

  const value = useMemo(() => ({
    user,
    session,
    roles,
    appScope,
    loading,
    isAdmin: isAdmin(user),
    signInWithPassword: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),
    signOut: () => supabase.auth.signOut(),
  }), [user, session, roles, appScope, loading])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
