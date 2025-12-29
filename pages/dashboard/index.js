// pages/dashboard/index.js
import Link from "next/link"
import { useEffect, useState } from "react"
import supabase from "@/lib/supabase"

export default function DashboardPage() {
  const [modules, setModules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        
        const { data, error } = await supabase
          .from("modules")
          .select("key,label,route,icon,sort_order")
          .eq("active", true)
          .not("route", "like", "%/%/%")
          .neq("route", "/dashboard")
          .order("sort_order", { ascending: true })

        if (error) {
          console.error("Error loading modules:", error)
          return
        }

        if (!cancelled) {
          setModules(data || [])
        }
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()
    
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid">
      {/* Page Title */}
      <div className="page-header d-print-none mb-4">
        <div className="row align-items-center">
          <div className="col">
            <h1 className="page-title">Dashboard</h1>
            <div className="text-muted mt-1">
              Welkom terug! Overzicht van je bouwprojecten
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-blue text-white avatar">
                    <i className="ti ti-building"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="h3">0</div>
                  <div className="text-muted">Actieve projecten</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-green text-white avatar">
                    <i className="ti ti-cash"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="h3">€ 0</div>
                  <div className="text-muted">Cashflow</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-orange text-white avatar">
                    <i className="ti ti-calendar"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="h3">0</div>
                  <div className="text-muted">Lopende taken</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="card card-sm">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-auto">
                  <span className="bg-red text-white avatar">
                    <i className="ti ti-alert-triangle"></i>
                  </span>
                </div>
                <div className="col">
                  <div className="h3">0</div>
                  <div className="text-muted">Open issues</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="page-header d-print-none mb-3">
        <div className="row align-items-center">
          <div className="col">
            <h2 className="page-title">Modules</h2>
            <div className="text-muted">
              Directe toegang tot alle functionaliteiten
            </div>
          </div>
        </div>
      </div>

      {modules.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-5">
            <i className="ti ti-package-off text-muted mb-3" style={{ fontSize: '3rem' }}></i>
            <h3 className="text-muted">Geen modules beschikbaar</h3>
            <p className="text-muted mb-0">
              Er zijn momenteel geen actieve modules geconfigureerd.
            </p>
          </div>
        </div>
      ) : (
        <div className="row row-cards">
          {modules.map((module) => (
            <div key={module.key} className="col-md-3 col-sm-6">
              <Link href={module.route}>
                <a className="card card-link" style={{ textDecoration: 'none' }}>
                  <div className="card-body text-center">
                    <div className="mb-3">
                      <span className="bg-blue-lt text-blue avatar avatar-lg">
                        <i className={`ti ti-${module.icon || 'box'} fa-2x`}></i>
                      </span>
                    </div>
                    <h3 className="card-title mb-1">{module.label}</h3>
                    <div className="text-muted">
                      <i className="ti ti-arrow-right me-1"></i>
                      Open module
                    </div>
                  </div>
                </a>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity Placeholder */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recente activiteit</h3>
            </div>
            <div className="card-body">
              <div className="text-center py-5">
                <i className="ti ti-history text-muted mb-3" style={{ fontSize: '3rem' }}></i>
                <h4 className="text-muted">Geen recente activiteit</h4>
                <p className="text-muted mb-0">
                  Er is nog geen activiteit geregistreerd.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
