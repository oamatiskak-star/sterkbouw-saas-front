// pages/_app.js

// ===============================
// TABLER – BASIS (ALTIJD EERST)
// ===============================
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// ===============================
// TAILWIND – TOEVOEGLAAG (GESCOPE)
// ===============================
import '@/styles/tailwind-addons.css'

// ===============================
// GLOBALS (GEEN TAILWIND HIERIN)
// ===============================
import '@/styles/globals.css'

// ===============================
// NEXT / REACT
// ===============================
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// ===============================
// SUPABASE
// ===============================

// ===============================
// LAYOUTS
// ===============================
import AdminLayout from '@/components/AdminLayout'
import TablerLayout from '@/components/TablerLayout'

// ===============================
// ROUTES
// ===============================
const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/bouwplaatsApp',
]

const TABLER_ROUTES = [
  '/dashboard',
  '/projecten',
  '/calculaties',
  '/financiering',
  '/projectontwikkeling',
  '/bim',
  '/constructie',
  '/financien',
  '/investeringen',
  '/mail',
]

// ===============================
// APP
// ===============================
export default function App({ Component, pageProps }) {
  const router = useRouter()

  const [supabaseClient, setSupabaseClient] = useState(null)
  const [session, setSession] = useState(null)
  const [ready, setReady] = useState(false)

  // -------------------------------
  // Init Supabase (client-side)
  // -------------------------------
  useEffect(() => {
    const supabase = createPagesBrowserClient({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
    setSupabaseClient(supabase)
  }, [])

  // -------------------------------
// Bootstrap JS – CLIENT ONLY
// -------------------------------
useEffect(() => {
  if (typeof window !== 'undefined') {
    import('bootstrap/dist/js/bootstrap.bundle.min.js')
  }
}, [])

  // -------------------------------
  // Auth + route guard
  // -------------------------------
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

  // -------------------------------
  // TABLER loading screen
  // -------------------------------
  if (!ready) {
    return (
      <div className="page page-center">
        <div className="container-tight py-4">
          <div className="text-center">
            <div className="spinner-border text-primary" />
            <p className="mt-3 text-muted">Initialiseren…</p>
          </div>
        </div>
      </div>
    )
  }

  // -------------------------------
  // Layout selectie
  // -------------------------------
  const isAdminRoute = PROTECTED_ROUTES.some(route =>
    router.pathname.startsWith(route)
  )

  const isTablerRoute = TABLER_ROUTES.some(route =>
    router.pathname.startsWith(route)
  )

  const page = <Component {...pageProps} />

  let wrappedPage = page

  if (isTablerRoute) {
    wrappedPage = <TablerLayout>{page}</TablerLayout>
  } else if (isAdminRoute) {
    wrappedPage = <AdminLayout>{page}</AdminLayout>
  }

  // -------------------------------
  // Render
  // -------------------------------
return wrappedPage
