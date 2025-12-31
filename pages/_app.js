// pages/_app.js
import '@/styles/globals.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/bouwplaatsApp',
]

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [supabaseClient, setSupabaseClient] = useState(null)
  const [session, setSession] = useState(null)

  // Initialiseer Supabase alleen op client-side
  useEffect(() => {
    const supabase = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
    setSupabaseClient(supabase)
  }, [])

  // Check auth state
  useEffect(() => {
    if (!supabaseClient) return

    const checkAuth = async () => {
      const { data: { session } } = await supabaseClient.auth.getSession()
      setSession(session)

      const isProtected = PROTECTED_ROUTES.some(route =>
        router.pathname.startsWith(route)
      )

      if (isProtected && !session) {
        router.replace('/auth/login')
      }
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [router.pathname, supabaseClient])

  // Render loading state tijdens initialisatie
  if (typeof window !== 'undefined' && !supabaseClient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initialiseren...</p>
        </div>
      </div>
    )
  }

  return <Component {...pageProps} />
}
