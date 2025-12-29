// components/Layout.js
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const router = useRouter()

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fas fa-home' },
    { name: 'Projecten', href: '/projecten', icon: 'fas fa-building' },
    { name: 'Calculaties', href: '/calculaties', icon: 'fas fa-calculator' },
    { name: 'Financiering', href: '/financiering', icon: 'fas fa-euro-sign' },
    { name: 'Bouwplaats', href: '/bouwplaatsApp', icon: 'fas fa-hard-hat' },
    { name: 'BIM Ontwerpen', href: '/bim', icon: 'fas fa-drafting-compass' },
    { name: 'Constructie', href: '/constructie', icon: 'fas fa-ruler-combined' },
    { name: 'Mail', href: '/mail', icon: 'fas fa-envelope' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-auto lg:z-auto`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-building text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Sterkbouw</h1>
                <p className="text-xs text-gray-500">Bouw Management</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = router.pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <a
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <i className={`${item.icon} ${isActive ? 'text-blue-600' : 'text-gray-500'}`}></i>
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </a>
                </Link>
              )
            })}
          </nav>

          {/* User profile */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="font-bold text-blue-600">JV</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Jan Visser</p>
                <p className="text-xs text-gray-500 truncate">Uitvoerder</p>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-2"
              >
                <i className="fas fa-bars text-lg"></i>
              </button>
              <div className="ml-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(nav => nav.href === router.pathname)?.name || 'Dashboard'}
                </h2>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <i className="fas fa-bell"></i>
              </button>
              <button className="text-gray-500 hover:text-gray-700 p-2">
                <i className="fas fa-search"></i>
              </button>
              <div className="hidden lg:block">
                <div className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('nl-NL', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
