export default function DecisionsTab({ 
  priceRequests, suppliers, supplierPerformance,
  handleStartNegotiation, handleGenerateOrder 
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
      <h5 className="card-title mb-4">
        <i className="ti ti-gavel text-primary me-2"></i>
        Beslissingsbord - AI Aanbevelingen
      </h5>
      
      <div className="row">
        <div className="col-12">
          <div className="card border">
            <div className="card-header">
              <h6 className="mb-0">Prijsaanvragen Klaar voor Beslissing</h6>
            </div>
            <div className="card-body">
              {priceRequests
                .filter(request => request.status === 'received' && request.responses && request.responses.length > 0)
                .map(request => (
                  <div key={request.id} className="border-bottom pb-4 mb-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="mb-1">{request.description}</h6>
                        <p className="text-muted mb-0">
                          Project: {request.project?.name} | 
                          Deadline: {new Date(request.deadline).toLocaleDateString('nl-NL')}
                        </p>
                      </div>
                      <span className={`badge bg-${getStatusColor(request.status)}`}>
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    
                    <div className="row">
                      <div className="col-md-8">
                        <h6 className="mb-3">Offertes van Leveranciers</h6>
                        <div className="table-responsive">
                          <table className="table table-hover">
                            <thead>
                              <tr>
                                <th>Leverancier</th>
                                <th>Offerte Prijs</th>
                                <th>Reactietijd</th>
                                <th>Beoordeling</th>
                                <th>Acties</th>
                              </tr>
                            </thead>
                            <tbody>
                              {request.responses.map(response => {
                                const supplier = suppliers.find(s => s.id === response.supplier_id)
                                const performance = supplierPerformance[supplier?.id]
                                return (
                                  <tr key={response.id}>
                                    <td>
                                      {supplier?.name || 'Onbekend'}
                                      {performance && (
                                        <span className="ms-2 badge bg-info">
                                          {performance.overall_rating}
                                        </span>
                                      )}
                                    </td>
                                    <td className="fw-bold">
                                      €{response.total_price?.toLocaleString('nl-NL') || '0'}
                                    </td>
                                    <td>
                                      {response.received_at ? 
                                        `${Math.round((new Date(response.received_at) - new Date(request.sent_at)) / (1000 * 60 * 60))} uur` : 
                                        'N/A'
                                      }
                                    </td>
                                    <td>
                                      {performance ? (
                                        <div className="d-flex align-items-center">
                                          <div className="me-2">
                                            {performance.on_time_delivery} op tijd
                                          </div>
                                          <div className={`badge bg-${performance.overall_rating === 'A' ? 'success' : performance.overall_rating === 'B' ? 'warning' : 'danger'}`}>
                                            {performance.overall_rating}
                                          </div>
                                        </div>
                                      ) : 'Geen historie'}
                                    </td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <button 
                                          className="btn btn-sm btn-outline-primary"
                                          onClick={() => handleStartNegotiation(request.id, response.supplier_id)}
                                        >
                                          <i className="ti ti-message me-1"></i>
                                          Onderhandelen
                                        </button>
                                        <button 
                                          className="btn btn-sm btn-success"
                                          onClick={() => handleGenerateOrder(request.id, response.supplier_id)}
                                        >
                                          <i className="ti ti-check me-1"></i>
                                          Selecteren
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="card border">
                          <div className="card-header">
                            <h6 className="mb-0">AI Aanbeveling</h6>
                          </div>
                          <div className="card-body">
                            <div className="alert alert-success">
                              <i className="ti ti-robot me-2"></i>
                              <strong>AI Advies:</strong> Kies de laagste offerte met rating A
                            </div>
                            <div className="alert alert-info">
                              <i className="ti ti-cash me-2"></i>
                              <strong>Cashflow Impact:</strong> €{Math.min(...request.responses.map(r => r.total_price || 0)).toLocaleString('nl-NL')} 
                            </div>
                            <div className="alert alert-warning">
                              <i className="ti ti-alert-triangle me-2"></i>
                              <strong>Risico Analyse:</strong> Levertijd kritiek
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              
              {priceRequests.filter(request => request.status === 'received' && request.responses && request.responses.length > 0).length === 0 && (
                <div className="text-center py-5">
                  <i className="ti ti-inbox text-muted" style={{fontSize: '3rem'}}></i>
                  <p className="text-muted mt-3">Geen prijsaanvragen klaar voor beslissing</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
