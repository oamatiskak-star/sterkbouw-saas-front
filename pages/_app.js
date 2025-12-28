// pages/_app.js
import "../styles/globals.css"
import "../styles/layout.css"
import "../styles/kpi.css"
import "../styles/globals.mobile.css"

import { useEffect, useRef, useState, Suspense } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import ErrorBoundary from "../components/ErrorBoundary"

import AppLayout from "../layouts/AppLayout"
import AuthLayout from "../layouts/AuthLayout"
import { getSession } from "../lib/auth"

// Loading component voor Suspense
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f8f9fa'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '5px solid #f3f3f3',
        borderTop: '5px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p style={{ color: '#666' }}>Applicatie laden...</p>
    </div>
    <style jsx>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
)

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
  
  // Nieuwe pagina's die speciale behandeling nodig hebben
  const publicPages = [
    "/nieuw",
    "/financien",
    "/bouwplaatsApp", 
    "/constructie",
    "/calculator",
    "/cashflow",
    "/planning",
    "/uploads"
  ]
  
  const isPublicPage = publicPages.includes(router.pathname)

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

        // ---- redirects alleen voor beveiligde pagina's ----
        if (!s && !isAuthPage && !isPublicPage && !redirectingRef.current) {
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

        if (!isAuthPage && !isPublicPage && !redirectingRef.current) {
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
  }, [])

  // ======================
  // ERROR BOUNDARY FALLBACK
  // ======================
  const ErrorFallback = ({ error, resetErrorBoundary }) => (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#e74c3c', marginBottom: '20px' }}>
        <i className="fas fa-exclamation-triangle" style={{ marginRight: '10px' }}></i>
        Oeps! Er is iets misgegaan
      </h1>
      <p style={{ color: '#666', marginBottom: '20px', maxWidth: '600px' }}>
        {error?.message || 'Er trad een onverwachte fout op.'}
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={resetErrorBoundary}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-redo" style={{ marginRight: '8px' }}></i>
          Probeer opnieuw
        </button>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          <i className="fas fa-home" style={{ marginRight: '8px' }}></i>
          Naar Dashboard
        </button>
      </div>
    </div>
  )

  // ======================
  // LOADING GATE
  // ======================
  if (booting) {
    return <LoadingFallback />
  }

  // ======================
  // HEAD ELEMENT VOOR ALLE PAGINA'S
  // ======================
  const HeadElement = () => (
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      {/* Voeg Chart.js toe voor financiële pagina's */}
      {router.pathname.includes('financien') && (
        <script src="https://cdn.jsdelivr.net/npm/chart.js" defer></script>
      )}
      {/* Voeg Three.js toe voor constructie pagina's */}
      {router.pathname.includes('constructie') && (
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" defer></script>
      )}
    </Head>
  )

  // ======================
  // AUTH PAGES
  // ======================
  if (isAuthPage) {
    return (
      <>
        <HeadElement />
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <AuthLayout>
            <Component {...pageProps} />
          </AuthLayout>
        </ErrorBoundary>
      </>
    )
  }

  // ======================
  // PUBLIEKE PAGINA'S (geen auth nodig)
  // ======================
  if (isPublicPage) {
    return (
      <>
        <HeadElement />
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingFallback />}>
            <Component {...pageProps} />
          </Suspense>
        </ErrorBoundary>
      </>
    )
  }

  // ======================
  // APP PAGES (beveiligde pagina's)
  // ======================
  return (
    <>
      <HeadElement />
      <ErrorBoundary FallbackComponent={ErrorFallback}>
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
              <Suspense fallback={<LoadingFallback />}>
                <Component {...pageProps} />
              </Suspense>
            </main>
          </AppLayout>
        </div>
      </ErrorBoundary>
    </>
  )
}

// Voeg styles toe voor loading spinner
const globalStyles = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-boundary {
    padding: 40px;
    text-align: center;
    background-color: #f8f9fa;
    min-height: 100vh;
  }
  
  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 5px solid #f3f3f3;
    border-top: 5px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20px;
  }
`
