import "../styles/globals.css"
import "../styles/layout.css"
import "../styles/kpi.css"
import "../styles/globals.mobile.css"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/router"

import AppLayout from "../layouts/AppLayout"
import AuthLayout from "../layouts/AuthLayout"
import { getSession } from "../lib/auth"

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  // ======================
  // GUARDS
  // ======================
  const sessionCheckedRef = useRef(false)
  const redirectingRef = useRef(false)

  // ======================
  // STATE
  // ======================
  const [session, setSession] = useState(null)
  const [booting, setBooting] = useState(true)

  // ======================
  // CONFIG
  // ======================
  const authPages = ["/", "/login"]
  const isAuthPage = authPages.includes(router.pathname)

  // ======================
  // INIT SESSION – EXACT 1x
  // ======================
  useEffect(() => {
    if (sessionCheckedRef.current) return
    sessionCheckedRef.current = true

    let alive = true

    async function initSession() {
      try {
        const s = await getSession()
        if (!alive) return

        setSession(s || null)

        // ---- redirects alleen hier ----
        if (!s && !isAuthPage && !redirectingRef.current) {
          redirectingRef.current = true
          router.replace("/login")
          return
        }

        if (s && isAuthPage && !redirectingRef.current) {
          redirectingRef.current = true
          router.replace("/dashboard")
          return
        }
      } catch (_) {
        if (!alive) return
        setSession(null)

        if (!isAuthPage && !redirectingRef.current) {
          redirectingRef.current = true
          router.replace("/login")
        }
      } finally {
        if (alive) setBooting(false)
      }
    }

    initSession()

    return () => {
      alive = false
    }
  }, []) // ⬅️ BELANGRIJK: GEEN router.pathname

  // ======================
  // LOADING GATE
  // ======================
  if (booting) {
    return null
  }

  // ======================
  // AUTH PAGES
  // ======================
  if (isAuthPage) {
    return (
      <AuthLayout>
        <Component {...pageProps} />
      </AuthLayout>
    )
  }

  // ======================
  // APP PAGES
  // ======================
  return (
    <div className="sb-app">
      <AppLayout session={session}>
        <main
          className="sb-main"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%"
          }}
        >
          <Component {...pageProps} />
        </main>
      </AppLayout>
    </div>
  )
}
