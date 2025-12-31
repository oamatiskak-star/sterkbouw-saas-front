export default function CashflowTab({ 
  cashflowAnalysis, projects, stabuChapters, 
  analyzeCashflowImpact, loading 
}) {
  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-cash text-primary me-2"></i>
        Cashflow Impact Analyse
      </h5>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card border">
            <div className="card-header">
              <h6 className="mb-0">Project Selectie</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Project</label>
                <select className="form-select">
                  <option value="">Selecteer project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="mb-3">
                <label className="form-label">Stabu Hoofdstuk</label>
                <select className="form-select">
                  <option value="">Selecteer hoofdstuk...</option>
                  {stabuChapters.map(chapter => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.id} - {chapter.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <button 
                className="btn btn-primary w-100"
                onClick={() => analyzeCashflowImpact(projects[0]?.id, 'C')}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Analyseren...
                  </>
                ) : (
                  <>
                    <i className="ti ti-chart-line me-2"></i>
                    Cashflow Analyse Uitvoeren
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div className="card border mt-3">
            <div className="card-header">
              <h6 className="mb-0">Cashflow Tips</h6>
            </div>
            <div className="card-body">
              <ul className="list-unstyled mb-0">
                <li className="mb-2">
                  <i className="ti ti-check text-success me-2"></i>
                  Voorschotten onderhandelen
                </li>
                <li className="mb-2">
                  <i className="ti ti-check text-success me-2"></i>
                  Betalingstermijnen optimaliseren
                </li>
                <li className="mb-2">
                  <i className="ti ti-check text-success me-2"></i>
                  Leveringen stroomlijnen
                </li>
                <li className="mb-2">
                  <i className="ti ti-check text-success me-2"></i>
                  Bulk kortingen benutten
                </li>
                <li>
                  <i className="ti ti-check text-success me-2"></i>
                  Planning afstemmen op cashflow
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          {cashflowAnalysis ? (
            <div className="card border">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Cashflow Analyse Rapport</h6>
                  <small className="text-muted">
                    {new Date(cashflowAnalysis.created_at).toLocaleDateString('nl-NL')}
                  </small>
                </div>
              </div>
              
              <div className="card-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border-0 bg-primary-subtle">
                      <div className="card-body">
                        <h6 className="card-title text-primary">Project & Hoofdstuk</h6>
                        <p className="mb-1">
                          <strong>Project:</strong> {cashflowAnalysis.project_name}
                        </p>
                        <p className="mb-1">
                          <strong>Hoofdstuk:</strong> {cashflowAnalysis.chapter}
                        </p>
                        <p className="mb-0">
                          <strong>Totale waarde:</strong> €{cashflowAnalysis.total_value?.toLocaleString('nl-NL')}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card border-0 bg-info-subtle">
                      <div className="card-body">
                        <h6 className="card-title text-info">Cashflow Impact</h6>
                        <p className="mb-1">
                          <strong>Voorschot:</strong> {cashflowAnalysis.upfront_payment_percentage}%
                        </p>
                        <p className="mb-1">
                          <strong>Voorschot bedrag:</strong> €{cashflowAnalysis.upfront_amount?.toLocaleString('nl-NL')}
                        </p>
                        <p className="mb-0">
                          <strong>Risico niveau:</strong> {cashflowAnalysis.risk_level}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* ROI en Timing */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card border">
                      <div className="card-body">
                        <h6 className="card-title">Return on Investment</h6>
                        <div className="text-center py-3">
                          <div className="display-4 fw-bold text-success">
                            {cashflowAnalysis.roi_months}
                          </div>
                          <div className="text-muted">maanden</div>
                        </div>
                        <p className="text-center mb-0">
                          Geschatte terugverdientijd voor deze investering
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="card border">
                      <div className="card-body">
                        <h6 className="card-title">Optimale Timing</h6>
                        <div className="text-center py-3">
                          <i className="ti ti-calendar text-primary" style={{fontSize: '3rem'}}></i>
                          <div className="fw-bold mt-2">
                            {cashflowAnalysis.optimal_timing}
                          </div>
                        </div>
                        <p className="text-center mb-0">
                          Aanbevolen uitvoeringsmoment voor beste cashflow
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Aanbevelingen */}
                <div className="card border">
                  <div className="card-header">
                    <h6 className="mb-0">AI Aanbevelingen voor Cashflow Optimalisatie</h6>
                  </div>
                  <div className="card-body">
                    <ul className="list-unstyled mb-0">
                      {cashflowAnalysis.recommendations?.map((rec, index) => (
                        <li key={index} className="mb-2">
                          <i className="ti ti-check text-success me-2"></i>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border">
              <div className="card-body text-center py-5">
                <i className="ti ti-chart-line text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="mt-3">Geen analyse beschikbaar</h5>
                <p className="text-muted">
                  Selecteer een project en Stabu hoofdstuk om een cashflow analyse uit te voeren.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
