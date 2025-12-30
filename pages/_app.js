import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// Externe libraries
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Eigen styles
import '@/styles/globals.css'

// Core Shell
import CoreShell from '@/components/core/CoreShell'

// Contexts / Providers
import { ProjectProvider } from '@/contexts/ProjectContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider } from '@/contexts/AuthContext'

// -------------------------
// React Query
// -------------------------
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App({ Component, pageProps }) {
  const router = useRouter()

  // -------------------------
  // NProgress
  // -------------------------
  useEffect(() => {
    const handleStart = () => NProgress.start()
    const handleComplete = () => NProgress.done()

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  // -------------------------
  // Host detectie (voor app_scope)
  // -------------------------
  const host =
    typeof window !== 'undefined'
      ? window.location.host
      : ''

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#facc15" />
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ProjectProvider>
            <WebSocketProvider>
              <Toaster position="top-right" />

              {/* CORE SHELL – altijd actief */}
              <CoreShell host={host}>
                <Component {...pageProps} />
              </CoreShell>

            </WebSocketProvider>
          </ProjectProvider>
        </AuthProvider>
      </QueryClientProvider>
    </>
  )
}
