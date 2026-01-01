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
// LAYOUTS (NIETS VERWIJDERD)
// ===============================
import AdminLayout from '@/components/AdminLayout'
import TablerLayout from '@/components/TablerLayout' // bewust behouden

// ===============================
// APP
// ===============================
export default function App({ Component, pageProps }) {
  const router = useRouter()
  const path = router.asPath || '/'

  // Alleen echte public routes zonder sidebar
  const isPublicRoute = path.startsWith('/login')

  return (
    <ClientOnly>
      <AntdClientRoot>
        {isPublicRoute ? (
          <Component {...pageProps} />
        ) : (
          // ⬇️ ADMIN SIDEBAR WORDT OVERAL AFGEDWONGEN
          <AdminLayout>
            <Component {...pageProps} />
          </AdminLayout>
        )}
      </AntdClientRoot>
    </ClientOnly>
  )
}
