// lib/auth.js
import { createContext, useContext, useEffect, useState } from "react"
import supabase from "@/lib/supabase"

// Auth context
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    // 1. Huidige sessie ophalen
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!mounted) return
      if (error) {
        console.error("Auth session error:", error)
      }
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Luisteren naar auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = {
    user,
    loading,

    // Auth acties
    signIn: (email, password) =>
      supabase.auth.signInWithPassword({ email, password }),

    signOut: () =>
      supabase.auth.signOut(),

    signUp: (email, password) =>
      supabase.auth.signUp({ email, password }),

    resetPassword: (email) =>
      supabase.auth.resetPasswordForEmail(email),

    updatePassword: (password) =>
      supabase.auth.updateUser({ password })
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

// Helpers (optioneel, correct)
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}
