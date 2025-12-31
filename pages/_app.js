// pages/_app.js
import '@/styles/globals.css'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { SessionContextProvider } from '@supabase/auth-helpers-react'

const supabase = createBrowserSupabaseClient()

const PROTECTED_ROUTES = [
  '/dashboard',
  '/admin',
  '/bouwplaatsApp',
]

export default function App({ Component, pageProps }) {
  const router = useRouter()

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

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <Component {...pageProps} />
    </SessionContextProvider>
  )
}
