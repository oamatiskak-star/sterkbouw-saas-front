// pages/projectportaal/[id].js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/AdminLayout'
import supabase from '@/lib/supabase'

export default function ProjectPortaalDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [documents, setDocuments] = useState([])

  useEffect(() => {
    if (id) {
      loadProject()
      loadDocuments()
    }
  }, [id])

  const loadProject = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      
      if (data) {
        setProject(data)
      }
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('project_id', id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      if (data) {
        setDocuments(data)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!project) {
    return (
      <AdminLayout>
        <div className="container-fluid py-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body text-center py-5">
              <i className="ti ti-alert-circle text-danger fs-1 mb-3"></i>
              <h5>Project niet gevonden</h5>
              <p className="text-muted mb-3">
                Het project dat je zoekt bestaat niet of je hebt er geen toegang toe.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => router.push('/projectportaal')}
              >
                Terug naar overzicht
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overzicht', icon: 'dashboard' },
    { id: 'documents', label: 'Documenten', icon: 'files' },
    { id: 'communication', label: 'Communicatie', icon: 'message' },
    { id: 'timeline', label: 'Tijdlijn', icon: 'calendar' },
    { id: 'financial', label: 'Financieel', icon: 'cash' },
  ]

  return (
    <AdminLayout>
      <div className="container-fluid py-4">
        {/* Project Header */}
        <div className="card border-0 shadow-sm mb-4 portaal-header">
          <div className="card-body text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h1 className="h2 mb-2">{project.name}</h1>
                <p className="mb-0 opacity-75">
                  Projectnummer: {project.project_number || 'Niet opgegeven'}
                  {project.client_name && ` | Klant: ${project.client_name}`}
                </p>
              </div>
              <button
                className="btn btn-light"
                onClick={() => router.push('/projectportaal')}
              >
                <i className="ti ti-arrow-left me-2"></i>
                Terug
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-0">
            <div className="nav nav-tabs nav-tabs-alt">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`ti ti-${tab.icon} me-2`}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            {activeTab === 'overview' && (
              <div className="overview-tab">
                <h5 className="mb-4">Projectoverzicht</h5>
                <div className="row">
                  <div className="col-md-6">
                    <dl className="row">
                      <dt className="col-sm-4">Status:</dt>
                      <dd className="col-sm-8">
                        <span className={`badge bg-${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </dd>
                      
                      <dt className="col-sm-4">Startdatum:</dt>
                      <dd className="col-sm-8">
                        {project.start_date 
                          ? new Date(project.start_date).toLocaleDateString('nl-NL') 
                          : 'Niet gepland'}
                      </dd>
                      
                      <dt className="col-sm-4">Einddatum:</dt>
    <dd className="col-sm-8">
      {project.end_date 
        ? new Date(project.end_date).toLocaleDateString('nl-NL') 
        : 'Niet gepland'}  {/* ← HIER WAS DE FOUT */}
    </dd>
                      
                      <dt className="col-sm-4">Budget:</dt>
                      <dd className="col-sm-8">
                        {project.budget 
                          ? `€${project.budget.toLocaleString('nl-NL')}` 
                          : 'Niet opgegeven'}
                      </dd>
                    </dl>
                  </div>
                  <div className="col-md-6">
                    <dl className="row">
                      <dt className="col-sm-4">Klant contact:</dt>
                      <dd className="col-sm-8">
                        {project.client_contact || 'Niet opgegeven'}
                      </dd>
                      
                      <dt className="col-sm-4">Telefoon:</dt>
                      <dd className="col-sm-8">
                        {project.client_phone || 'Niet opgegeven'}
                      </dd>
                      
                      <dt className="col-sm-4">Email:</dt>
                      <dd className="col-sm-8">
                        {project.client_email || 'Niet opgegeven'}
                      </dd>
                      
                      <dt className="col-sm-4">Adres:</dt>
                      <dd className="col-sm-8">
                        {project.address || 'Niet opgegeven'}
                      </dd>
                    </dl>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6 className="mb-3">Projectbeschrijving</h6>
                  <p className="text-muted">
                    {project.description || 'Geen beschrijving beschikbaar.'}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="documents-tab">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="mb-0">Projectdocumenten</h5>
                  <button className="btn btn-primary btn-sm">
                    <i className="ti ti-upload me-2"></i>
                    Upload document
                  </button>
                </div>
                
                {documents.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="ti ti-files-off text-muted fs-1 mb-3"></i>
                    <h6>Geen documenten</h6>
                    <p className="text-muted mb-0">
                      Er zijn nog geen documenten geüpload voor dit project.
                    </p>
                  </div>
                ) : (
                  <div className="list-group">
                    {documents.map(doc => (
                      <div key={doc.id} className="list-group-item list-group-item-action document-item">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <h6 className="mb-1">{doc.name}</h6>
                            <small className="text-muted">
                              Geüpload op {new Date(doc.created_at).toLocaleDateString('nl-NL')}
                            </small>
                          </div>
                          <div className="btn-group">
                            <button className="btn btn-outline-primary btn-sm">
                              <i className="ti ti-download"></i>
                            </button>
                            <button className="btn btn-outline-secondary btn-sm">
                              <i className="ti ti-eye"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'communication' && (
              <div className="communication-tab">
                <h5 className="mb-4">Communicatielog</h5>
                <div className="text-center py-5">
                  <i className="ti ti-message-circle text-muted fs-1 mb-3"></i>
                  <h6>Communicatie module</h6>
                  <p className="text-muted mb-0">
                    Deze module is nog in ontwikkeling.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'timeline' && (
              <div className="timeline-tab">
                <h5 className="mb-4">Project tijdlijn</h5>
                <div className="text-center py-5">
                  <i className="ti ti-timeline text-muted fs-1 mb-3"></i>
                  <h6>Tijdlijn module</h6>
                  <p className="text-muted mb-0">
                    Deze module is nog in ontwikkeling.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'financial' && (
              <div className="financial-tab">
                <h5 className="mb-4">Financieel overzicht</h5>
                <div className="text-center py-5">
                  <i className="ti ti-cash text-muted fs-1 mb-3"></i>
                  <h6>Financiële module</h6>
                  <p className="text-muted mb-0">
                    Deze module is nog in ontwikkeling. 
                    Bekijk de financiën voor dit project in het financiën dashboard.
                  </p>
                  <button 
                    className="btn btn-primary mt-3"
                    onClick={() => router.push(`/financien?project=${id}`)}
                  >
                    <i className="ti ti-external-link me-2"></i>
                    Ga naar Financiën
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .nav-tabs .nav-link {
          border: none;
          border-bottom: 3px solid transparent;
          color: #6c757d;
          font-weight: 500;
          padding: 0.75rem 1rem;
        }
        .nav-tabs .nav-link.active {
          color: #0d6efd;
          border-bottom-color: #0d6efd;
          background-color: transparent;
        }
        .document-item {
          border-left: 3px solid #0d6efd;
          padding-left: 1rem;
        }
      `}</style>
    </AdminLayout>
  )
}
