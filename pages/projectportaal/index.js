// pages/projectportaal/index.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import supabase from '@/lib/supabase'

export default function ProjectPortaalPage() {
  const router = useRouter()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data) {
        setProjects(data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (selectedStatus !== 'all' && project.status !== selectedStatus) {
      return false
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return (
        project.name?.toLowerCase().includes(term) ||
        project.project_number?.toLowerCase().includes(term) ||
        project.client_name?.toLowerCase().includes(term)
      )
    }
    
    return true
  })

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div>
            <h1 className="h2 mb-2">Projectportaal</h1>
            <p className="text-muted mb-0">
              Overzicht van alle projectportalen voor klanten
            </p>
          </div>
          <div className="d-flex gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-primary"
              onClick={() => router.push('/projecten')}
            >
              <i className="ti ti-building me-2"></i>
              Alle Projecten
            </button>
            <button
              className="btn btn-primary"
              onClick={() => router.push('/projecten/nieuw')}
            >
              <i className="ti ti-plus me-2"></i>
              Nieuw Project
            </button>
          </div>
        </div>

        {/* Statistieken */}
        <div className="row mb-4">
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 bg-primary bg-opacity-10">
              <div className="card-body text-center">
                <div className="h4 mb-1">{projects.length}</div>
                <div className="text-muted small">Totaal projecten</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 bg-success bg-opacity-10">
              <div className="card-body text-center">
                <div className="h4 mb-1">
                  {projects.filter(p => p.status === 'active').length}
                </div>
                <div className="text-muted small">Actief</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 bg-warning bg-opacity-10">
              <div className="card-body text-center">
                <div className="h4 mb-1">
                  {projects.filter(p => p.status === 'planning').length}
                </div>
                <div className="text-muted small">In planning</div>
              </div>
            </div>
          </div>
          <div className="col-md-3 col-6 mb-3">
            <div className="card border-0 bg-info bg-opacity-10">
              <div className="card-body text-center">
                <div className="h4 mb-1">
                  {projects.filter(p => p.status === 'completed').length}
                </div>
                <div className="text-muted small">Afgerond</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-8">
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Zoek projecten op naam, nummer of klant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="all">Alle statussen</option>
                  <option value="active">Actief</option>
                  <option value="planning">Planning</option>
                  <option value="completed">Afgerond</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Projecten Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="ti ti-package-off text-muted fs-1 mb-3"></i>
              <h5>Geen projecten gevonden</h5>
              <p className="text-muted mb-0">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Geen resultaten voor je zoekopdracht' 
                  : 'Er zijn nog geen projecten aangemaakt'}
              </p>
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredProjects.map((project) => (
              <div key={project.id} className="col-md-6 col-lg-4 mb-4">
                <div className="card border-0 shadow-sm h-100 project-card">
                  <div className="card-body d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="card-title mb-1">{project.name}</h5>
                        <p className="text-muted small mb-0">
                          {project.project_number || 'Geen projectnummer'}
                        </p>
                      </div>
                      <span className={`badge bg-${getStatusColor(project.status)}`}>
                        {getStatusText(project.status)}
                      </span>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small mb-1">Klant:</div>
                      <div className="fw-medium">
                        {project.client_name || 'Niet opgegeven'}
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="text-muted small mb-1">Laatste update:</div>
                      <div className="small">
                        {new Date(project.updated_at || project.created_at).toLocaleDateString('nl-NL')}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-outline-primary btn-sm flex-fill"
                          onClick={() => router.push(`/projectportaal/${project.id}`)}
                        >
                          <i className="ti ti-external-link me-1"></i>
                          Open Portaal
                        </button>
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={() => window.open(`/projecten/${project.id}`, '_blank')}
                        >
                          <i className="ti ti-eye"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Snelle acties */}
        <div className="card border-0 shadow-sm bg-light mt-4">
          <div className="card-body">
            <h6 className="mb-3">Snelle acties</h6>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-outline-primary btn-sm">
                <i className="ti ti-download me-1"></i>
                Exporteer overzicht
              </button>
              <button className="btn btn-outline-secondary btn-sm">
                <i className="ti ti-user-plus me-1"></i>
                Voeg klant toe
              </button>
              <button className="btn btn-outline-info btn-sm">
                <i className="ti ti-mail me-1"></i>
                Verstuur update
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .project-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .project-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </AdminLayout>
  )
}

// Helper functies
function getStatusColor(status) {
  switch(status?.toLowerCase()) {
    case 'active':
    case 'actief':
      return 'success'
    case 'planning':
    case 'concept':
      return 'warning'
    case 'completed':
    case 'afgerond':
      return 'secondary'
    default:
      return 'light'
  }
}

function getStatusText(status) {
  switch(status?.toLowerCase()) {
    case 'active':
    case 'actief':
      return 'Actief'
    case 'planning':
      return 'Planning'
    case 'completed':
    case 'afgerond':
      return 'Afgerond'
    default:
      return status || 'Onbekend'
  }
}
