// pages/_app.js

import '@/styles/globals.css'

// Tabler – globale dashboard CSS (verplicht)
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// Ant Design
import { ConfigProvider, theme as antdTheme } from 'antd'

// React / Next
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// Supabase
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

// Layout
import AdminLayout from '@/components/AdminLayout'

// Routes die auth + AdminLayout vereisen
const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/bouwplaatsApp',
]

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [supabaseClient, setSupabaseClient] = useState(null)
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  // Init Supabase (client-side)
  useEffect(() => {
    const supabase = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
    setSupabaseClient(supabase)
  }, [])

  // Auth check + route guard
  useEffect(() => {
    if (!supabaseClient) return

    const run = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession()

      setSession(session)

      const isProtected = PROTECTED_ROUTES.some(route =>
        router.pathname.startsWith(route)
      )

      if (isProtected && !session) {
        router.replace('/auth/login')
        return
      }

      setReady(true)
    }

    run()

    const { data: { subscription } } =
      supabaseClient.auth.onAuthStateChange((_event, session) => {
        setSession(session)
      })

    return () => subscription.unsubscribe()
  }, [router.pathname, supabaseClient])

  // Init / redirect guard
  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Initialiseren…</p>
        </div>
      </div>
    )
  }

  const isAdminRoute = PROTECTED_ROUTES.some(route =>
    router.pathname.startsWith(route)
  )

  const page = <Component {...pageProps} />

  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
      }}
    >
      {isAdminRoute ? <AdminLayout>{page}</AdminLayout> : page}
    </ConfigProvider>
  )
}
