// pages/dashboard/index.js
import Link from "next/link"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function DashboardPage() {
  const [modules, setModules] = useState([])
  const [stats, setStats] = useState({
    activeProjects: 0,
    cashflow: 0,
    ongoingTasks: 0,
    openIssues: 0,
    budgetUtilization: 0
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadDashboardData() {
      try {
        setLoading(true)
        
        // Load modules
        const { data: modulesData, error: modulesError } = await supabase
          .from("modules")
          .select("key,label,route,icon,sort_order,color")
          .eq("active", true)
          .not("route", "like", "%/%/%")
          .neq("route", "/dashboard")
          .order("sort_order", { ascending: true })

        if (modulesError) {
          console.error("Error loading modules:", modulesError)
          return
        }

        // Load stats (vervang dit met je echte data queries)
        // Voorbeeld queries - pas aan aan je database structuur
        const { count: activeProjectsCount } = await supabase
          .from("projects")
          .select("*", { count: 'exact', head: true })
          .eq("status", "active")

        const { data: cashflowData } = await supabase
          .from("financials")
          .select("amount")
          .eq("type", "income")
          .single()

        // Load recent activity
        const { data: activityData } = await supabase
          .from("activities")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5)

        if (!cancelled) {
          setModules(modulesData || [])
          setStats({
            activeProjects: activeProjectsCount || 0,
            cashflow: cashflowData?.amount || 0,
            ongoingTasks: 0, // Vul aan
            openIssues: 0, // Vul aan
            budgetUtilization: 65 // Voorbeeld percentage
          })
          setRecentActivity(activityData || [])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadDashboardData()
    
    return () => {
      cancelled = true
    }
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getColorClass = (color) => {
    const colorMap = {
      blue: 'bg-blue',
      green: 'bg-green',
      orange: 'bg-orange',
      red: 'bg-red',
      purple: 'bg-purple',
      teal: 'bg-teal',
      cyan: 'bg-cyan',
      pink: 'bg-pink'
    }
    return colorMap[color] || 'bg-blue'
  }

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h3 className="text-muted">Dashboard laden...</h3>
      </div>
    )
  }

  return (
    <div className="container-fluid px-lg-4 px-xl-5">
      {/* Page Header with Welcome */}
      <div className="page-header d-print-none mb-4 pt-4">
        <div className="row align-items-center g-3">
          <div className="col">
            <div className="page-pretitle">Overzicht</div>
            <h1 className="page-title">Dashboard</h1>
            <p className="text-muted mb-0">
              Welkom terug! Hier is een overzicht van al je bouwprojecten en activiteiten
            </p>
          </div>
          <div className="col-auto">
            <div className="btn-list">
              <button className="btn btn-primary">
                <i className="ti ti-plus me-2"></i>
                Nieuw Project
              </button>
              <button className="btn btn-outline-secondary">
                <i className="ti ti-report-analytics me-2"></i>
                Rapportage
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid - Verbeterd ontwerp */}
      <div className="row row-deck row-cards mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="card card-sm card-borderless bg-primary-lt">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-primary text-white avatar avatar-lg rounded">
                    <i className="ti ti-building-community fs-2"></i>
                  </div>
                </div>
                <div className="flex-fill ms-3">
                  <div className="h2 mb-1">{stats.activeProjects}</div>
                  <div className="text-muted">Actieve projecten</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="badge bg-primary">+2 deze maand</span>
                </div>
              </div>
            </div>
            <div className="card-footer">
              <a href="/projects" className="text-primary text-decoration-none">
                Bekijk alle projecten <i className="ti ti-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card card-sm card-borderless bg-green-lt">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-green text-white avatar avatar-lg rounded">
                    <i className="ti ti-cash fs-2"></i>
                  </div>
                </div>
                <div className="flex-fill ms-3">
                  <div className="h2 mb-1">{formatCurrency(stats.cashflow)}</div>
                  <div className="text-muted">Totale cashflow</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-success">
                    <i className="ti ti-trending-up me-1"></i> 12%
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <div className="progress progress-sm">
                  <div className="progress-bar bg-green" style={{ width: '78%' }}></div>
                </div>
                <small className="text-muted">78% van budget gebruikt</small>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card card-sm card-borderless bg-orange-lt">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-orange text-white avatar avatar-lg rounded">
                    <i className="ti ti-checklist fs-2"></i>
                  </div>
                </div>
                <div className="flex-fill ms-3">
                  <div className="h2 mb-1">{stats.ongoingTasks}</div>
                  <div className="text-muted">Lopende taken</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="badge bg-orange">5 hoog prioriteit</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between">
                  <small>Vandaag: 3 taken</small>
                  <small className="text-muted">2 achterstand</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="card card-sm card-borderless bg-red-lt">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0">
                  <div className="bg-red text-white avatar avatar-lg rounded">
                    <i className="ti ti-alert-triangle fs-2"></i>
                  </div>
                </div>
                <div className="flex-fill ms-3">
                  <div className="h2 mb-1">{stats.openIssues}</div>
                  <div className="text-muted">Open issues</div>
                </div>
                <div className="flex-shrink-0">
                  <span className="badge bg-danger">2 kritisch</span>
                </div>
              </div>
              <div className="mt-3">
                <a href="/issues" className="text-danger text-decoration-none">
                  <i className="ti ti-alert-circle me-1"></i>
                  Dringende actie nodig
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="row mb-4">
        <div className="col-lg-8">
          {/* Modules Grid - Verbeterd ontwerp */}
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">
                <i className="ti ti-apps me-2"></i>
                Modules
              </h3>
              <div className="card-actions">
                <span className="text-muted">Directe toegang tot alle functionaliteiten</span>
              </div>
            </div>
            <div className="card-body">
              {modules.length === 0 ? (
                <div className="text-center py-5">
                  <i className="ti ti-package-off text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                  <h3 className="text-muted">Geen modules beschikbaar</h3>
                  <p className="text-muted mb-0">
                    Configureer modules in de admininstellingen
                  </p>
                </div>
              ) : (
                <div className="row g-3">
                  {modules.map((module) => (
                    <div key={module.key} className="col-xl-3 col-lg-4 col-md-6">
                      <Link href={module.route}>
                        <a className="card card-link card-borderless hover-shadow-sm" style={{ textDecoration: 'none' }}>
                          <div className="card-body">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0">
                                <div className={`${getColorClass(module.color)} text-white avatar`}>
                                  <i className={`ti ti-${module.icon || 'box'}`}></i>
                                </div>
                              </div>
                              <div className="flex-fill ms-3">
                                <h4 className="mb-1">{module.label}</h4>
                                <div className="text-muted small">
                                  <i className="ti ti-arrow-right me-1"></i>
                                  Open module
                                </div>
                              </div>
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

          {/* Recent Activity with Timeline */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="ti ti-history me-2"></i>
                Recente activiteit
              </h3>
              <div className="card-actions">
                <Link href="/activities">
                  <a className="btn btn-outline-primary btn-sm">
                    Bekijk alles
                  </a>
                </Link>
              </div>
            </div>
            <div className="card-body">
              {recentActivity.length === 0 ? (
                <div className="text-center py-4">
                  <i className="ti ti-notes-off text-muted mb-3" style={{ fontSize: '2rem' }}></i>
                  <h4 className="text-muted">Geen recente activiteit</h4>
                  <p className="text-muted mb-0">
                    Er is nog geen activiteit geregistreerd in het systeem.
                  </p>
                </div>
              ) : (
                <div className="timeline timeline-activity">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-line"></div>
                      <div className="timeline-icon">
                        <i className={`ti ti-${activity.icon || 'circle'} ${activity.color || 'text-blue'}`}></i>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-date text-muted">
                          {new Date(activity.created_at).toLocaleDateString('nl-NL')}
                        </div>
                        <div className="d-flex align-items-center">
                          <div className="flex-fill">
                            <div className="fw-bold">{activity.title}</div>
                            <div className="text-muted">{activity.description}</div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className={`badge bg-${activity.type}-lt`}>
                              {activity.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar with Quick Actions and Upcoming */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-header">
              <h3 className="card-title">
                <i className="ti ti-bolt me-2"></i>
                Snelle acties
              </h3>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <a href="/projects/new" className="list-group-item list-group-item-action d-flex align-items-center">
                  <i className="ti ti-plus text-blue me-3"></i>
                  <div className="flex-fill">
                    <div>Nieuw project aanmaken</div>
                    <small className="text-muted">Start een nieuw bouwproject</small>
                  </div>
                </a>
                <a href="/calculaties/new" className="list-group-item list-group-item-action d-flex align-items-center">
                  <i className="ti ti-calculator text-green me-3"></i>
                  <div className="flex-fill">
                    <div>Nieuwe calculatie</div>
                    <small className="text-muted">Bereken projectkosten</small>
                  </div>
                </a>
                <a href="/financiering/aanvraag" className="list-group-item list-group-item-action d-flex align-items-center">
                  <i className="ti ti-pig-money text-purple me-3"></i>
                  <div className="flex-fill">
                    <div>Financiering aanvragen</div>
                    <small className="text-muted">Nieuwe financieringsaanvraag</small>
                  </div>
                </a>
                <a href="/mail" className="list-group-item list-group-item-action d-flex align-items-center">
                  <i className="ti ti-mail text-orange me-3"></i>
                  <div className="flex-fill">
                    <div>Nieuwe e-mail</div>
                    <small className="text-muted">Stuur een bericht</small>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <i className="ti ti-calendar-time me-2"></i>
                Aankomende deadlines
              </h3>
            </div>
            <div className="card-body">
              <div className="list-group list-group-flush">
                <div className="list-group-item">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="badge bg-danger">Morgen</span>
                    </div>
                    <div className="col">
                      <div className="fw-bold">Project offerte</div>
                      <small className="text-muted">Einddatum: 31 dec 2023</small>
                    </div>
                  </div>
                </div>
                <div className="list-group-item">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="badge bg-warning">3 dagen</span>
                    </div>
                    <div className="col">
                      <div>Constructieberekening</div>
                      <small className="text-muted">Einddatum: 3 jan 2024</small>
                    </div>
                  </div>
                </div>
                <div className="list-group-item">
                  <div className="row align-items-center">
                    <div className="col-auto">
                      <span className="badge bg-info">1 week</span>
                    </div>
                    <div className="col">
                      <div>Financiering rond</div>
                      <small className="text-muted">Einddatum: 8 jan 2024</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <a href="/calendar" className="text-primary text-decoration-none">
                  <i className="ti ti-calendar me-1"></i>
                  Volledige agenda bekijken
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
