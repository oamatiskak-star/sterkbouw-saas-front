// pages/_app.js - GECORRIGEERDE VERSIE
import '@/styles/globals.css'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// MANTINE VOEGEN WE HIER TOE
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css'
import { AuthProvider } from '@/contexts/AuthContext'

// Tabler CSS
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

const queryClient = new QueryClient()

export default function App({ Component, pageProps }) {
  const router = useRouter()

  // Page loading progress
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

  return (
    <>
      {/* MANTINE PROVIDER WRAPT ALLES */}
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Toaster position="top-right" />
            <Component {...pageProps} />
          </AuthProvider>
        </QueryClientProvider>
      </MantineProvider>
    </>
  )
}
