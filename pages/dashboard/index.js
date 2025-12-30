import supabase from "@/lib/supabase"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Vierkante module knoppen - allemaal werkende links
  const modules = [
    {
      key: 'calculatie',
      label: 'Calculatie & Offertes',
      description: 'Kostenberekeningen en offertebeheer',
      icon: 'calculator',
      color: 'primary',
      path: '/calculatie',
      action: () => router.push('/calculatie')
    },
    {
      key: 'projecten',
      label: 'Projecten',
      description: 'Projectmanagement en planning',
      icon: 'building',
      color: 'success',
      path: '/projecten',
      action: () => router.push('/projecten')
    },
    {
      key: 'bim',
      label: 'BIM Modellen',
      description: '3D modellen en tekeningen',
      icon: 'cube',
      color: 'purple',
      path: '/bim',
      action: () => router.push('/bim')
    },
    {
      key: 'financien',
      label: 'Financiën',
      description: 'Budgetten, facturen en cashflow',
      icon: 'currency-euro',
      color: 'info',
      path: '/financien',
      action: () => router.push('/financien')
    },
    {
      key: 'bouwplaats',
      label: 'Bouwplaats',
      description: 'Uitvoering en inspectie',
      icon: 'building-warehouse',
      color: 'warning',
      path: '/bouwplaats',
      action: () => router.push('/bouwplaats')
    },
    {
      key: 'documenten',
      label: 'Documenten',
      description: 'Bestanden en documentatie',
      icon: 'files',
      color: 'secondary',
      path: '/documenten',
      action: () => router.push('/documenten')
    },
    {
      key: 'urenregistratie',
      label: 'Urenregistratie',
      description: 'Uren en urenstaten',
      icon: 'clock',
      color: 'danger',
      path: '/uren',
      action: () => router.push('/uren')
    },
    {
      key: 'voorraad',
      label: 'Voorraad',
      description: 'Materialen en voorraadbeheer',
      icon: 'package',
      color: 'teal',
      path: '/voorraad',
      action: () => router.push('/voorraad')
    }
  ]

  // Snelle acties - allemaal werkend
  const quickActions = [
    {
      title: 'Nieuwe Calculatie',
      icon: 'calculator',
      color: 'primary',
      path: '/calculatie/nieuw',
      action: () => router.push('/calculatie/nieuw')
    },
    {
      title: 'Nieuw Project',
      icon: 'building',
      color: 'success',
      path: '/projecten/nieuw',
      action: () => router.push('/projecten/nieuw')
    },
    {
      title: 'Financiering',
      icon: 'pig-money',
      color: 'info',
      path: '/financien/aanvraag',
      action: () => router.push('/financien/aanvraag')
    },
    {
      title: 'Bouwinspectie',
      icon: 'building-warehouse',
      color: 'warning',
      path: '/bouwplaats/inspectie',
      action: () => router.push('/bouwplaats/inspectie')
    }
  ]

  if (loading) {
    return (
      <Layout>
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container-fluid px-3 px-lg-4 py-4">
        
        {/* Dashboard Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
          <div>
            <h1 className="h2 mb-2">Dashboard</h1>
            <p className="text-muted mb-0">
              Welkom terug! Hier is een overzicht van je bouwprojecten.
            </p>
          </div>
          
          <div className="d-flex gap-2">
            <button 
              className="btn btn-primary d-flex align-items-center"
              onClick={() => router.push('/calculatie')}
            >
              <i className="ti ti-calculator me-2"></i>
              Naar Calculatie
            </button>
            <button 
              className="btn btn-success d-flex align-items-center"
              onClick={() => router.push('/projecten/nieuw')}
            >
              <i className="ti ti-plus me-2"></i>
              Nieuw Project
            </button>
          </div>
        </div>

        {/* Statistics Cards - Vierkante kaarten */}
        <div className="row g-3 mb-4">
          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="bg-primary-subtle p-3 me-3 rounded">
                    <i className="ti ti-building text-primary fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Actieve Projecten</div>
                    <div className="h4 mb-0 fw-bold">12</div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 py-2">
                <Link href="/projecten" className="text-primary text-decoration-none small">
                  Bekijk alle projecten →
                </Link>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="bg-success-subtle p-3 me-3 rounded">
                    <i className="ti ti-calculator text-success fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Open Calculaties</div>
                    <div className="h4 mb-0 fw-bold">8</div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 py-2">
                <Link href="/calculatie" className="text-success text-decoration-none small">
                  Bekijk calculaties →
                </Link>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="bg-warning-subtle p-3 me-3 rounded">
                    <i className="ti ti-alert-triangle text-warning fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Open Issues</div>
                    <div className="h4 mb-0 fw-bold">3</div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 py-2">
                <Link href="/issues" className="text-warning text-decoration-none small">
                  Bekijk issues →
                </Link>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-lg-6 col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className="bg-info-subtle p-3 me-3 rounded">
                    <i className="ti ti-cash text-info fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Totale Cashflow</div>
                    <div className="h4 mb-0 fw-bold">€2.8M</div>
                  </div>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0 py-2">
                <Link href="/financien" className="text-info text-decoration-none small">
                  Bekijk financiën →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Snelle Acties - Vierkante knoppen */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="ti ti-bolt text-primary me-2"></i>
                  Snelle Acties
                </h5>
              </div>
              <div className="card-body p-3">
                <div className="row g-3">
                  {quickActions.map((action, index) => (
                    <div key={index} className="col-xl-3 col-lg-4 col-md-6">
                      <div 
                        className="card border h-100 cursor-pointer hover-shadow"
                        onClick={action.action}
                        style={{ minHeight: '120px' }}
                      >
                        <div className="card-body d-flex flex-column justify-content-center align-items-center text-center p-4">
                          <div className={`bg-${action.color}-subtle p-3 mb-3 rounded`}>
                            <i className={`ti ti-${action.icon} text-${action.color} fs-3`}></i>
                          </div>
                          <h6 className="card-title mb-2">{action.title}</h6>
                          <div className="text-muted small">
                            <i className="ti ti-arrow-right me-1"></i>
                            Direct starten
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alle Modules - Vierkante kaarten */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="ti ti-apps text-primary me-2"></i>
                  Alle Modules
                </h5>
              </div>
              <div className="card-body p-3">
                <div className="row g-3">
                  {modules.map((module) => (
                    <div key={module.key} className="col-xl-3 col-lg-4 col-md-6">
                      <div 
                        className="card border h-100 cursor-pointer hover-shadow"
                        onClick={module.action}
                        style={{ minHeight: '140px' }}
                      >
                        <div className="card-body p-4">
                          <div className="d-flex align-items-start mb-3">
                            <div className={`bg-${module.color}-subtle p-2 rounded me-3`}>
                              <i className={`ti ti-${module.icon} text-${module.color} fs-4`}></i>
                            </div>
                            <div className="flex-grow-1">
                              <h6 className="card-title mb-1">{module.label}</h6>
                              <p className="text-muted small mb-0">{module.description}</p>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="badge bg-light text-dark border">Module</span>
                            <div className="text-primary small">
                              Open module →
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recente Activiteiten */}
        <div className="row mt-4">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 d-flex align-items-center">
                    <i className="ti ti-history text-primary me-2"></i>
                    Recente Activiteit
                  </h5>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => router.push('/activiteiten')}
                  >
                    Bekijk alles
                  </button>
                </div>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {[
                    { title: 'Nieuw project aangemaakt', desc: 'Woningbouw Amsterdam Noord', time: '10 min geleden', icon: 'building', color: 'success' },
                    { title: 'Calculatie afgerond', desc: 'Kantoorrenovatie Rotterdam', time: '1 uur geleden', icon: 'calculator', color: 'primary' },
                    { title: 'Factuur verzonden', desc: 'Factuur #2023-156', time: '2 uur geleden', icon: 'receipt', color: 'info' },
                    { title: 'Bouwvergunning ontvangen', desc: 'Project Havenkwartier', time: '4 uur geleden', icon: 'file-certificate', color: 'warning' },
                    { title: 'Inspectie gepland', desc: 'Bouwplaats inspectie', time: '6 uur geleden', icon: 'clipboard-check', color: 'danger' }
                  ].map((activity, index) => (
                    <div key={index} className="list-group-item border-0 px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className={`bg-${activity.color}-subtle p-2 rounded me-3`}>
                          <i className={`ti ti-${activity.icon} text-${activity.color}`}></i>
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between">
                            <h6 className="mb-1">{activity.title}</h6>
                            <small className="text-muted">{activity.time}</small>
                          </div>
                          <p className="text-muted mb-0 small">{activity.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Aankomende deadlines */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="ti ti-calendar-time text-primary me-2"></i>
                  Aankomende Deadlines
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {[
                    { title: 'Project offerte', date: '31 dec 2023', days: 1, color: 'danger' },
                    { title: 'Constructieberekening', date: '3 jan 2024', days: 3, color: 'warning' },
                    { title: 'Financiering rond', date: '8 jan 2024', days: 8, color: 'info' },
                    { title: 'Bouwvergunning', date: '15 jan 2024', days: 15, color: 'success' }
                  ].map((deadline, index) => (
                    <div key={index} className="list-group-item border-0 px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <span className={`badge bg-${deadline.color}`}>
                            {deadline.days}d
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
              </div>
              <div className="card-footer bg-transparent border-top-0 py-3 text-center">
                <button 
                  className="btn btn-link text-primary text-decoration-none"
                  onClick={() => router.push('/agenda')}
                >
                  <i className="ti ti-calendar me-1"></i>
                  Volledige agenda bekijken
                </button>
              </div>
            </div>

            {/* AI Bouwinspecteur */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0 d-flex align-items-center">
                  <i className="ti ti-robot text-primary me-2"></i>
                  AI Bouwinspecteur
                </h5>
              </div>
              <div className="card-body">
                <div className="text-center mb-3">
                  <div className="bg-success-subtle p-4 rounded-circle d-inline-block mb-3">
                    <i className="ti ti-shield-check text-success fs-1"></i>
                  </div>
                  <h5>Status: <span className="text-success">Actief</span></h5>
                  <p className="text-muted">AI-inspecteur is actief op de bouwplaats</p>
                </div>
                
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span className="text-muted">Veiligheidsscore</span>
                    <span className="fw-bold">92%</span>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div className="progress-bar bg-success" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary w-100 mt-3"
                  onClick={() => router.push('/bouwplaats')}
                >
                  <i className="ti ti-arrow-right me-2"></i>
                  Naar Bouwplaats App
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .hover-shadow:hover {
          box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important;
          transition: box-shadow 0.2s;
        }
        .card {
          border-radius: 0.5rem;
        }
        .rounded {
          border-radius: 0.375rem !important;
        }
        .progress {
          border-radius: 0.25rem;
          overflow: hidden;
        }
      `}</style>
    </Layout>
  )
}
