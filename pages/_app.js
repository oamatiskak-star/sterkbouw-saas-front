import App from 'next/app'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import { MantineProvider } from '@mantine/core'

import '@/styles/globals.css'

import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'

import { ProjectProvider } from '@/contexts/ProjectContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { NavigationProvider } from '@/contexts/NavigationContext'

/* -----------------------------
   React Query
-------------------------------- */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

/* -----------------------------
   Admin Guard
-------------------------------- */
function AdminGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return null

  if (!user) {
    router.replace('/login')
    return null
  }

  return children
}

/* -----------------------------
   App Component
-------------------------------- */
function AppClient({ Component, pageProps }) {
  const router = useRouter()
  const [colorScheme] = useState('light')

  useEffect(() => {
    const start = () => NProgress.start()
    const done = () => NProgress.done()

    router.events.on('routeChangeStart', start)
    router.events.on('routeChangeComplete', done)
    router.events.on('routeChangeError', done)

    return () => {
      router.events.off('routeChangeStart', start)
      router.events.off('routeChangeComplete', done)
      router.events.off('routeChangeError', done)
    }
  }, [router])

  const isAdminRoute = useMemo(
    () => router.pathname.startsWith('/admin'),
    [router.pathname]
  )

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <AuthProvider>
            <ProjectProvider>
              <WebSocketProvider>
                <NavigationProvider>
                  <Toaster position="top-right" />

                  {isAdminRoute ? (
                    <AdminGuard>
                      <AdminLayout>
                        <Component {...pageProps} />
                      </AdminLayout>
                    </AdminGuard>
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                </NavigationProvider>
              </WebSocketProvider>
            </ProjectProvider>
          </AuthProvider>
        </MantineProvider>
      </QueryClientProvider>
    </>
  )
}

/* ----------------------------------------------------
   🔒 DEFINITIEVE PLATFORM-FIX
   → forceert SSR
   → schakelt ALLE static prerendering uit
----------------------------------------------------- */
AppClient.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)
  return { ...appProps }
}

export default AppClient
