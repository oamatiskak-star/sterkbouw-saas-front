// src/components/SharedAuth.js - Werkt in Pages EN App Router
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router' // Werkt in beide
import { supabase } from '@/lib/supabase'

export function useSharedAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
      
      if (!user && router.pathname !== '/login') {
        router.push('/login')
      }
    }
    
    checkAuth()
    
    // Listen to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [router])

  return { user, loading }
}
