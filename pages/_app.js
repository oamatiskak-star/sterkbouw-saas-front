import "../styles/globals.css"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import AppLayout from "../layouts/AppLayout"
import AuthLayout from "../layouts/AuthLayout"
import { getSession } from "../lib/api"

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  const isAuthPage = router.pathname === "/login"

  useEffect(() => {
    async function checkSession() {
      try {
        const s = await getSession()
        setSession(s || null)

        if (!s && !isAuthPage) {
          router.replace("/login")
        }

        if (s && isAuthPage) {
          router.replace("/dashboard")
        }
      } catch (e) {
        setSession(null)
        if (!isAuthPage) router.replace("/login")
      } finally {
        setLoading(false)
      }
    }

    checkSession()
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
    <AppLayout session={session}>
      <Component {...pageProps} />
    </AppLayout>
  )
}
