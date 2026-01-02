// pages/calculaties/index.js
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Layout from "@/components/Layout"
import supabase from "@/lib/supabase"

export default function CalculatieIndexPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState(null)
  
  // Projecten uit database
  const [projects, setProjects] = useState([])
  const [recentProjects, setRecentProjects] = useState([])
  
  // Statestieken
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    recentCalculations: 0
  })

  // =========================
  // LAAD PROJECTEN UIT SUPABASE
  // =========================
  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true)
        
        // Haal projecten op uit database
        const { data: projectsData, error } = await supabase
          .from('projects')
          .select('id, name, project_number, status, created_at, client_name')
          .order('created_at', { ascending: false })
          .limit(50)
        
        if (error) throw error
        
        if (projectsData) {
          setProjects(projectsData)
          setRecentProjects(projectsData.slice(0, 5))
          
          // Bereken statistieken
          const activeProjects = projectsData.filter(p => p.status === 'active').length
          setStats({
            totalProjects: projectsData.length,
            activeProjects: activeProjects,
            recentCalculations: 8 // Mock data voor nu
          })
        }
        
      } catch (error) {
        console.error("Fout bij laden projecten:", error)
        // Fallback mock data
        setProjects(getMockProjects())
        setRecentProjects(getMockProjects().slice(0, 5))
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [])

  // =========================
  // KNOP 1: START NIEUWE CALCULATIE VOOR PROJECT
  // =========================
  const handleStartCalculatie = () => {
    if (selectedProject) {
      // Ga naar calculatie formulier met project ID
      router.push(`/calculaties/nieuw?projectId=${selectedProject.id}`)
    } else {
      // Eerst project selecteren
      alert("Selecteer eerst een project om een calculatie te starten")
    }
  }

  // =========================
  // KNOP 2: NIEUW PROJECT AANMAKEN
  // =========================
  const handleNieuwProject = () => {
    router.push("/projecten/nieuw?returnTo=/calculatie")
  }

  // =========================
  // KNOP 3: BEKIJK PROJECT DETAILS
  // =========================
  const handleProjectDetails = (projectId) => {
    router.push(`/projecten/${projectId}`)
  }

  // =========================
  // KNOP 4: BEKIJK BESTAANDE CALCULATIES
  // =========================
  const handleBekijkCalculaties = (projectId) => {
    router.push(`/calculaties?project=${projectId}`)
  }

  // =========================
  // FILTER PROJECTEN OP ZOEKTERM
  // =========================
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.client_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Mock data voor development
  const getMockProjects = () => [
    { id: 1, name: "Woningbouw Amsterdam Noord", project_number: "PROJ-2023-001", status: "active", client_name: "Gemeente Amsterdam", created_at: "2023-11-15" },
    { id: 2, name: "Kantoorrenovatie Rotterdam", project_number: "PROJ-2023-002", status: "active", client_name: "ABC Bedrijven", created_at: "2023-11-10" },
    { id: 3, name: "Nieuwbouw Ziekenhuis Utrecht", project_number: "PROJ-2023-003", status: "planning", client_name: "UMC Utrecht", created_at: "2023-11-05" },
    { id: 4, name: "Utiliteitsbouw Den Haag", project_number: "PROJ-2023-004", status: "active", client_name: "Ministerie BZK", created_at: "2023-10-28" },
    { id: 5, name: "Woningrenovatie Haarlem", project_number: "PROJ-2023-005", status: "completed", client_name: "Particuliere opdrachtgever", created_at: "2023-10-15" },
    { id: 6, name: "Infrastructuurproject A4", project_number: "PROJ-2023-006", status: "active", client_name: "Rijkswaterstaat", created_at: "2023-10-10" },
    { id: 7, name: "Schoolgebouw Groningen", project_number: "PROJ-2023-007", status: "active", client_name: "Schoolbestuur Noord", created_at: "2023-10-05" },
    { id: 8, name: "Sportcomplex Eindhoven", project_number: "PROJ-2023-008", status: "concept", client_name: "Gemeente Eindhoven", created_at: "2023-09-30" }
  ]

  return (
    <Layout hidePlatformSidebar={true}> {/* Voeg deze prop toe */}
      <div className="container-fluid px-3 px-lg-4 py-4">
        {/* Header met uitleg */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1 className="h2 mb-2">Calculatie Starten</h1>
                <p className="text-muted mb-0">
                  Selecteer een project om een nieuwe calculatie te starten of maak eerst een nieuw project aan.
                </p>
              </div>
              
              {/* Belangrijke knop - NIEUWE CALCULATIE */}
              <button
                onClick={handleStartCalculatie}
                className="btn btn-primary btn-lg d-flex align-items-center"
                disabled={!selectedProject}
              >
                <i className="ti ti-calculator me-2"></i>
                {selectedProject ? `Calculatie starten voor ${selectedProject.name}` : "Selecteer eerst een project"}
              </button>
            </div>
            
            {/* Uitleg balk */}
            <div className="alert alert-info border-0 bg-info-subtle">
              <div className="d-flex">
                <i className="ti ti-info-circle text-info fs-5 me-3"></i>
                <div>
                  <h6 className="alert-heading mb-1">Hoe werkt calculeren?</h6>
                  <ol className="mb-0 ps-3">
                    <li>Selecteer een project uit de lijst hieronder</li>
                    <li>Klik op "Calculatie starten" om de calculatietool te openen</li>
                    <li>Voeg kostenposten, materialen en arbeid toe</li>
                    <li>Sla de calculatie op als offerte of kostenbegroting</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistieken */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-primary-subtle p-3 rounded me-3">
                    <i className="ti ti-building text-primary fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Beschikbare Projecten</div>
                    <div className="h4 mb-0 fw-bold">{stats.totalProjects}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-success-subtle p-3 rounded me-3">
                    <i className="ti ti-checklist text-success fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Actieve Projecten</div>
                    <div className="h4 mb-0 fw-bold">{stats.activeProjects}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="col-md-4">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <div className="d-flex align-items-center">
                  <div className="bg-warning-subtle p-3 rounded me-3">
                    <i className="ti ti-calculator text-warning fs-3"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Recente Calculaties</div>
                    <div className="h4 mb-0 fw-bold">{stats.recentCalculations}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Project Selectie */}
        <div className="row">
          {/* Linkerkolom - Projecten Lijst */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0">
                    <i className="ti ti-list me-2"></i>
                    Selecteer een Project
                  </h5>
                  <button
                    onClick={handleNieuwProject}
                    className="btn btn-success btn-sm"
                  >
                    <i className="ti ti-plus me-1"></i>
                    Nieuw Project
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {/* Zoekbalk */}
                <div className="input-group mb-4">
                  <span className="input-group-text">
                    <i className="ti ti-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Zoek op projectnaam, nummer of klant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Projecten Lijst */}
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th style={{ width: '50px' }}></th>
                        <th>Projectnaam</th>
                        <th>Projectnummer</th>
                        <th>Klant</th>
                        <th>Status</th>
                        <th>Acties</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                            Projecten laden...
                          </td>
                        </tr>
                      ) : filteredProjects.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <i className="ti ti-package-off text-muted me-2"></i>
                            Geen projecten gevonden
                          </td>
                        </tr>
                      ) : (
                        filteredProjects.map((project) => (
                          <tr 
                            key={project.id}
                            className={`cursor-pointer ${selectedProject?.id === project.id ? 'table-primary' : ''}`}
                            onClick={() => setSelectedProject(project)}
                          >
                            <td>
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="projectSelect"
                                  checked={selectedProject?.id === project.id}
                                  onChange={() => setSelectedProject(project)}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="fw-bold">{project.name}</div>
                              <small className="text-muted">
                                {new Date(project.created_at).toLocaleDateString('nl-NL')}
                              </small>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border">
                                {project.project_number || 'N.v.t.'}
                              </span>
                            </td>
                            <td>{project.client_name || '-'}</td>
                            <td>
                              <span className={`badge bg-${getStatusColor(project.status)}`}>
                                {getStatusText(project.status)}
                              </span>
                            </td>
                            <td>
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleProjectDetails(project.id)
                                  }}
                                  title="Bekijk details"
                                >
                                  <i className="ti ti-eye"></i>
                                </button>
                                <button
                                  className="btn btn-outline-success"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleBekijkCalculaties(project.id)
                                  }}
                                  title="Bekijk calculaties"
                                >
                                  <i className="ti ti-calculator"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Rechterkolom - Geselecteerd Project & Tips */}
          <div className="col-lg-4">
            {/* Geselecteerd Project Overzicht */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0">
                  <i className="ti ti-check me-2"></i>
                  Geselecteerd Project
                </h5>
              </div>
              <div className="card-body">
                {selectedProject ? (
                  <div>
                    <h6 className="fw-bold mb-2">{selectedProject.name}</h6>
                    <div className="mb-3">
                      <small className="text-muted d-block">Projectnummer:</small>
                      <div className="fw-bold">{selectedProject.project_number || 'N.v.t.'}</div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Klant:</small>
                      <div>{selectedProject.client_name || '-'}</div>
                    </div>
                    <div className="mb-3">
                      <small className="text-muted d-block">Status:</small>
                      <span className={`badge bg-${getStatusColor(selectedProject.status)}`}>
                        {getStatusText(selectedProject.status)}
                      </span>
                    </div>
                    
                    {/* BELANGRIJKE KNOOP - CENTRAAL */}
                    <button
                      onClick={handleStartCalculatie}
                      className="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center"
                    >
                      <i className="ti ti-calculator me-2"></i>
                      Calculatie starten voor dit project
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="ti ti-pointer text-muted fs-1 mb-3"></i>
                    <p className="text-muted mb-0">
                      Selecteer een project uit de lijst om een calculatie te starten
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Calculatie Tips & Tricks */}
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-0 py-3">
                <h5 className="card-title mb-0">
                  <i className="ti ti-tips me-2"></i>
                  Calculatie Tips
                </h5>
              </div>
              <div className="card-body">
                <div className="accordion" id="calculatieTips">
                  <div className="accordion-item border-0">
                    <h6 className="accordion-header">
                      <button className="accordion-button bg-light border rounded mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#tip1">
                        <i className="ti ti-checklist text-primary me-2"></i>
                        Voorbereiding calculatie
                      </button>
                    </h6>
                    <div id="tip1" className="accordion-collapse collapse show">
                      <div className="accordion-body small">
                        <ul className="mb-0">
                          <li>Zorg dat alle projectdocumenten beschikbaar zijn</li>
                          <li>Controleer de bouwtekeningen en specificaties</li>
                          <li>Verzamel eerder gemaakte calculaties als referentie</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0">
                    <h6 className="accordion-header">
                      <button className="accordion-button collapsed bg-light border rounded mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#tip2">
                        <i className="ti ti-calculator text-success me-2"></i>
                        Kostenposten opstellen
                      </button>
                    </h6>
                    <div id="tip2" className="accordion-collapse collapse">
                      <div className="accordion-body small">
                        <ul className="mb-0">
                          <li>Begin met de hoofdstructuur: grondwerk, fundering, etc.</li>
                          <li>Voeg altijd een risicopost toe (5-10%)</li>
                          <li>Houd rekening met indexatie van materiaalprijzen</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="accordion-item border-0">
                    <h6 className="accordion-header">
                      <button className="accordion-button collapsed bg-light border rounded mb-2" type="button" data-bs-toggle="collapse" data-bs-target="#tip3">
                        <i className="ti ti-file-invoice text-warning me-2"></i>
                        Offerte maken
                      </button>
                    </h6>
                    <div id="tip3" className="accordion-collapse collapse">
                      <div className="accordion-body small">
                        <ul className="mb-0">
                          <li>Voeg duidelijke voorwaarden toe aan de offerte</li>
                          <li>Specificeer geldigheidsduur van de prijs</li>
                          <li>Maak een nette PDF met bedrijfslogo</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h6 className="fw-bold mb-2">Snelle navigatie:</h6>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      onClick={handleNieuwProject}
                      className="btn btn-outline-success btn-sm"
                    >
                      <i className="ti ti-plus me-1"></i>
                      Nieuw Project
                    </button>
                    <button
                      onClick={() => router.push('/calculaties')}
                      className="btn btn-outline-primary btn-sm"
                    >
                      <i className="ti ti-list me-1"></i>
                      Alle Calculaties
                    </button>
                    <button
                      onClick={() => router.push('/projecten')}
                      className="btn btn-outline-info btn-sm"
                    >
                      <i className="ti ti-building me-1"></i>
                      Alle Projecten
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snelle acties footer */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Klaar om te calculeren?</h6>
                    <p className="text-muted small mb-0">
                      Start een nieuwe calculatie of beheer bestaande calculaties
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      onClick={handleStartCalculatie}
                      className="btn btn-primary"
                      disabled={!selectedProject}
                    >
                      <i className="ti ti-calculator me-2"></i>
                      Calculatie starten
                    </button>
                    <button
                      onClick={() => router.push('/calculaties')}
                      className="btn btn-outline-primary"
                    >
                      <i className="ti ti-list me-2"></i>
                      Alle Calculaties
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cursor-pointer {
          cursor: pointer;
        }
        .table tr:hover {
          background-color: rgba(13, 110, 253, 0.05);
        }
        .accordion-button {
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
        }
        .accordion-body {
          padding: 0.75rem 1rem;
        }
      `}</style>
    </Layout>
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
    case 'onhold':
    case 'pauze':
      return 'danger'
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
    case 'concept':
      return 'Concept'
    case 'completed':
    case 'afgerond':
      return 'Afgerond'
    case 'onhold':
      return 'On Hold'
    default:
      return status || 'Onbekend'
  }
}
