// pages/_app.js
import '@/styles/globals.css'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/bouwplaatsApp',
]

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [session, setSession] = useState(null)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      const isProtected = PROTECTED_ROUTES.some(route =>
        router.pathname.startsWith(route)
      )

      if (isProtected && !session) {
        router.replace('/auth/login')
      }
    }

    checkAuth()
  }, [router.pathname])

  return <Component {...pageProps} />
}
