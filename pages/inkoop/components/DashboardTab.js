export default function DashboardTab({ 
  projects, stabuChapters, selectedProject, setSelectedProject, 
  selectedChapter, setSelectedChapter, stats, priceRequests, 
  handleChapterSelection, analyzeCashflowImpact, loading 
}) {
  const getStatusColor = (status) => {
    const colors = {
      'draft': 'secondary',
      'sent': 'info',
      'received': 'warning',
      'in_review': 'primary',
      'approved': 'success',
      'rejected': 'danger'
    }
    return colors[status] || 'secondary'
  }

  const getStatusText = (status) => {
    const texts = {
      'draft': 'Concept',
      'sent': 'Verzonden',
      'received': 'Ontvangen',
      'in_review': 'In Beoordeling',
      'approved': 'Goedgekeurd',
      'rejected': 'Afgewezen'
    }
    return texts[status] || status
  }

  return (
    <div>
      {/* Stats Cards */}
      <div className="row mb-4">
        {[
          { label: "Actieve Prijsaanvragen", value: stats.activeRequests, icon: "mail", color: "primary", bg: "bg-primary-subtle" },
          { label: "Beslissingen In Afw.", value: stats.pendingDecisions, icon: "clock", color: "warning", bg: "bg-warning-subtle" },
          { label: "AI Besparingen", value: `€${stats.costSavings.toLocaleString('nl-NL')}`, icon: "discount", color: "success", bg: "bg-success-subtle" },
          { label: "Cashflow Impact", value: `€${stats.cashflowImpact.toLocaleString('nl-NL')}`, icon: "cash", color: "info", bg: "bg-info-subtle" },
          { label: "Onderhandelingssucces", value: stats.negotiationSuccessRate, icon: "message", color: "purple", bg: "bg-purple-subtle" },
          { label: "Gem. Reactietijd", value: `${stats.avgResponseTime} uur`, icon: "report-analytics", color: "teal", bg: "bg-teal-subtle" }
        ].map((stat, index) => (
          <div key={index} className="col-md-4 col-lg-2 mb-3">
            <div className={`card border-0 ${stat.bg}`}>
              <div className="card-body p-3">
                <div className="d-flex align-items-center">
                  <div className={`bg-${stat.color} text-white rounded-circle p-2 me-3`}>
                    <i className={`ti ti-${stat.icon}`}></i>
                  </div>
                  <div>
                    <div className="text-muted small">{stat.label}</div>
                    <div className="h5 mb-0 fw-bold">{stat.value}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Project & Stabu Selection */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white">
          <h5 className="mb-0">
            <i className="ti ti-building me-2"></i>
            Cashflow Optimalisatie - Selecteer Project & Stabu Hoofdstuk
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label fw-bold">Project Selecteren</label>
              <select 
                className="form-select"
                value={selectedProject?.id || ""}
                onChange={(e) => setSelectedProject(projects.find(p => p.id === e.target.value))}
              >
                <option value="">Kies een project voor cashflow optimalisatie...</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.project_number})
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label fw-bold">Stabu Hoofdstuk</label>
              <select 
                className="form-select"
                value={selectedChapter?.id || ""}
                onChange={(e) => setSelectedChapter(stabuChapters.find(c => c.id === e.target.value))}
                disabled={!selectedProject}
              >
                <option value="">Selecteer hoofdstuk om naar voren te halen...</option>
                {stabuChapters.map(chapter => (
                  <option key={chapter.id} value={chapter.id}>
                    {chapter.id} - {chapter.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedProject && selectedChapter && (
            <div className="mt-4">
              <div className="alert alert-info">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">
                      {selectedProject.name} - {selectedChapter.name}
                    </h6>
                    <p className="mb-0">
                      Dit hoofdstuk kan naar voren gehaald worden voor betere cashflow. 
                      AI stuurt prijsaanvragen naar leveranciers en analyseert de impact.
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handleChapterSelection(selectedProject.id, selectedChapter.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Bezig...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-send me-2"></i>
                          Prijsaanvraag Starten
                        </>
                      )}
                    </button>
                    <button 
                      className="btn btn-outline-info"
                      onClick={() => analyzeCashflowImpact(selectedProject.id, selectedChapter.id)}
                      disabled={loading}
                    >
                      <i className="ti ti-cash me-2"></i>
                      Cashflow Analyse
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Stabu Chapter Info */}
              <div className="row mt-3">
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="card-title">Project Details</h6>
                      <dl className="row mb-0">
                        <dt className="col-sm-4">Projectnummer:</dt>
                        <dd className="col-sm-8">{selectedProject.project_number}</dd>
                        <dt className="col-sm-4">Status:</dt>
                        <dd className="col-sm-8">
                          <span className="badge bg-success">Actief</span>
                        </dd>
                        <dt className="col-sm-4">Startdatum:</dt>
                        <dd className="col-sm-8">
                          {new Date(selectedProject.start_date || Date.now()).toLocaleDateString('nl-NL')}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border">
                    <div className="card-body">
                      <h6 className="card-title">Stabu Hoofdstuk</h6>
                      <dl className="row mb-0">
                        <dt className="col-sm-4">Code:</dt>
                        <dd className="col-sm-8">
                          <span className={`badge bg-${selectedChapter.color}`}>
                            {selectedChapter.id}
                          </span>
                        </dd>
                        <dt className="col-sm-4">Omschrijving:</dt>
                        <dd className="col-sm-8">{selectedChapter.name}</dd>
                        <dt className="col-sm-4">Categorie:</dt>
                        <dd className="col-sm-8">{selectedChapter.description}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recente Activiteit */}
      <div className="row">
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Recente Prijsaanvragen</h5>
            </div>
            <div className="card-body">
              {priceRequests.slice(0, 5).map(request => (
                <div key={request.id} className="border-bottom pb-3 mb-3">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h6 className="mb-1">{request.project?.name}</h6>
                      <small className="text-muted">{request.description}</small>
                    </div>
                    <span className={`badge bg-${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between mt-2">
                    <small>
                      <i className="ti ti-calendar me-1"></i>
                      Deadline: {new Date(request.deadline).toLocaleDateString('nl-NL')}
                    </small>
                    <small>
                      {request.responses?.length || 0} reacties
                    </small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white">
              <h5 className="mb-0">Snel Acties</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button className="btn btn-outline-primary text-start">
                  <i className="ti ti-mail me-2"></i>
                  Nieuwe Prijsaanvraag
                </button>
                <button className="btn btn-outline-success text-start">
                  <i className="ti ti-package me-2"></i>
                  Bestelling Plaatsen
                </button>
                <button className="btn btn-outline-warning text-start">
                  <i className="ti ti-cash me-2"></i>
                  Cashflow Rapport
                </button>
                <button className="btn btn-outline-info text-start">
                  <i className="ti ti-report-analytics me-2"></i>
                  Leveranciers Analyse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
