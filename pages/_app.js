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
// CLIENT WRAPPERS (VERPLICHT)
// ===============================
import ClientOnly from '@/components/ClientOnly'
import AntdClientRoot from '@/components/AntdClientRoot'

// ===============================
// LAYOUTS
// ===============================
import AdminLayout from '@/components/AdminLayout'
import TablerLayout from '@/components/TablerLayout'

// ===============================
// ROUTE DEFINITIES
// ===============================
const ADMIN_ROUTES = [
  '/admin',
]

const TABLER_ROUTES = [
  '/login',
  '/dashboard',
  '/administratie',
  '/bim',
  '/bouwplaats',
  '/calculatie',
  '/constructie',
  '/documenten',
  '/financien',
  '/financieringen',
  '/inkoop',
  '/kopersportaal',
  '/mail',
  '/planning',
  '/projecten',
  '/projectportaal',
  '/instellingen',
]

// ===============================
// APP
// ===============================
export default function App({ Component, pageProps }) {
  const router = useRouter()

  return (
    <ClientOnly>
      <AntdClientRoot>
        {(() => {
          const path = router.asPath || '/'

          const isAdminRoute = ADMIN_ROUTES.some(route =>
            path.startsWith(route)
          )

          const isTablerRoute = TABLER_ROUTES.some(route =>
            path.startsWith(route)
          )

          let content = <Component {...pageProps} />

          if (isAdminRoute) {
            return <AdminLayout>{content}</AdminLayout>
          }

          if (isTablerRoute) {
            return <TablerLayout>{content}</TablerLayout>
          }

          return content
        })()}
      </AntdClientRoot>
    </ClientOnly>
  )
}
