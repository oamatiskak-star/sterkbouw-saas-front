'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import supabase from '@/lib/supabase'

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState(null)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
    }
    
    getUser()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
      }
    )
    
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { name: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard' },
    { name: 'Calculatie', icon: 'calculator', path: '/calculatie' },
    { name: 'Projecten', icon: 'building', path: '/projecten' },
    { name: 'BIM', icon: 'cube', path: '/bim' },
    { name: 'Financiën', icon: 'currency-euro', path: '/financien' },
    { name: 'Bouwplaats', icon: 'building-warehouse', path: '/bouwplaats' },
    { name: 'Documenten', icon: 'files', path: '/documenten' },
    { name: 'Instellingen', icon: 'settings', path: '/instellingen' },
  ]

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Navigation - Vierkante styling */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <Link href="/dashboard" className="navbar-brand fw-bold text-decoration-none">
            <i className="ti ti-building me-2"></i>
            Bouw Management
          </Link>
          
          <div className="d-flex align-items-center ms-auto">
            {user && (
              <>
                <span className="text-white me-3 d-none d-md-block">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-light btn-sm"
                >
                  <i className="ti ti-logout me-1"></i>
                  Uitloggen
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar - Vierkante styling */}
        {sidebarOpen && (
          <div className="bg-white border-end" style={{ width: '250px' }}>
            <div className="p-3 border-bottom bg-white">
              <h6 className="mb-0 text-dark fw-bold">MENU</h6>
            </div>
            
            <div className="nav flex-column p-2">
              {menuItems.map((item) => (
                <Link 
                  key={item.path}
                  href={item.path}
                  className={`nav-link py-3 px-3 mb-1 d-flex align-items-center text-decoration-none ${
                    router.pathname === item.path 
                      ? 'bg-primary text-white' 
                      : 'text-dark bg-white border'
                  }`}
                  style={{ borderRadius: '0.375rem' }}
                >
                  <i className={`ti ti-${item.icon} me-3`}></i>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="p-3 border-top mt-auto bg-white">
              <div className="small text-muted">
                <div className="d-flex justify-content-between mb-2">
                  <span>Versie:</span>
                  <span className="fw-bold">2.0.1</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Status:</span>
                  <span className="text-success">● Online</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className="flex-grow-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-3">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0 small">
                &copy; {new Date().getFullYear()} Bouw Management Systeem
              </p>
            </div>
            <div className="col-md-6 text-end">
              <span className="badge bg-success">Live</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
