// pages/_app.js - MINIMALISTISCHE VERSIE
import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Head from 'next/head'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Mantine Provider - VOEG DIT TOE
import { MantineProvider } from '@mantine/core'
import '@mantine/core/styles.css' // VOEG DIT TOE

// Tabler CSS imports - BEWAAR DIT
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// Auth Provider - VOEG DIT TOE
import { AuthProvider } from '@/contexts/AuthContext'

// Query Client
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
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#206bc4" />
        
        {/* Favicon */}
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        
        {/* NProgress styles */}
        <style jsx global>{`
          #nprogress {
            pointer-events: none;
          }
          #nprogress .bar {
            background: #206bc4;
            position: fixed;
            z-index: 1031;
            top: 0;
            left: 0;
            width: 100%;
            height: 3px;
          }
        `}</style>
      </Head>

      <QueryClientProvider client={queryClient}>
        {/* MANTINE PROVIDER - VOEG DIT TOE */}
        <MantineProvider>
          {/* AUTH PROVIDER - VOEG DIT TOE */}
          <AuthProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            
            <Component {...pageProps} />
          </AuthProvider>
        </MantineProvider>
      </QueryClientProvider>
    </>
  )
}
