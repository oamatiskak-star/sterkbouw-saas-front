import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import App from 'next/app'

// Externe libraries
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Mantine v7 (GEEN globale CSS import)
import { MantineProvider } from '@mantine/core'

// Tabler (bewust nog aanwezig)
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// Eigen styles
import '@/styles/globals.css'

// Layouts
import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'

// Contexts
import { ProjectProvider } from '@/contexts/ProjectContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { NavigationProvider } from '@/contexts/NavigationContext'

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

// -------------------------
// Admin role guard
// -------------------------
function AdminGuard({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) return null

  if (!user) {
    router.replace('/login')
    return null
  }

  const allowedRoles = ['PROJECT_MANAGER', 'ADMIN', 'SUPER_ADMIN']
  if (!allowedRoles.includes(user.role)) {
    router.replace('/')
    return null
  }

  return children
}

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  const [colorScheme] = useState('light')

  // -------------------------
  // NProgress
  // -------------------------
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
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="theme-color"
          content={colorScheme === 'dark' ? '#1d273b' : '#206bc4'}
        />
        <link rel="icon" href="/favicon-32x32.png" />
      </Head>

      <QueryClientProvider client={queryClient}>
        <MantineProvider
          theme={{
            colorScheme,
            primaryColor: 'blue',
          }}
        >
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

/**
 * 🔴 CRUCIAAL
 * Dit schakelt SSG / prerendering GLOBAAL uit
 * en forceert SSR voor de hele app
 */
MyApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext)
  return { ...appProps }
}

export default MyApp
