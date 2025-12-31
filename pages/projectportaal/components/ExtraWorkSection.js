// Frontend/pages/projectportaal/components/ExtraWorkSection.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
  fetchExtraWorkRequests, 
  fetchQuoteDetails, 
  approveQuote, 
  declineQuote,
  requestQuoteChanges
} from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';
import { useNotifications } from '../../../hooks/useNotifications';
import { formatCurrency, formatDate, formatFileSize } from '../../../utils/formatters';

const ExtraWorkSection = ({ 
  requests: initialRequests = [], 
  onRequestExtraWork, 
  onApproveQuote,
  projectId 
}) => {
  const { user, token } = useAuth();
  const { showNotification } = useNotifications();
  
  const [requests, setRequests] = useState(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [viewMode, setViewMode] = useState('list'); // 'list', 'grid', 'detail'
  const [newRequest, setNewRequest] = useState({
    description: '',
    location: '',
    urgency: 'normal',
    drawings: [],
    materials: []
  });
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [changesRequest, setChangesRequest] = useState({
    quoteId: null,
    requestedChanges: [],
    comments: ''
  });

  // Laad meerwerk aanvragen bij mount
  useEffect(() => {
    loadExtraWorkRequests();
  }, [projectId, filters]);

  const loadExtraWorkRequests = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      const data = await fetchExtraWorkRequests(projectId, filters);
      setRequests(data.requests || []);
      
      // Als er een geselecteerde aanvraag is, refresh de details
      if (selectedRequest) {
        const refreshed = data.requests.find(r => r.id === selectedRequest.id);
        if (refreshed) setSelectedRequest(refreshed);
      }
    } catch (error) {
      console.error('Fout bij laden meerwerkaanvragen:', error);
      showNotification({
        type: 'error',
        title: 'Laden mislukt',
        message: 'Kon meerwerkaanvragen niet laden'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRequest = async (request) => {
    setSelectedRequest(request);
    setViewMode('detail');
    
    // Laad offerte details als er een offerte is
    if (request.quotes && request.quotes.length > 0) {
      const latestQuote = request.quotes[0];
      await loadQuoteDetails(latestQuote.id);
    }
  };

  const loadQuoteDetails = async (quoteId) => {
    try {
      const quote = await fetchQuoteDetails(quoteId);
      setSelectedQuote(quote);
    } catch (error) {
      console.error('Fout bij laden offerte details:', error);
    }
  };

  const handleApproveQuote = async (quoteId, signatureData = null) => {
    if (!confirm('Weet u zeker dat u deze offerte wilt goedkeuren?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      const approvalData = {
        clientName: user.fullName,
        signature: signatureData,
        termsAccepted: true,
        termsAcceptedAt: new Date().toISOString(),
        approvalMethod: 'digital'
      };

      const result = await approveQuote(quoteId, approvalData);
      
      showNotification({
        type: 'success',
        title: 'Offerte goedgekeurd',
        message: result.message,
        duration: 5000
      });

      // Refresh data
      await loadExtraWorkRequests();
      
      // Call parent callback
      if (onApproveQuote) {
        onApproveQuote(quoteId);
      }
    } catch (error) {
      console.error('Fout bij goedkeuren offerte:', error);
      showNotification({
        type: 'error',
        title: 'Goedkeuring mislukt',
        message: error.response?.data?.error || 'Kon offerte niet goedkeuren'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineQuote = async (quoteId, reason, feedback) => {
    if (!reason) {
      alert('Selecteer een reden voor afwijzing');
      return;
    }

    if (!confirm('Weet u zeker dat u deze offerte wilt afwijzen?')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await declineQuote(quoteId, { reason, feedback });
      
      showNotification({
        type: 'info',
        title: 'Offerte afgewezen',
        message: 'De projectleider is op de hoogte gesteld.',
        duration: 5000
      });

      await loadExtraWorkRequests();
    } catch (error) {
      console.error('Fout bij afwijzen offerte:', error);
      showNotification({
        type: 'error',
        title: 'Afwijzing mislukt',
        message: error.response?.data?.error || 'Kon offerte niet afwijzen'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async (quoteId, changesData) => {
    setIsSubmitting(true);
    try {
      await requestQuoteChanges(quoteId, changesData);
      
      showNotification({
        type: 'success',
        title: 'Wijzigingen aangevraagd',
        message: 'De projectleider zal een aangepaste offerte maken.',
        duration: 5000
      });

      await loadExtraWorkRequests();
      setChangesRequest({ quoteId: null, requestedChanges: [], comments: '' });
    } catch (error) {
      console.error('Fout bij aanvragen wijzigingen:', error);
      showNotification({
        type: 'error',
        title: 'Aanvraag mislukt',
        message: error.response?.data?.error || 'Kon wijzigingen niet aanvragen'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitNewRequest = async () => {
    if (!newRequest.description.trim()) {
      alert('Beschrijving is verplicht');
      return;
    }

    setIsSubmitting(true);
    try {
      await onRequestExtraWork(newRequest);
      
      showNotification({
        type: 'success',
        title: 'Aanvraag ingediend',
        message: 'Uw meerwerkaanvraag is ontvangen. De projectleider neemt contact op.',
        duration: 5000
      });

      setNewRequest({
        description: '',
        location: '',
        urgency: 'normal',
        drawings: [],
        materials: []
      });
      setShowNewRequestForm(false);
      await loadExtraWorkRequests();
    } catch (error) {
      console.error('Fout bij indienen aanvraag:', error);
      showNotification({
        type: 'error',
        title: 'Indienen mislukt',
        message: error.response?.data?.error || 'Kon aanvraag niet indienen'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadQuotePDF = async (quote) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/quotes/${quote.id}/download`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Download mislukt');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `offerte-${quote.quote_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showNotification({
        type: 'success',
        title: 'PDF gedownload',
        message: `Offerte ${quote.quote_number} is gedownload`,
        duration: 3000
      });
    } catch (error) {
      console.error('Download PDF error:', error);
      showNotification({
        type: 'error',
        title: 'Download mislukt',
        message: 'Kon PDF niet downloaden'
      });
    }
  };

  // Filter requests
  const filteredRequests = requests.filter(request => {
    if (filters.status !== 'all' && request.status !== filters.status) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        request.description?.toLowerCase().includes(searchLower) ||
        request.location?.toLowerCase().includes(searchLower) ||
        request.quote_number?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  // Groepeer requests op status
  const groupedRequests = {
    pending: filteredRequests.filter(r => r.status === 'pending'),
    quote_requested: filteredRequests.filter(r => r.status === 'quote_requested'),
    quote_provided: filteredRequests.filter(r => r.status === 'quote_provided'),
    quote_approved: filteredRequests.filter(r => r.status === 'quote_approved'),
    in_progress: filteredRequests.filter(r => r.status === 'in_progress'),
    completed: filteredRequests.filter(r => r.status === 'completed'),
    declined: filteredRequests.filter(r => r.status === 'declined')
  };

  // Render functies
  const renderRequestCard = (request) => (
    <div 
      key={request.id} 
      className={`request-card ${selectedRequest?.id === request.id ? 'selected' : ''}`}
      onClick={() => handleSelectRequest(request)}
    >
      <div className="request-card-header">
        <h4>{request.description?.substring(0, 60)}{request.description?.length > 60 ? '...' : ''}</h4>
        <span className={`status-badge status-${request.status}`}>
          {getStatusLabel(request.status)}
        </span>
      </div>
      
      <div className="request-card-body">
        <p className="request-location">
          <i className="icon-location"></i> {request.location || 'Niet gespecificeerd'}
        </p>
        
        <div className="request-meta">
          <span className="request-date">
            <i className="icon-calendar"></i> {formatDate(request.created_at)}
          </span>
          
          {request.quotes && request.quotes.length > 0 && (
            <span className="request-quote">
              <i className="icon-euro"></i> {formatCurrency(request.quotes[0].total_amount)}
            </span>
          )}
        </div>
        
        {request.urgency === 'urgent' && (
          <div className="urgency-badge">⚠️ Spoedgeval</div>
        )}
      </div>
      
      <div className="request-card-footer">
        <button 
          className="btn-view-details"
          onClick={(e) => {
            e.stopPropagation();
            handleSelectRequest(request);
          }}
        >
          Details bekijken
        </button>
      </div>
    </div>
  );

  const renderQuoteDetailView = () => {
    if (!selectedQuote) return null;

    return (
      <div className="quote-detail-view">
        <div className="quote-detail-header">
          <h3>Offerte {selectedQuote.quote_number}</h3>
          <div className="quote-status">
            <span className={`status-badge status-${selectedQuote.status}`}>
              {getQuoteStatusLabel(selectedQuote.status)}
            </span>
            <span className="quote-valid-until">
              Geldig tot: {formatDate(selectedQuote.valid_until)}
            </span>
          </div>
        </div>

        <div className="quote-content">
          {/* Kostenoverzicht */}
          <div className="cost-breakdown">
            <h4>Kostenoverzicht</h4>
            <table className="cost-table">
              <thead>
                <tr>
                  <th>Omschrijving</th>
                  <th>Aantal</th>
                  <th>Prijs per</th>
                  <th>Totaal</th>
                </tr>
              </thead>
              <tbody>
                {selectedQuote.materials?.map((material, index) => (
                  <tr key={`material-${index}`}>
                    <td>{material.description}</td>
                    <td>{material.quantity}</td>
                    <td>{formatCurrency(material.unit_price)}</td>
                    <td>{formatCurrency(material.total)}</td>
                  </tr>
                ))}
                {selectedQuote.labor?.map((labor, index) => (
                  <tr key={`labor-${index}`}>
                    <td>{labor.description}</td>
                    <td>{labor.hours} uur</td>
                    <td>{formatCurrency(labor.hourly_rate)}/uur</td>
                    <td>{formatCurrency(labor.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3"><strong>Subtotaal</strong></td>
                  <td><strong>{formatCurrency(selectedQuote.subtotal)}</strong></td>
                </tr>
                <tr>
                  <td colSpan="3">BTW (21%)</td>
                  <td>{formatCurrency(selectedQuote.vat_amount)}</td>
                </tr>
                <tr className="total-row">
                  <td colSpan="3"><strong>TOTAAL</strong></td>
                  <td><strong>{formatCurrency(selectedQuote.total_amount)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Technische tekeningen */}
          {selectedQuote.drawings && selectedQuote.drawings.length > 0 && (
            <div className="drawings-section">
              <h4>Technische tekeningen</h4>
              <div className="drawings-grid">
                {selectedQuote.drawings.map((drawing, index) => (
                  <div key={`drawing-${index}`} className="drawing-thumbnail">
                    <div className="drawing-preview">
                      {drawing.thumbnail_url ? (
                        <img src={drawing.thumbnail_url} alt={drawing.title} />
                      ) : (
                        <div className="drawing-placeholder">
                          <i className="icon-drawing"></i>
                          <span>{drawing.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="drawing-info">
                      <h5>{drawing.title}</h5>
                      <p>Revisie: {drawing.revision}</p>
                      <a 
                        href={drawing.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-view-drawing"
                      >
                        Bekijk tekening
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actie knoppen */}
          <div className="quote-actions">
            {selectedQuote.status === 'ready_for_review' && (
              <>
                <button 
                  className="btn-approve"
                  onClick={() => handleApproveQuote(selectedQuote.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verwerken...' : '✅ Offerte goedkeuren'}
                </button>
                
                <button 
                  className="btn-decline"
                  onClick={() => setShowDeclineModal(true)}
                  disabled={isSubmitting}
                >
                  ❌ Offerte afwijzen
                </button>
                
                <button 
                  className="btn-request-changes"
                  onClick={() => setChangesRequest({ 
                    ...changesRequest, 
                    quoteId: selectedQuote.id 
                  })}
                  disabled={isSubmitting}
                >
                  ✏️ Wijzigingen aanvragen
                </button>
              </>
            )}
            
            <button 
              className="btn-download-pdf"
              onClick={() => downloadQuotePDF(selectedQuote)}
            >
              📥 Download PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderRequestDetailView = () => {
    if (!selectedRequest) return null;

    return (
      <div className="request-detail-view">
        <button 
          className="btn-back"
          onClick={() => setViewMode('list')}
        >
          ← Terug naar overzicht
        </button>

        <div className="request-detail-header">
          <h3>{selectedRequest.description}</h3>
          <div className="request-detail-meta">
            <span className={`status-badge status-${selectedRequest.status}`}>
              {getStatusLabel(selectedRequest.status)}
            </span>
            <span className="request-date">
              Aangevraagd op: {formatDate(selectedRequest.created_at)}
            </span>
            {selectedRequest.urgency === 'urgent' && (
              <span className="urgency-label">⚠️ Spoedgeval</span>
            )}
          </div>
        </div>

        <div className="request-detail-content">
          <div className="detail-section">
            <h4>Locatie</h4>
            <p>{selectedRequest.location || 'Niet gespecificeerd'}</p>
          </div>

          <div className="detail-section">
            <h4>Statusoverzicht</h4>
            <div className="status-timeline">
              {getStatusTimeline(selectedRequest).map((step, index) => (
                <div key={`step-${index}`} className={`timeline-step ${step.active ? 'active' : ''}`}>
                  <div className="step-icon">{step.icon}</div>
                  <div className="step-content">
                    <h5>{step.title}</h5>
                    <p>{step.description}</p>
                    {step.date && <span className="step-date">{formatDate(step.date)}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offerte sectie */}
          {selectedRequest.quotes && selectedRequest.quotes.length > 0 && (
            <div className="detail-section">
              <h4>Offertes</h4>
              <div className="quotes-list">
                {selectedRequest.quotes.map((quote, index) => (
                  <div 
                    key={`quote-${index}`} 
                    className={`quote-summary ${selectedQuote?.id === quote.id ? 'selected' : ''}`}
                    onClick={() => loadQuoteDetails(quote.id)}
                  >
                    <div className="quote-summary-header">
                      <h5>Offerte {quote.quote_number}</h5>
                      <span className={`status-badge status-${quote.status}`}>
                        {getQuoteStatusLabel(quote.status)}
                      </span>
                    </div>
                    <div className="quote-summary-body">
                      <p>Bedrag: {formatCurrency(quote.total_amount)}</p>
                      <p>Geldig tot: {formatDate(quote.valid_until)}</p>
                      {quote.pdf_url && (
                        <a 
                          href={quote.pdf_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view-pdf"
                        >
                          Bekijk PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Toon geselecteerde offerte details */}
              {selectedQuote && renderQuoteDetailView()}
            </div>
          )}

          {/* Actie knoppen op basis van status */}
          <div className="request-actions">
            {selectedRequest.status === 'pending' && (
              <button 
                className="btn-request-quote"
                onClick={() => {
                  if (confirm('Offerte aanvragen voor deze meerwerkaanvraag?')) {
                    // Implementeer quote aanvraag
                  }
                }}
              >
                📋 Offerte aanvragen
              </button>
            )}

            {selectedRequest.status === 'quote_provided' && selectedQuote && (
              <div className="quote-action-buttons">
                <button 
                  className="btn-approve-large"
                  onClick={() => handleApproveQuote(selectedQuote.id)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Verwerken...' : '✅ OFFERTE GOEDKEUREN'}
                </button>
                <p className="action-note">
                  Door te klikken op "Offerte goedkeuren" gaat u akkoord met de voorwaarden
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderNewRequestForm = () => (
    <div className="new-request-form">
      <h3>Nieuwe meerwerkaanvraag</h3>
      
      <div className="form-group">
        <label>Beschrijving *</label>
        <textarea
          value={newRequest.description}
          onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
          placeholder="Beschrijf het gewenste meerwerk..."
          rows={4}
          required
        />
      </div>

      <div className="form-group">
        <label>Locatie op het project</label>
        <input
          type="text"
          value={newRequest.location}
          onChange={(e) => setNewRequest({...newRequest, location: e.target.value})}
          placeholder="Bijv. begane grond, badkamer, achtertuin..."
        />
      </div>

      <div className="form-group">
        <label>Urgentie</label>
        <select
          value={newRequest.urgency}
          onChange={(e) => setNewRequest({...newRequest, urgency: e.target.value})}
        >
          <option value="normal">Normaal</option>
          <option value="urgent">Urgent</option>
          <option value="very_urgent">Zeer urgent</option>
        </select>
      </div>

      <div className="form-group">
        <label>Bijlagen (optioneel)</label>
        <div className="file-upload-area">
          <p>Sleep bestanden hierheen of klik om te selecteren</p>
          <input
            type="file"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setNewRequest({...newRequest, drawings: files});
            }}
          />
          {newRequest.drawings.length > 0 && (
            <div className="uploaded-files">
              <p>Geselecteerde bestanden:</p>
              <ul>
                {newRequest.drawings.map((file, index) => (
                  <li key={index}>{file.name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn-cancel"
          onClick={() => setShowNewRequestForm(false)}
          disabled={isSubmitting}
        >
          Annuleren
        </button>
        <button
          className="btn-submit"
          onClick={submitNewRequest}
          disabled={isSubmitting || !newRequest.description.trim()}
        >
          {isSubmitting ? 'Indienen...' : 'Aanvraag indienen'}
        </button>
      </div>
    </div>
  );

  // Helper functies
  const getStatusLabel = (status) => {
    const labels = {
      'pending': 'In afwachting',
      'quote_requested': 'Offerte aangevraagd',
      'quote_provided': 'Offerte beschikbaar',
      'quote_approved': 'Offerte goedgekeurd',
      'in_progress': 'In uitvoering',
      'completed': 'Voltooid',
      'declined': 'Afgewezen',
      'cancelled': 'Geannuleerd'
    };
    return labels[status] || status;
  };

  const getQuoteStatusLabel = (status) => {
    const labels = {
      'concept': 'Concept',
      'ready_for_review': 'Ter beoordeling',
      'approved_by_client': 'Goedgekeurd',
      'declined_by_client': 'Afgewezen',
      'changes_requested': 'Wijzigingen aangevraagd',
      'approved_by_project_leader': 'Goedgekeurd door PL',
      'expired': 'Verlopen'
    };
    return labels[status] || status;
  };

  const getStatusTimeline = (request) => {
    const timeline = [
      {
        icon: '📝',
        title: 'Aanvraag ingediend',
        description: 'Meerwerkaanvraag is ontvangen',
        date: request.created_at,
        active: true
      }
    ];

    if (request.quote_requested_at) {
      timeline.push({
        icon: '📋',
        title: 'Offerte aangevraagd',
        description: 'Offerte is aangevraagd bij projectleider',
        date: request.quote_requested_at,
        active: ['quote_requested', 'quote_provided', 'quote_approved', 'in_progress', 'completed'].includes(request.status)
      });
    }

    if (request.quotes && request.quotes.length > 0) {
      const latestQuote = request.quotes[0];
      timeline.push({
        icon: '💰',
        title: 'Offerte gemaakt',
        description: `Offerte ${latestQuote.quote_number} is opgesteld`,
        date: latestQuote.created_at,
        active: ['quote_provided', 'quote_approved', 'in_progress', 'completed'].includes(request.status)
      });
    }

    if (request.status === 'quote_approved') {
      timeline.push({
        icon: '✅',
        title: 'Offerte goedgekeurd',
        description: 'Offerte is door u goedgekeurd',
        date: request.quotes?.[0]?.approved_at,
        active: true
      });
    }

    if (request.status === 'in_progress') {
      timeline.push({
        icon: '🚧',
        title: 'In uitvoering',
        description: 'Meerwerk wordt uitgevoerd',
        active: true
      });
    }

    if (request.status === 'completed') {
      timeline.push({
        icon: '🏁',
        title: 'Voltooid',
        description: 'Meerwerk is afgerond',
        date: request.completed_at,
        active: true
      });
    }

    return timeline;
  };

  // Main render
  return (
    <div className="extra-work-section">
      <div className="section-header">
        <h2>Meerwerk & Offertes</h2>
        <p>Beheer uw meerwerkaanvragen en offertes</p>
      </div>

      {/* Control bar */}
      <div className="control-bar">
        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="filter-select"
          >
            <option value="all">Alle statussen</option>
            <option value="pending">In afwachting</option>
            <option value="quote_requested">Offerte aangevraagd</option>
            <option value="quote_provided">Offerte beschikbaar</option>
            <option value="quote_approved">Goedgekeurd</option>
            <option value="in_progress">In uitvoering</option>
            <option value="completed">Voltooid</option>
          </select>

          <input
            type="text"
            placeholder="Zoek in meerwerk..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            className="search-input"
          />
        </div>

        <div className="actions">
          <button 
            className="btn-new-request"
            onClick={() => setShowNewRequestForm(!showNewRequestForm)}
          >
            {showNewRequestForm ? 'Annuleren' : '+ Nieuwe aanvraag'}
          </button>
          
          <div className="view-toggle">
            <button 
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="Lijstweergave"
            >
              ☰
            </button>
            <button 
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Rasterweergave"
            >
              ⬜
            </button>
          </div>
        </div>
      </div>

      {/* Nieuwe aanvraag formulier */}
      {showNewRequestForm && renderNewRequestForm()}

      {/* Laad status */}
      {isLoading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Meerwerk laden...</p>
        </div>
      )}

      {/* Hoofd content */}
      {!isLoading && (
        <>
          {viewMode === 'list' || viewMode === 'grid' ? (
            <>
              {/* Statistieken */}
              <div className="stats-overview">
                <div className="stat-card">
                  <h3>{filteredRequests.length}</h3>
                  <p>Totaal aanvragen</p>
                </div>
                <div className="stat-card">
                  <h3>{groupedRequests.quote_provided.length}</h3>
                  <p>Offertes ter beoordeling</p>
                </div>
                <div className="stat-card">
                  <h3>{groupedRequests.quote_approved.length}</h3>
                  <p>Goedgekeurd</p>
                </div>
                <div className="stat-card">
                  <h3>
                    {formatCurrency(
                      filteredRequests.reduce((sum, req) => {
                        if (req.quotes && req.quotes.length > 0) {
                          return sum + (req.quotes[0].total_amount || 0);
                        }
                        return sum;
                      }, 0)
                    )}
                  </h3>
                  <p>Totaal bedrag</p>
                </div>
              </div>

              {/* Requests grid/list */}
              <div className={`requests-container ${viewMode}`}>
                {filteredRequests.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h4>Geen meerwerkaanvragen gevonden</h4>
                    <p>
                      {filters.status !== 'all' || filters.search 
                        ? 'Probeer andere filters' 
                        : 'U heeft nog geen meerwerk aangevraagd'}
                    </p>
                    {!filters.search && filters.status === 'all' && (
                      <button 
                        className="btn-new-request-empty"
                        onClick={() => setShowNewRequestForm(true)}
                      >
                        + Eerste aanvraag maken
                      </button>
                    )}
                  </div>
                ) : (
                  filteredRequests.map(renderRequestCard)
                )}
              </div>
            </>
          ) : (
            /* Detail view */
            renderRequestDetailView()
          )}
        </>
      )}

      {/* Modals */}
      {changesRequest.quoteId && (
        <ChangesRequestModal
          quoteId={changesRequest.quoteId}
          onClose={() => setChangesRequest({ quoteId: null, requestedChanges: [], comments: '' })}
          onSubmit={handleRequestChanges}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

// Modal component voor wijzigingen aanvragen
const ChangesRequestModal = ({ quoteId, onClose, onSubmit, isSubmitting }) => {
  const [changes, setChanges] = useState([{ section: '', currentValue: '', requestedValue: '', reason: '' }]);
  const [comments, setComments] = useState('');

  const addChange = () => {
    setChanges([...changes, { section: '', currentValue: '', requestedValue: '', reason: '' }]);
  };

  const removeChange = (index) => {
    const newChanges = changes.filter((_, i) => i !== index);
    setChanges(newChanges);
  };

  const updateChange = (index, field, value) => {
    const newChanges = [...changes];
    newChanges[index][field] = value;
    setChanges(newChanges);
  };

  const handleSubmit = () => {
    const validChanges = changes.filter(c => 
      c.section && c.currentValue && c.requestedValue && c.reason
    );
    
    if (validChanges.length === 0) {
      alert('Voeg minimaal één wijziging toe');
      return;
    }

    onSubmit(quoteId, {
      requestedChanges: validChanges,
      comments
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Wijzigingen aanvragen</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <p>Geef aan welke wijzigingen u wilt doorvoeren in de offerte:</p>
          
          {changes.map((change, index) => (
            <div key={index} className="change-item">
              <div className="change-header">
                <h4>Wijziging {index + 1}</h4>
                {changes.length > 1 && (
                  <button 
                    className="btn-remove-change"
                    onClick={() => removeChange(index)}
                  >
                    Verwijder
                  </button>
                )}
              </div>
              
              <div className="change-form">
                <select
                  value={change.section}
                  onChange={(e) => updateChange(index, 'section', e.target.value)}
                  className="change-select"
                >
                  <option value="">Selecteer sectie</option>
                  <option value="materials">Materialen</option>
                  <option value="labor">Arbeid</option>
                  <option value="scope">Werkomschrijving</option>
                  <option value="timeline">Planning</option>
                  <option value="specifications">Specificaties</option>
                </select>

                <input
                  type="text"
                  placeholder="Huidige waarde"
                  value={change.currentValue}
                  onChange={(e) => updateChange(index, 'currentValue', e.target.value)}
                  className="change-input"
                />

                <input
                  type="text"
                  placeholder="Gewenste waarde"
                  value={change.requestedValue}
                  onChange={(e) => updateChange(index, 'requestedValue', e.target.value)}
                  className="change-input"
                />

                <input
                  type="text"
                  placeholder="Reden voor wijziging"
                  value={change.reason}
                  onChange={(e) => updateChange(index, 'reason', e.target.value)}
                  className="change-input"
                />
              </div>
            </div>
          ))}

          <button className="btn-add-change" onClick={addChange}>
            + Nog een wijziging toevoegen
          </button>

          <div className="comments-section">
            <label>Extra opmerkingen (optioneel)</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Voeg eventuele aanvullende opmerkingen toe..."
              rows={3}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Annuleren
          </button>
          <button 
            className="btn-submit" 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Versturen...' : 'Wijzigingen aanvragen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtraWorkSection;
