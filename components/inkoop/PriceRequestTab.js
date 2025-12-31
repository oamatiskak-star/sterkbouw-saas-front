export default function PriceRequestTab({ 
  priceRequestForm, setPriceRequestForm, projects, stabuChapters, 
  suppliers, handleSendPriceRequest, loading 
}) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-mail text-primary me-2"></i>
        Nieuwe Prijsaanvraag
      </h5>
      
      <div className="row">
        <div className="col-lg-8">
          <div className="card border">
            <div className="card-body">
              <form onSubmit={(e) => { e.preventDefault(); handleSendPriceRequest(); }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Project</label>
                    <select 
                      className="form-select"
                      value={priceRequestForm.project_id}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, project_id: e.target.value})}
                      required
                    >
                      <option value="">Selecteer project...</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name} ({project.project_number})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Stabu Hoofdstuk</label>
                    <select 
                      className="form-select"
                      value={priceRequestForm.chapter_id}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, chapter_id: e.target.value})}
                      required
                    >
                      <option value="">Selecteer Stabu hoofdstuk...</option>
                      {stabuChapters.map(chapter => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.id} - {chapter.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Omschrijving</label>
                    <input
                      type="text"
                      className="form-control"
                      value={priceRequestForm.description}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, description: e.target.value})}
                      placeholder="Bijv: 'Betonfundering voor woningbouw'"
                      required
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Urgentie</label>
                    <select 
                      className="form-select"
                      value={priceRequestForm.urgency}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, urgency: e.target.value})}
                    >
                      <option value="low">Laag (2 weken)</option>
                      <option value="normal">Normaal (1 week)</option>
                      <option value="high">Hoog (3 dagen)</option>
                      <option value="urgent">Urgent (24 uur)</option>
                    </select>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Deadline</label>
                    <input
                      type="date"
                      className="form-control"
                      value={priceRequestForm.deadline}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, deadline: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Leveranciers (AI selecteert automatisch 5 beste)</label>
                    <div className="alert alert-info">
                      <i className="ti ti-robot me-2"></i>
                      AI selecteert automatisch de 5 beste leveranciers voor dit Stabu hoofdstuk
                      gebaseerd op historische prestaties en expertise.
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Extra Bericht aan Leveranciers (optioneel)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={priceRequestForm.custom_message}
                      onChange={(e) => setPriceRequestForm({...priceRequestForm, custom_message: e.target.value})}
                      placeholder="Voeg specifieke instructies of voorwaarden toe..."
                    />
                  </div>
                  
                  <div className="col-12">
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Prijsaanvragen versturen...
                        </>
                      ) : (
                        <>
                          <i className="ti ti-send me-2"></i>
                          Prijsaanvragen Versturen naar 5 Leveranciers
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-lg-4">
          <div className="card border">
            <div className="card-header">
              <h6 className="mb-0">AI Prijsaanvraag Proces</h6>
            </div>
            <div className="card-body">
              <div className="timeline timeline-activity">
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-robot text-primary"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">AI Analyse</div>
                    <small className="text-muted">Selecteert 5 beste leveranciers</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-mail text-success"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Email Verzending</div>
                    <small className="text-muted">Naar inkoop@sterkbouw.nl en leveranciers</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-bell text-warning"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Notificaties</div>
                    <small className="text-muted">Real-time updates bij reacties</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-gavel text-danger"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Beslissingsbord</div>
                    <small className="text-muted">AI analyseert alle offertes</small>
                  </div>
                </div>
                
                <div className="timeline-item">
                  <div className="timeline-line"></div>
                  <div className="timeline-icon">
                    <i className="ti ti-file-invoice text-info"></i>
                  </div>
                  <div className="timeline-content">
                    <div className="fw-bold">Order Generatie</div>
                    <small className="text-muted">Automatisch orderformulier</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
