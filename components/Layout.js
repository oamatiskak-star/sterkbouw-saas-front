// components/Layout.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { user, logout } = useAuth()
  const router = useRouter()

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-home', badge: null },
    { name: 'Projecten', href: '/projecten', icon: 'fas fa-building', badge: 3 },
    { name: 'Calculaties', href: '/calculaties', icon: 'fas fa-calculator', badge: 2 },
    { name: 'Financiering', href: '/financiering', icon: 'fas fa-euro-sign', badge: 1 },
    { name: 'Bouwplaats', href: '/bouwplaatsApp', icon: 'fas fa-hard-hat', badge: 'AI' },
    { name: 'BIM Ontwerpen', href: '/bim', icon: 'fas fa-drafting-compass', badge: null },
    { name: 'Constructie', href: '/constructie', icon: 'fas fa-ruler-combined', badge: null },
    { name: 'Mail', href: '/mail', icon: 'fas fa-envelope', badge: 5 },
    { name: 'Investeringen', href: '/investeringen', icon: 'fas fa-chart-line', badge: null },
    { name: 'Faseringen', href: '/faseringen', icon: 'fas fa-calendar-alt', badge: null },
  ]

  // Close sidebar on route change (mobile)
  useEffect(() => {
    const handleRouteChange = () => {
      if (sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    router.events.on('routeChangeComplete', handleRouteChange)
    return () => router.events.off('routeChangeComplete', handleRouteChange)
  }, [router, sidebarOpen])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-20 px-6 flex items-center border-b border-gray-200">
            <Link href="/dashboard">
              <a className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-md">
                  <i className="fas fa-building text-white text-xl"></i>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sterkbouw</h1>
                  <p className="text-xs text-blue-600 font-medium">Bouw Management Systeem</p>
                </div>
              </a>
            </Link>
          </div>

          {/* Search */}
          <div className="px-4 py-5">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Zoek projecten, taken..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
            </form>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href || 
                router.pathname.startsWith(`${item.href}/`)
              
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-r-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`${item.icon} ${isActive ? 'text-blue-600' : 'text-gray-500'} text-lg`}></i>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    
                    {item.badge && (
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isActive 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              )
            })}
          </nav>

          {/* User profile & Quick actions */}
          <div className="border-t border-gray-200 p-4 space-y-4">
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <button className="p-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                <i className="fas fa-plus text-sm"></i>
                <span className="text-xs font-medium ml-1">Nieuw</span>
              </button>
              <button className="p-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                <i className="fas fa-file-export text-sm"></i>
                <span className="text-xs font-medium ml-1">Export</span>
              </button>
            </div>

            {/* User */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Gebruiker'}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.role || 'Medewerker'}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Uitloggen"
              >
                <i className="fas fa-sign-out-alt"></i>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
              
              <div className="ml-4">
                <h1 className="text-lg font-bold text-gray-900">
                  {navigation.find(nav => nav.href === router.pathname)?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-gray-500">
                  {new Date().toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <i className="fas fa-bell text-xl"></i>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
              
              {/* Messages */}
              <div className="relative">
                <button className="p-2 text-gray-500 hover:text-gray-700 relative">
                  <i className="fas fa-envelope text-xl"></i>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                </button>
              </div>
              
              {/* Settings */}
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <i className="fas fa-cog text-xl"></i>
              </button>
              
              {/* Help */}
              <button className="p-2 text-gray-500 hover:text-gray-700">
                <i className="fas fa-question-circle text-xl"></i>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600">
              © {new Date().getFullYear()} Sterkbouw B.V. - Alle rechten voorbehouden
            </div>
            <div className="flex items-center space-x-4 mt-2 md:mt-0">
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Privacy</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Voorwaarden</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Help</a>
              <a href="#" className="text-sm text-gray-600 hover:text-blue-600">Contact</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
