import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading, isAdmin } = useAuth()

  useEffect(() => {
    if (loading) return
    if (!user || !isAdmin) {
      router.push('/auth/login')
    }
  }, [user, isAdmin, loading, router])

  if (loading || !user) {
    return null
  }

  const stats = [
    { title: 'Active Projects', value: '12', icon: 'ti ti-chart-bar', color: 'text-primary' },
    { title: 'Revenue', value: '€245.380', icon: 'ti ti-currency-euro', color: 'text-success' },
    { title: 'Total Users', value: '48', icon: 'ti ti-users', color: 'text-warning' },
    { title: 'Field Teams', value: '8', icon: 'ti ti-tools', color: 'text-purple' },
  ]

  return (
    <div className="container-xl">
      <div className="page-header mb-4">
        <h2 className="page-title">Admin Dashboard</h2>
      </div>

      {/* KPI CARDS */}
      <div className="row row-deck row-cards">
        {stats.map((stat) => (
          <div className="col-sm-6 col-lg-3" key={stat.title}>
            <div className="card">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <span className={`avatar avatar-md me-3 ${stat.color}`}>
                    <i className={stat.icon} />
                  </span>
                  <div>
                    <div className="text-muted">{stat.title}</div>
                    <div className="h2 mb-0">{stat.value}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT ACTIVITY */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-body">
              <ul className="list list-timeline">
                <li className="list-timeline-item">
                  New inspection submitted by Team A
                </li>
                <li className="list-timeline-item">
                  BIM model updated for Project Gamma
                </li>
                <li className="list-timeline-item">
                  Material delivery confirmed for Site 3
                </li>
                <li className="list-timeline-item">
                  Financial report Q3 generated
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
