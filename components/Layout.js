import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import supabase from '@/lib/supabase'

const MENU = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Administratie', path: '/administratie' },
  { label: 'BIM', path: '/bim' },
  { label: 'Bouwplaats', path: '/bouwplaats' },
  { label: 'Calculatie', path: '/calculatie' },
  { label: 'Constructie', path: '/constructie' },
  { label: 'Documenten', path: '/documenten' },
  { label: 'Financiën', path: '/financien' },
  { label: 'Financieringen', path: '/financieringen' },
  { label: 'Inkoop', path: '/inkoop' },
  { label: 'Kopersportaal', path: '/kopersportaal' },
  { label: 'Mail', path: '/mail' },
  { label: 'Planning', path: '/planning' },
  { label: 'Projecten', path: '/projecten' },
  { label: 'Projectportaal', path: '/projectportaal' },
  { label: 'Instellingen', path: '/instellingen' }
]

export default function Layout({ children, hidePlatformSidebar = false }) { // Voeg prop toe
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user ?? null)
    }

    loadUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    )

    return () => {
      listener?.subscription?.unsubscribe()
    }
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Alleen sidebar tonen als hidePlatformSidebar false is */}
      {!hidePlatformSidebar && sidebarOpen && (
        <aside className="w-64 bg-white border-r flex flex-col">
          <div className="px-4 py-4 border-b font-bold text-lg">
            SterkBouw Platform
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1 overflow-y-auto">
            {MENU.map(item => {
              const active = router.pathname.startsWith(item.path)
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`block px-4 py-2 rounded text-sm font-medium transition
                    ${active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t px-4 py-3 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>Status</span>
              <span className="text-green-600 font-semibold">Live</span>
            </div>
            <div className="flex justify-between">
              <span>Versie</span>
              <span>v1.0</span>
            </div>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col">

        <header className="h-14 bg-white border-b flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {/* Alleen hamburger menu tonen als sidebar niet verborgen is */}
            {!hidePlatformSidebar && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 hover:text-black"
              >
                ☰
              </button>
            )}
            <span className="font-semibold">
              {/* Dynamische titel gebaseerd op huidige pagina */}
              {router.pathname === '/calculatie' || router.pathname === '/calculaties' 
                ? 'Calculatie' 
                : router.pathname === '/inkoop'
                ? 'Inkoop'
                : 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600 hidden md:block">
                {user.email}
              </span>
            )}
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:underline"
            >
              Uitloggen
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>

      </div>
    </div>
  )
}
