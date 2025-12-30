// components/Layout.js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import supabase from '@/lib/supabase'

export default function Layout({ children }) {  // Dit is al de export
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
    { name: 'BIM Modellen', icon: 'cube', path: '/bim' },
    { name: 'Financiën', icon: 'currency-euro', path: '/financien' },
    { name: 'Bouwplaats', icon: 'building-warehouse', path: '/bouwplaats' },
    { name: 'Documenten', icon: 'files', path: '/documenten' },
    { name: 'Instellingen', icon: 'settings', path: '/instellingen' },
  ]

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      {/* Top Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow">
        <div className="container-fluid">
          <button
            className="navbar-toggler"
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <Link href="/dashboard">
            <a className="navbar-brand fw-bold">
              <i className="ti ti-building me-2"></i>
              Bouw Management Systeem
            </a>
          </Link>
          
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link href="/dashboard">
                  <a className={`nav-link ${router.pathname === '/dashboard' ? 'active' : ''}`}>
                    Dashboard
                  </a>
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/projecten">
                  <a className={`nav-link ${router.pathname.startsWith('/projecten') ? 'active' : ''}`}>
                    Projecten
                  </a>
                </Link>
              </li>
            </ul>
            
            <div className="d-flex align-items-center">
              {user && (
                <>
                  <span className="text-white me-3">
                    Welkom, {user.email}
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
        </div>
      </nav>

      {/* Main Container */}
      <div className="d-flex flex-grow-1">
        {/* Sidebar */}
        {sidebarOpen && (
          <div className="bg-white border-end shadow-sm" style={{ width: '250px' }}>
            <div className="p-3 border-bottom">
              <h6 className="mb-0 text-muted">NAVIGATIE</h6>
            </div>
            <div className="list-group list-group-flush">
              {menuItems.map((item) => (
                <Link key={item.path} href={item.path}>
                  <a className={`list-group-item list-group-item-action border-0 py-3 ${
                    router.pathname === item.path ? 'active text-white' : ''
                  }`}>
                    <i className={`ti ti-${item.icon} me-2`}></i>
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
            
            {/* Quick Stats in Sidebar */}
            <div className="p-3 border-top">
              <h6 className="mb-2 text-muted">SNELLE INFO</h6>
              <div className="small">
                <div className="d-flex justify-content-between mb-1">
                  <span>Actieve projecten:</span>
                  <span className="fw-bold">12</span>
                </div>
                <div className="d-flex justify-content-between mb-1">
                  <span>Open taken:</span>
                  <span className="fw-bold">47</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Deadlines:</span>
                  <span className="fw-bold text-danger">3</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-grow-1 overflow-auto">
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-white py-3 mt-auto">
        <div className="container-fluid">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">
                &copy; {new Date().getFullYear()} Bouw Management Systeem. Alle rechten voorbehouden.
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="text-muted">Versie 2.0.1</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .list-group-item.active {
          background-color: #0d6efd;
          border-color: #0d6efd;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          transition: transform 0.2s;
        }
        .cursor-pointer {
          cursor: pointer;
        }
        .icon-shape {
          width: 3rem;
          height: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .icon-shape.icon-lg {
          width: 4rem;
          height: 4rem;
        }
        .icon-shape.icon-xl {
          width: 5rem;
          height: 5rem;
        }
        .icon-shape.icon-sm {
          width: 2.5rem;
          height: 2.5rem;
        }
      `}</style>
    </div>
  )
}
