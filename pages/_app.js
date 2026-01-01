// pages/_app.js

// ===============================
// TABLER – BASIS (EERST LADEN)
// ===============================
import '@tabler/core/dist/css/tabler.min.css'
import '@tabler/core/dist/css/tabler-vendors.min.css'
import '@tabler/icons-webfont/dist/tabler-icons.min.css'

// ===============================
// TAILWIND – TOEVOEGLAAG (GESCOPE)
// ===============================
import '@/styles/tailwind-addons.css'

// ===============================
// GLOBALS
// ===============================
import '@/styles/globals.css'

// ===============================
// NEXT / REACT
// ===============================
import { useRouter } from 'next/router'

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
export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  const isAdminRoute = ADMIN_ROUTES.some(route =>
    router.pathname.startsWith(route)
  )

  const isTablerRoute = TABLER_ROUTES.some(route =>
    router.pathname.startsWith(route)
  )

  let content = <Component {...pageProps} />

  if (isAdminRoute) {
    content = <AdminLayout>{content}</AdminLayout>
  } else if (isTablerRoute) {
    content = <TablerLayout>{content}</TablerLayout>
  }

  return content
}
