import "../styles/globals.css"
import "../styles/layout.css"
import "../styles/kpi.css"
import "../styles/globals.mobile.css" // mobiele overrides

import { useEffect, useState } from "react"
import { useRouter } from "next/router"

import AppLayout from "../layouts/AppLayout"
import AuthLayout from "../layouts/AuthLayout"
import { getSession } from "../lib/auth"

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  const authPages = ["/", "/login"]
  const isAuthPage = authPages.includes(router.pathname)

  useEffect(() => {
    let mounted = true

    async function checkSession() {
      try {
        const s = await getSession()
        if (!mounted) return

        setSession(s || null)

        if (!s && !isAuthPage) {
          router.replace("/login")
          return
        }

        if (s && isAuthPage) {
          router.replace("/dashboard")
          return
        }
      } catch (err) {
        if (!mounted) return
        setSession(null)
        if (!isAuthPage) {
          router.replace("/login")
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkSession()

    return () => {
      mounted = false
    }
  }, [router.pathname])

  if (loading) return null

  if (isAuthPage) {
    return (
      <AuthLayout>
        <Component {...pageProps} />
      </AuthLayout>
    )
  }

  return (
    <div className="sb-app">
      <AppLayout session={session}>
        <main className="sb-main" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <Component {...pageProps} />
        </main>
      </AppLayout>
    </div>
  )
}
