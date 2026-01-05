// ===============================
// TABLER – BASIS (ALLEEN CSS)
// ===============================
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// ===============================
// TAILWIND – TOEVOEGLAAG
// ===============================
import '@/styles/tailwind-addons.css'

// ===============================
// GLOBALS
// ===============================
import '@/styles/globals.css'

// ===============================
// NEXT
// ===============================
import { useRouter } from 'next/router'

// ===============================
// CLIENT WRAPPERS
// ===============================
import ClientOnly from '@/components/ClientOnly'
import AntdClientRoot from '@/components/AntdClientRoot'

// ===============================
// AUTH PROVIDER
// ===============================
import { AuthProvider } from '@/lib/auth'  

// ===============================
// LAYOUTS (NIETS VERWIJDERD)
// ===============================
import AdminLayout from '@/components/AdminLayout'
import TablerLayout from '@/components/TablerLayout' 

// ===============================
// APP
// ===============================
export default function App({ Component, pageProps }) {
  const router = useRouter()
  const path = router.asPath || '/'

  // ===============================
  // AUTH BYPASS (TIJDELIJK)
  // ===============================
  const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

  // Alleen echte public routes zonder sidebar
  const isPublicRoute = path.startsWith('/login')

  // ===============================
  // RENDER
  // ===============================
  return (
    <ClientOnly>
      <AntdClientRoot>
        {/* ⬇️ VOEG AuthProvider HIER TOE, BOVEN ALLES */}
        <AuthProvider>
          {AUTH_DISABLED ? (
            // ⬅️ AUTH VOLLEDIG GEPASSEERD, MAAR LAYOUT BLIJFT
            <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>
          ) : isPublicRoute ? (
            <Component {...pageProps} />
          ) : (
            // ⬇️ ADMIN SIDEBAR NORMAAL GEDWONGEN
            <AdminLayout>
              <Component {...pageProps} />
            </AdminLayout>
          )}
        </AuthProvider>
      </AntdClientRoot>
    </ClientOnly>
  )
}
