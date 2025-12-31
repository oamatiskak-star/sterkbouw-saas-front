import { useState } from "react"

export default function NegotiationTab({ 
  negotiationForm, setNegotiationForm, activeNegotiation, 
  negotiationHistory, handleSendNegotiation, loading 
}) {
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = () => {
    if (!newMessage.trim()) return

    if (activeNegotiation) {
      const updatedNegotiation = {
        ...activeNegotiation,
        messages: [
          ...activeNegotiation.messages,
          {
            type: "outgoing",
            content: newMessage,
            timestamp: new Date().toISOString(),
            strategy: negotiationForm.negotiation_strategy
          }
        ]
      }
      setActiveNegotiation(updatedNegotiation)
      setNegotiationForm({...negotiationForm, message: newMessage})
    }

    setNewMessage("")
  }

  return (
    <div>
      <h5 className="card-title mb-4">
        <i className="ti ti-message text-primary me-2"></i>
        AI Onderhandelingsassistent
      </h5>
      
      <div className="row">
        <div className="col-md-4">
          <div className="card border">
            <div className="card-header">
              <h6 className="mb-0">Onderhandelingsgeschiedenis</h6>
            </div>
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {negotiationHistory.map(negotiation => (
                  <button
                    key={negotiation.id}
                    className={`list-group-item list-group-item-action ${activeNegotiation?.id === negotiation.id ? 'active' : ''}`}
                    onClick={() => setActiveNegotiation(negotiation)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-bold">{negotiation.supplier_name}</div>
                        <small className="text-muted">
                          {new Date(negotiation.created_at).toLocaleDateString('nl-NL')}
                        </small>
                      </div>
                      <span className={`badge bg-${negotiation.status === 'active' ? 'success' : 'secondary'}`}>
                        {negotiation.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <small>
                        Doelprijs: €{negotiation.target_price?.toLocaleString('nl-NL')}
                      </small>
                    </div>
                  </button>
                ))}
                
                {negotiationHistory.length === 0 && (
                  <div className="text-center py-4">
                    <i className="ti ti-message-off text-muted" style={{fontSize: '2rem'}}></i>
                    <p className="text-muted mt-2">Geen onderhandelingen gestart</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-8">
          {activeNegotiation ? (
            <div className="card border">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">{activeNegotiation.supplier_name}</h6>
                  <div>
                    <span className="badge bg-primary me-2">
                      Strategie: {activeNegotiation.strategy}
                    </span>
                    <span className="badge bg-success">
                      Doelprijs: €{activeNegotiation.target_price?.toLocaleString('nl-NL')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="card-body">
                {/* Onderhandelingsstappen */}
                <div className="mb-4">
                  <h6 className="mb-3">AI Onderhandelingsstappen</h6>
                  <div className="timeline timeline-activity">
                    {activeNegotiation.steps?.map((step, index) => (
                      <div key={index} className="timeline-item">
                        <div className="timeline-line"></div>
                        <div className="timeline-icon">
                          <i className={`ti ti-${index === 0 ? 'circle-check' : 'circle'} text-${index === 0 ? 'success' : 'muted'}`}></i>
                        </div>
                        <div className="timeline-content">
                          <div className={`fw-bold ${index === 0 ? 'text-success' : ''}`}>
                            Stap {index + 1}
                          </div>
                          <small className="text-muted">{step}</small>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chat interface */}
                <div className="border rounded p-3 mb-3" style={{height: '300px', overflowY: 'auto'}}>
                  {activeNegotiation.messages?.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-3 ${message.type === 'outgoing' ? 'text-end' : ''}`}
                    >
                      <div 
                        className={`d-inline-block p-3 rounded ${message.type === 'outgoing' ? 'bg-primary text-white' : 'bg-light'}`}
                        style={{maxWidth: '80%'}}
                      >
                        {message.content}
                        <div className={`small mt-1 ${message.type === 'outgoing' ? 'text-white-50' : 'text-muted'}`}>
                          {new Date(message.timestamp).toLocaleTimeString('nl-NL', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message input */}
                <div className="mb-3">
                  <label className="form-label">Nieuw bericht</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Typ je onderhandelingsbericht..."
                  />
                </div>
                
                {/* Negotiation form */}
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Doelprijs</label>
                    <input
                      type="number"
                      className="form-control"
                      value={negotiationForm.target_price}
                      onChange={(e) => setNegotiationForm({...negotiationForm, target_price: e.target.value})}
                    />
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label">Strategie</label>
                    <select 
                      className="form-select"
                      value={negotiationForm.negotiation_strategy}
                      onChange={(e) => setNegotiationForm({...negotiationForm, negotiation_strategy: e.target.value})}
                    >
                      <option value="volume_discount">Volume Korting</option>
                      <option value="payment_terms">Betalingsvoorwaarden</option>
                      <option value="delivery_time">Levertijd</option>
                      <option value="quality_focus">Kwaliteit</option>
                    </select>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                      <button 
                        className="btn btn-primary"
                        onClick={handleSendNegotiation}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Verzenden...
                          </>
                        ) : (
                          <>
                            <i className="ti ti-send me-2"></i>
                            Bericht Versturen
                          </>
                        )}
                      </button>
                      
                      <button 
                        className="btn btn-outline-success"
                        onClick={handleSendMessage}
                      >
                        <i className="ti ti-message-plus me-2"></i>
                        Bericht Toevoegen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border">
              <div className="card-body text-center py-5">
                <i className="ti ti-message-question text-muted" style={{fontSize: '3rem'}}></i>
                <h5 className="mt-3">Selecteer een onderhandeling</h5>
                <p className="text-muted">
                  Kies een onderhandeling uit de geschiedenis om details te zien en berichten te sturen.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
