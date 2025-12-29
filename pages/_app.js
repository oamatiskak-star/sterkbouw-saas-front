// pages/_app.js - GECORRIGEERDE VERSIE
import '@/styles/globals.css'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import Head from 'next/head'
import Script from 'next/script'
import ProgressBar from '@/components/ProgressBar'
import ErrorBoundary from '@/components/ErrorBoundary'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import Layout from '@/components/Layout'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

// Tabler CSS imports
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Font Awesome config
const loadFontAwesome = () => {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
    link.integrity = 'sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw=='
    link.crossOrigin = 'anonymous'
    link.referrerPolicy = 'no-referrer'
    document.head.appendChild(link)
  }
}

// PWA install prompt
const usePWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const installApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstallable(false)
      }
      setDeferredPrompt(null)
    }
  }

  return { isInstallable, installApp }
}

// Online/offline detection
const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { isInstallable, installApp } = usePWAInstallPrompt()
  const isOnline = useOnlineStatus()

  // Page loading progress
  useEffect(() => {
    const handleStart = () => {
      setLoading(true)
      NProgress.start()
    }
    const handleComplete = () => {
      setLoading(false)
      NProgress.done()
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  // Load Font Awesome
  useEffect(() => {
    loadFontAwesome()
  }, [])

  // Service worker registration for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        // Open search modal
        const event = new CustomEvent('openSearch')
        window.dispatchEvent(event)
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        const event = new CustomEvent('closeModals')
        window.dispatchEvent(event)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Error tracking
  useEffect(() => {
    const handleError = (error) => {
      console.error('Global error caught:', error)
      // Send to error tracking service
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleError)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleError)
    }
  }, [])

  // Analytics
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (window.gtag) {
        window.gtag('config', 'G-XXXXXXXXXX', {
          page_path: url,
        })
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <meta name="theme-color" content="#206bc4" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#206bc4" />
        
        {/* SEO Meta Tags */}
        <meta name="description" content="Sterkbouw Bouwplaats Management Systeem - AI-powered bouwinspectie en projectbeheer" />
        <meta name="keywords" content="bouw, constructie, projectmanagement, AI, inspectie, sterkbouw" />
        <meta name="author" content="Sterkbouw" />
        <meta property="og:title" content="Sterkbouw Bouwplaats App" />
        <meta property="og:description" content="AI-powered bouwinspectie en projectbeheer" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://bouwplaats.sterkbouw.nl" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style" />
        <link rel="dns-prefetch" href="https://cdnjs.cloudflare.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* NProgress styles - VERPLAATST VANAF HIER */}
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
          #nprogress .peg {
            display: block;
            position: absolute;
            right: 0px;
            width: 100px;
            height: 100%;
            box-shadow: 0 0 10px #206bc4, 0 0 5px #206bc4;
            opacity: 1.0;
            transform: rotate(3deg) translate(0px, -4px);
          }
        `}</style>
      </Head>

      {/* Analytics Script */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />

      {/* PWA Install Prompt */}
      {isInstallable && (
        <div className="fixed bottom-4 right-4 z-50 bg-white rounded-xl shadow-2xl p-4 max-w-sm animate-fade-in-up">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <i className="fas fa-mobile-alt text-blue-600 text-lg"></i>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">Installeer als App</p>
              <p className="text-sm text-gray-500 mt-1">Voor snellere toegang zonder browser</p>
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={installApp}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <i className="fas fa-download mr-2"></i>
                  Installeren
                </button>
                <button
                  onClick={() => setIsInstallable(false)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Later
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsInstallable(false)}
              className="flex-shrink-0 ml-4"
            >
              <i className="fas fa-times text-gray-400 hover:text-gray-500"></i>
            </button>
          </div>
        </div>
      )}

      {/* Offline Indicator */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50 animate-slide-down">
          <div className="container mx-auto px-4 flex items-center justify-center space-x-2">
            <i className="fas fa-wifi-slash"></i>
            <span>Je bent offline. Controleer je internetverbinding.</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Pagina laden...</p>
          </div>
        </div>
      )}

      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeProvider>
              <NotificationProvider>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                    },
                    error: {
                      duration: 5000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: '#fff',
                      },
                    },
                  }}
                />
                
                <ProgressBar />
                
                <Layout>
                  <Component {...pageProps} />
                </Layout>
                
                {process.env.NODE_ENV === 'development' && (
                  <ReactQueryDevtools initialIsOpen={false} />
                )}
              </NotificationProvider>
            </ThemeProvider>
          </AuthProvider>
        </ErrorBoundary>
      </QueryClientProvider>

      {/* Keyboard Shortcuts Help Modal Trigger */}
      <button
        onClick={() => {
          const event = new CustomEvent('openKeyboardShortcuts')
          window.dispatchEvent(event)
        }}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        title="Toetsenbord shortcuts (Ctrl+K)"
        aria-label="Toetsenbord shortcuts"
      >
        <i className="fas fa-keyboard"></i>
      </button>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-20 right-4 z-40 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 opacity-0 transform translate-y-4 transition-all duration-300"
        id="scrollToTop"
        aria-label="Terug naar boven"
        style={{ display: 'none' }}
      >
        <i className="fas fa-chevron-up"></i>
      </button>

      {/* Initialize scroll to top button */}
      <Script
        id="scroll-to-top-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            const scrollToTopButton = document.getElementById('scrollToTop');
            if (scrollToTopButton) {
              window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                  scrollToTopButton.style.display = 'flex';
                  scrollToTopButton.style.opacity = '1';
                  scrollToTopButton.style.transform = 'translateY(0)';
                } else {
                  scrollToTopButton.style.opacity = '0';
                  scrollToTopButton.style.transform = 'translateY(4px)';
                  setTimeout(() => {
                    if (window.pageYOffset <= 300) {
                      scrollToTopButton.style.display = 'none';
                    }
                  }, 300);
                }
              });
            }
          `,
        }}
      />

      {/* Error reporting script */}
      <Script
        id="error-reporting"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.onerror = function(msg, url, lineNo, columnNo, error) {
              console.error('Global error:', { msg, url, lineNo, columnNo, error });
              return false;
            };
            
            window.onunhandledrejection = function(event) {
              console.error('Unhandled promise rejection:', event.reason);
              return false;
            };
          `,
        }}
      />
    </>
  )
}
