import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

// Externe libraries
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// UI frameworks
import { MantineProvider, ColorSchemeProvider } from '@mantine/core'
import '@mantine/core/styles.css'

// Tabler CSS
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// Eigen imports
import '@/styles/globals.css'
import Layout from '@/components/Layout'
import AdminLayout from '@/components/AdminLayout'

// Contexts / Providers
import { ProjectProvider } from '@/contexts/ProjectContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'

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

export default function App({ Component, pageProps }) {
  const router = useRouter()

  // -------------------------
  // Theme (dark / light)
  // -------------------------
  const [colorScheme, setColorScheme] = useState('light')

  const toggleColorScheme = () =>
    setColorScheme((current) => (current === 'dark' ? 'light' : 'dark'))

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
  // Admin route detectie
  // -------------------------
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
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={toggleColorScheme}
        >
          <MantineProvider
            theme={{
              colorScheme,
              primaryColor: 'blue',
            }}
            withGlobalStyles
            withNormalizeCSS
          >
            <AuthProvider>
              <ProjectProvider>
                <WebSocketProvider>
                  <Toaster position="top-right" />

                  {isAdminRoute ? (
                    <AdminGuard>
                      <AdminLayout
                        enableThemeToggle
                        enableNotifications
                        enableQuickActions
                        enableBreadcrumbs
                        responsiveSidebar
                      >
                        <Component {...pageProps} />
                      </AdminLayout>
                    </AdminGuard>
                  ) : (
                    <Layout>
                      <Component {...pageProps} />
                    </Layout>
                  )}
                </WebSocketProvider>
              </ProjectProvider>
            </AuthProvider>
          </MantineProvider>
        </ColorSchemeProvider>
      </QueryClientProvider>
    </>
  )
}
