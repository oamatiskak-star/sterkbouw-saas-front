import Link from "next/link"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import DashboardLayout from "@/components/DashboardLayout"

export default function DashboardPage() {
  const [modules, setModules] = useState([])
  const [stats, setStats] = useState({
    activeProjects: 12,
    cashflow: 2850000,
    ongoingTasks: 47,
    openIssues: 8,
    budgetUtilization: 68
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Fallback modules als database leeg is
  const fallbackModules = [
    {
      key: 'calculatie',
      label: 'Calculatie & Offertes',
      route: '/calculatie',
      icon: 'calculator',
      color: 'blue',
      description: 'Kostenberekeningen en offertes'
    },
    {
      key: 'projecten',
      label: 'Projecten',
      route: '/projecten',
      icon: 'building',
      color: 'green',
      description: 'Projectmanagement en planning'
    },
    {
      key: 'bim',
      label: 'BIM Modellen',
      route: '/bim',
      icon: 'cube',
      color: 'purple',
      description: '3D modellen en tekeningen'
    },
    {
      key: 'financien',
      label: 'Financiën',
      route: '/financien',
      icon: 'currency-euro',
      color: 'teal',
      description: 'Budgetten en facturatie'
    },
    {
      key: 'bouwplaats',
      label: 'Bouwplaats',
      route: '/bouwplaats',
      icon: 'building-warehouse',
      color: 'orange',
      description: 'Uitvoering en inspectie'
    },
    {
      key: 'urenregistratie',
      label: 'Urenregistratie',
      route: '/uren',
      icon: 'clock',
      color: 'pink',
      description: 'Uren en urenstaten'
    },
    {
      key: 'voorraad',
      label: 'Voorraad',
      route: '/voorraad',
      icon: 'package',
      color: 'cyan',
      description: 'Materialen en voorraadbeheer'
    },
    {
      key: 'documenten',
      label: 'Documenten',
      route: '/documenten',
      icon: 'files',
      color: 'yellow',
      description: 'Bestanden en documentatie'
    }
  ]

  // Fallback recente activiteiten
  const fallbackActivities = [
    {
      id: 1,
      title: 'Nieuw project aangemaakt',
      description: 'Woningbouw Amsterdam Noord',
      icon: 'building',
      color: 'blue',
      created_at: new Date().toISOString(),
      type: 'project'
    },
    {
      id: 2,
      title: 'Calculatie voltooid',
      description: 'Kantoorrenovatie Rotterdam',
      icon: 'calculator',
      color: 'green',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      type: 'calculatie'
    },
    {
      id: 3,
      title: 'BIM model geüpload',
      description: 'Nieuw ziekenhuis Utrecht',
      icon: 'cube',
      color: 'purple',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      type: 'bim'
    },
    {
      id: 4,
      title: 'Factuur verzonden',
      description: 'Factuur #2023-045',
      icon: 'receipt',
      color: 'teal',
      created_at: new Date(Date.now() - 259200000).toISOString(),
      type: 'finance'
    }
  ]

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true)
      
      try {
        // Check auth
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        setUser(session.user)
        
        // Probeer modules te laden
        try {
          const { data: modulesData, error } = await supabase
            .from('modules')
            .select('*')
            .eq('active', true)
            .order('sort_order')
          
          if (error) throw error
          
          if (modulesData && modulesData.length > 0) {
            setModules(modulesData)
          } else {
            setModules(fallbackModules)
          }
        } catch (error) {
          console.log('Using fallback modules')
          setModules(fallbackModules)
        }
        
        // Probeer activiteiten te laden
        try {
          const { data: activitiesData, error } = await supabase
            .from('activities')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)
          
          if (!error && activitiesData && activitiesData.length > 0) {
            setRecentActivity(activitiesData)
          } else {
            setRecentActivity(fallbackActivities)
          }
        } catch (error) {
          setRecentActivity(fallbackActivities)
        }
        
        // Laad echte statistieken
        try {
          const { count: projectCount } = await supabase
            .from('projects')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'active')
          
          if (projectCount !== null) {
            setStats(prev => ({ ...prev, activeProjects: projectCount }))
          }
        } catch (error) {
          console.log('Using default stats')
        }
        
      } catch (error) {
        console.error('Dashboard error:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
    
    // Luister naar auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session) {
          router.push('/login')
        }
      }
    )
    
    return () => subscription.unsubscribe()
  }, [router])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getIconClass = (iconName) => {
    return `ti ti-${iconName}`
  }

  const handleQuickAction = (action) => {
    switch(action) {
      case 'calculatie':
        router.push('/calculatie')
        break
      case 'new-project':
        router.push('/projecten/nieuw')
        break
      case 'financiering':
        router.push('/financien/aanvraag')
        break
      case 'inspectie':
        router.push('/bouwplaats/inspectie')
        break
      default:
        console.log('Action not defined:', action)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="container-fluid">
          <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
            <div className="col-12 text-center">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <h3 className="text-muted">Dashboard laden...</h3>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-fluid px-4 py-3">
        
        {/* Dashboard Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h2 mb-1">Dashboard</h1>
            <p className="text-muted mb-0">
              Welkom terug{user ? `, ${user.email}` : ''}! Hier is een overzicht van je bouwprojecten.
            </p>
          </div>
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary"
              onClick={() => handleQuickAction('calculatie')}
            >
              <i className="ti ti-calculator me-2"></i>
              Calculatie
            </button>
            <button 
              className="btn btn-success"
              onClick={() => handleQuickAction('new-project')}
            >
              <i className="ti ti-plus me-2"></i>
              Nieuw Project
            </button>
          </div>
        </div>

        {/* Statistics Row */}
        <div className="row mb-4">
          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-start border-primary border-3 shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs fw-bold text-primary text-uppercase mb-1">
                      Actieve Projecten
                    </div>
                    <div className="h5 mb-0 fw-bold text-gray-800">{stats.activeProjects}</div>
                    <div className="mt-2 mb-0 text-muted">
                      <span className="text-success me-2">
                        <i className="ti ti-trending-up me-1"></i>12%
                      </span>
                      <span className="text-nowrap">Sinds vorige maand</span>
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="ti ti-building-community text-primary fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-start border-success border-3 shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs fw-bold text-success text-uppercase mb-1">
                      Totale Cashflow
                    </div>
                    <div className="h5 mb-0 fw-bold text-gray-800">{formatCurrency(stats.cashflow)}</div>
                    <div className="mt-2 mb-0 text-muted">
                      <span className="text-success me-2">
                        <i className="ti ti-trending-up me-1"></i>8%
                      </span>
                      <span className="text-nowrap">Sinds vorige kwartaal</span>
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="ti ti-cash text-success fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-start border-warning border-3 shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs fw-bold text-warning text-uppercase mb-1">
                      Lopende Taken
                    </div>
                    <div className="h5 mb-0 fw-bold text-gray-800">{stats.ongoingTasks}</div>
                    <div className="mt-2 mb-0">
                      <div className="progress progress-sm">
                        <div 
                          className="progress-bar bg-warning" 
                          style={{ width: '75%' }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="ti ti-checklist text-warning fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-md-6 mb-4">
            <div className="card border-start border-danger border-3 shadow h-100 py-2">
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className="text-xs fw-bold text-danger text-uppercase mb-1">
                      Open Issues
                    </div>
                    <div className="h5 mb-0 fw-bold text-gray-800">{stats.openIssues}</div>
                    <div className="mt-2 mb-0 text-muted">
                      <span className="text-danger me-2">
                        <i className="ti ti-alert-triangle me-1"></i>2 kritisch
                      </span>
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className="ti ti-alert-octagon text-danger fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Row */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 fw-bold text-primary">
                  <i className="ti ti-bolt me-2"></i>
                  Snelle Acties
                </h6>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-xl-3 col-lg-4 col-md-6">
                    <div 
                      className="card card-hover shadow-sm border-0 rounded-3 cursor-pointer"
                      onClick={() => handleQuickAction('calculatie')}
                    >
                      <div className="card-body text-center p-4">
                        <div className="icon-shape icon-lg bg-blue text-white rounded-circle mb-3 mx-auto">
                          <i className="ti ti-calculator fs-2"></i>
                        </div>
                        <h5 className="card-title mb-2">Nieuwe Calculatie</h5>
                        <p className="card-text text-muted small">
                          Start een nieuwe kostenberekening
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-6">
                    <div 
                      className="card card-hover shadow-sm border-0 rounded-3 cursor-pointer"
                      onClick={() => handleQuickAction('new-project')}
                    >
                      <div className="card-body text-center p-4">
                        <div className="icon-shape icon-lg bg-green text-white rounded-circle mb-3 mx-auto">
                          <i className="ti ti-plus fs-2"></i>
                        </div>
                        <h5 className="card-title mb-2">Nieuw Project</h5>
                        <p className="card-text text-muted small">
                          Creëer een nieuw bouwproject
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-6">
                    <div 
                      className="card card-hover shadow-sm border-0 rounded-3 cursor-pointer"
                      onClick={() => handleQuickAction('financiering')}
                    >
                      <div className="card-body text-center p-4">
                        <div className="icon-shape icon-lg bg-purple text-white rounded-circle mb-3 mx-auto">
                          <i className="ti ti-pig-money fs-2"></i>
                        </div>
                        <h5 className="card-title mb-2">Financiering</h5>
                        <p className="card-text text-muted small">
                          Nieuwe financieringsaanvraag
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-xl-3 col-lg-4 col-md-6">
                    <div 
                      className="card card-hover shadow-sm border-0 rounded-3 cursor-pointer"
                      onClick={() => handleQuickAction('inspectie')}
                    >
                      <div className="card-body text-center p-4">
                        <div className="icon-shape icon-lg bg-orange text-white rounded-circle mb-3 mx-auto">
                          <i className="ti ti-building-warehouse fs-2"></i>
                        </div>
                        <h5 className="card-title mb-2">Bouwinspectie</h5>
                        <p className="card-text text-muted small">
                          Start AI bouwinspectie
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Row */}
        <div className="row">
          {/* Modules Section */}
          <div className="col-lg-8 mb-4">
            <div className="card shadow">
              <div className="card-header py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-bold text-primary">
                    <i className="ti ti-apps me-2"></i>
                    Alle Modules
                  </h6>
                  <span className="badge bg-primary">{modules.length} modules</span>
                </div>
              </div>
              <div className="card-body">
                {modules.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="ti ti-package-off text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                    <h5 className="text-muted">Geen modules beschikbaar</h5>
                    <p className="text-muted mb-0">
                      Er zijn momenteel geen modules geconfigureerd
                    </p>
                  </div>
                ) : (
                  <div className="row g-3">
                    {modules.map((module) => (
                      <div key={module.key} className="col-xl-3 col-lg-4 col-md-6">
                        <Link href={module.route || '#'}>
                          <a className="text-decoration-none">
                            <div className="card card-hover border-0 shadow-sm h-100">
                              <div className="card-body text-center p-3">
                                <div className={`icon-shape bg-${module.color || 'primary'}-subtle text-${module.color || 'primary'} rounded-circle mb-3 mx-auto p-3`}>
                                  <i className={`ti ti-${module.icon || 'box'} fs-3`}></i>
                                </div>
                                <h6 className="card-title mb-1">{module.label}</h6>
                                <p className="card-text text-muted small mb-0">
                                  {module.description || 'Open module'}
                                </p>
                              </div>
                            </div>
                          </a>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card shadow mt-4">
              <div className="card-header py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="m-0 fw-bold text-primary">
                    <i className="ti ti-history me-2"></i>
                    Recente Activiteit
                  </h6>
                  <Link href="/activiteiten">
                    <a className="btn btn-sm btn-outline-primary">
                      Bekijk alles
                    </a>
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="ti ti-notes-off text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                    <p className="text-muted mb-0">Geen recente activiteit</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="list-group-item border-0 px-0 py-3">
                        <div className="d-flex align-items-start">
                          <div className={`icon-shape icon-sm bg-${activity.color || 'primary'}-subtle text-${activity.color || 'primary'} rounded-circle me-3`}>
                            <i className={`ti ti-${activity.icon || 'circle'}`}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{activity.title}</h6>
                            <p className="text-muted small mb-0">{activity.description}</p>
                            <small className="text-muted">
                              {new Date(activity.created_at).toLocaleString('nl-NL')}
                            </small>
                          </div>
                          <div className="ms-auto">
                            <span className={`badge bg-${activity.type || 'primary'}-subtle text-${activity.type || 'primary'}`}>
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="col-lg-4 mb-4">
            {/* Upcoming Deadlines */}
            <div className="card shadow mb-4">
              <div className="card-header py-3">
                <h6 className="m-0 fw-bold text-primary">
                  <i className="ti ti-calendar-time me-2"></i>
                  Aankomende Deadlines
                </h6>
              </div>
              <div className="card-body">
                <div className="list-group list-group-flush">
                  {[
                    { title: 'Project offerte', date: '31 dec 2023', days: 1, color: 'danger' },
                    { title: 'Constructieberekening', date: '3 jan 2024', days: 3, color: 'warning' },
                    { title: 'Financiering rond', date: '8 jan 2024', days: 8, color: 'info' },
                    { title: 'Bouwvergunning', date: '15 jan 2024', days: 15, color: 'success' }
                  ].map((deadline, index) => (
                    <div key={index} className="list-group-item border-0 px-0 py-3">
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0">
                          <span className={`badge bg-${deadline.color} me-2`}>
                            {deadline.days} {deadline.days === 1 ? 'dag' : 'dagen'}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <div className="fw-bold">{deadline.title}</div>
                          <small className="text-muted">Deadline: {deadline.date}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-center">
                  <Link href="/agenda">
                    <a className="text-decoration-none">
                      <i className="ti ti-calendar me-1"></i>
                      Volledige agenda bekijken
                    </a>
                  </Link>
                </div>
              </div>
            </div>

            {/* AI Bouwinspecteur */}
            <div className="card shadow">
              <div className="card-header py-3">
                <h6 className="m-0 fw-bold text-primary">
                  <i className="ti ti-robot me-2"></i>
                  AI Bouwinspecteur
                </h6>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <div className="icon-shape icon-xl bg-success text-white rounded-circle mb-3 mx-auto">
                    <i className="ti ti-shield-check fs-2"></i>
                  </div>
                  <h5 className="mb-2">Status: <span className="text-success">Actief</span></h5>
                  <p className="text-muted mb-3">
                    AI-inspecteur is actief op de bouwplaats
                  </p>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Veiligheidsscore</span>
                    <span className="fw-bold">92%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-success" 
                      style={{ width: '92%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Voortgang inspectie</span>
                    <span className="fw-bold">78%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-info" 
                      style={{ width: '78%' }}
                    ></div>
                  </div>
                </div>
                
                <Link href="/bouwplaats">
                  <a className="btn btn-primary w-100">
                    <i className="ti ti-arrow-right me-2"></i>
                    Naar Bouwplaats App
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
