// Frontend/pages/projectportaal/components/ProjectOverview.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { 
  fetchPortalData, 
  getProjectStats, 
  getProjectTimeline,
  askQuestion,
  postClientAction
} from '@/services/api';
import { formatCurrency, formatDate, formatFileSize } from '@/utils/formatters';

const ProjectOverview = ({ 
  data: initialData = null, 
  onAskQuestion,
  projectId 
}) => {
  const { userProfile, isSuperAdmin } = useAuth();
  const [projectData, setProjectData] = useState(initialData);
  const [stats, setStats] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [quickActions, setQuickActions] = useState([]);
  const [questionForm, setQuestionForm] = useState({
    subject: '',
    message: '',
    isUrgent: false
  });

  // Laad alle project data bij mount
  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoading(true);
    try {
      // Haal ALLE portaal data in één keer op
      const portalData = await fetchPortalData(projectId);
      setProjectData(portalData.project);
      
      // Haal statistieken op
      const statsData = await getProjectStats(projectId);
      setStats(statsData);
      
      // Haal tijdlijn op
      const timelineData = await getProjectTimeline(projectId);
      setTimeline(timelineData);
      
      // Genereer quick actions op basis van status
      generateQuickActions(portalData, statsData);
      
      setError(null);
    } catch (error) {
      console.error('Fout bij laden project overzicht:', error);
      setError('Kon projectgegevens niet laden');
    } finally {
      setIsLoading(false);
    }
  };

  // Genereer quick actions
  const generateQuickActions = (portalData, statsData) => {
    const actions = [];
    
    // Altijd beschikbaar
    actions.push({
      id: 'ask-question',
      icon: '❓',
      title: 'Stel een vraag',
      description: 'Direct contact met projectleider',
      action: () => setActiveTab('communication'),
      color: 'blue',
      priority: 1
    });
    
    // Als er offertes zijn ter beoordeling
    if (statsData?.quotes?.byStatus?.ready_for_review > 0) {
      actions.push({
        id: 'review-quotes',
        icon: '💰',
        title: 'Offertes beoordelen',
        description: `${statsData.quotes.byStatus.ready_for_review} offerte(s) wachten op goedkeuring`,
        action: () => setActiveTab('extraWork'),
        color: 'orange',
        priority: 10
      });
    }
    
    // Als er meerwerk in uitvoering is
    if (statsData?.extraWork?.byStatus?.in_progress > 0) {
      actions.push({
        id: 'view-progress',
        icon: '🚧',
        title: 'Bekijk voortgang',
        description: `${statsData.extraWork.byStatus.in_progress} meerwerk in uitvoering`,
        action: () => setActiveTab('extraWork'),
        color: 'green',
        priority: 5
      });
    }
    
    // Als er documenten zijn
    if (portalData.documents && portalData.documents.length > 0) {
      actions.push({
        id: 'view-documents',
        icon: '📄',
        title: 'Documenten',
        description: `${portalData.documents.length} documenten beschikbaar`,
        action: () => setActiveTab('documents'),
        color: 'purple',
        priority: 3
      });
    }
    
    // Contracten die bevestiging nodig hebben
    if (portalData.documents?.some(doc => doc.type === 'contract' && !doc.confirmed)) {
      actions.push({
        id: 'review-contracts',
        icon: '📝',
        title: 'Contracten bevestigen',
        description: 'Contracten wachten op uw handtekening',
        action: () => setActiveTab('contract'),
        color: 'red',
        priority: 9
      });
    }
    
    // SUPER_ADMIN acties
    if (isSuperAdmin) {
      actions.push({
        id: 'admin-dashboard',
        icon: '🚀',
        title: 'SUPER_ADMIN Panel',
        description: 'Volledige systeemtoegang',
        action: () => window.open('/admin', '_blank'),
        color: 'gold',
        priority: 100
      });
    }
    
    // Sorteer op priority
    actions.sort((a, b) => b.priority - a.priority);
    setQuickActions(actions.slice(0, 6)); // Max 6 acties tonen
  };

  const handleAskQuestion = async () => {
    if (!questionForm.subject.trim() || !questionForm.message.trim()) {
      alert('Onderwerp en bericht zijn verplicht');
      return;
    }

    try {
      await askQuestion(projectId, {
        subject: questionForm.subject,
        message: questionForm.message,
        isUrgent: questionForm.isUrgent
      });
      
      // Reset form
      setQuestionForm({
        subject: '',
        message: '',
        isUrgent: false
      });
      
      alert('Vraag succesvol verzonden! De projectleider neemt contact op.');
      
      // Call parent callback
      if (onAskQuestion) {
        onAskQuestion(questionForm.subject, questionForm.message);
      }
    } catch (error) {
      console.error('Fout bij verzenden vraag:', error);
      alert('Kon vraag niet verzenden: ' + error.message);
    }
  };

  const handleQuickAction = (action) => {
    if (typeof action.action === 'function') {
      action.action();
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="project-overview-loading">
        <div className="loading-spinner large"></div>
        <p>Projectgegevens laden voor {projectId}...</p>
        {isSuperAdmin && (
          <div className="super-admin-loading-note">
            🚀 SUPER_ADMIN modus: Toegang tot alle gegevens
          </div>
        )}
      </div>
    );
  }

  // Render error state
  if (error || !projectData) {
    return (
      <div className="project-overview-error">
        <div className="error-icon">⚠️</div>
        <h3>{error || 'Project niet gevonden'}</h3>
        <p>Kon projectgegevens niet laden. Controleer de link of neem contact op.</p>
        {isSuperAdmin && (
          <div className="super-admin-error-actions">
            <button onClick={loadProjectData} className="btn-retry">
              Opnieuw proberen
            </button>
            <button 
              onClick={() => window.location.href = `/admin/projects/${projectId}`}
              className="btn-admin-view"
            >
              🚀 SUPER_ADMIN: Project bekijken
            </button>
          </div>
        )}
      </div>
    );
  }

  // Render main overview
  return (
    <div className="project-overview">
      {/* Header met project info */}
      <div className="project-header">
        <div className="project-title-section">
          <h1>{projectData.name}</h1>
          <div className="project-meta">
            <span className="project-id">Project ID: {projectId}</span>
            <span className="project-status">
              Status: <span className={`status-badge status-${projectData.status}`}>
                {getStatusLabel(projectData.status)}
              </span>
            </span>
            {isSuperAdmin && (
              <span className="super-admin-badge">🚀 SUPER_ADMIN VIEW</span>
            )}
          </div>
        </div>
        
        <div className="project-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${projectData.progress || 0}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Voortgang: <strong>{projectData.progress || 0}%</strong>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="quick-stats-row">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats?.extraWork?.total_amount || 0)}</h3>
            <p>Totaal meerwerk</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <h3>{stats?.extraWork?.total || 0}</h3>
            <p>Meerwerk aanvragen</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <h3>{stats?.documents?.total || 0}</h3>
            <p>Documenten</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <h3>{timeline?.milestones?.filter(m => m.status === 'completed').length || 0}/{timeline?.milestones?.length || 0}</h3>
            <p>Milestones voltooid</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="overview-content-grid">
        {/* Linker kolom: Project info & Quick Actions */}
        <div className="left-column">
          {/* Project Details Card */}
          <div className="card project-details-card">
            <h3>Project Details</h3>
            <div className="details-grid">
              <div className="detail-item">
                <span className="detail-label">Projectleider:</span>
                <span className="detail-value">
                  {projectData.project_leader?.full_name || 'Niet toegewezen'}
                  {projectData.project_leader?.email && (
                    <a href={`mailto:${projectData.project_leader.email}`} className="email-link">
                      {projectData.project_leader.email}
                    </a>
                  )}
                </span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Locatie:</span>
                <span className="detail-value">{projectData.address || 'Niet gespecificeerd'}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Startdatum:</span>
                <span className="detail-value">{formatDate(projectData.start_date)}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Einddatum:</span>
                <span className="detail-value">{formatDate(projectData.end_date)}</span>
              </div>
              
              <div className="detail-item">
                <span className="detail-label">Laatste update:</span>
                <span className="detail-value">{formatDate(projectData.last_updated || projectData.updated_at)}</span>
              </div>
            </div>
            
            {isSuperAdmin && (
              <div className="super-admin-details">
                <h4>🚀 SUPER_ADMIN Details</h4>
                <div className="admin-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Client ID:</span>
                    <span className="detail-value">{projectData.client_id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Budget:</span>
                    <span className="detail-value">{formatCurrency(projectData.budget || 0)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Werkelijke kosten:</span>
                    <span className="detail-value">{formatCurrency(projectData.actual_costs || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Card */}
          <div className="card quick-actions-card">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              {quickActions.map(action => (
                <button
                  key={action.id}
                  className={`action-button ${action.color}`}
                  onClick={() => handleQuickAction(action)}
                >
                  <span className="action-icon">{action.icon}</span>
                  <div className="action-content">
                    <h4>{action.title}</h4>
                    <p>{action.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ask Question Card */}
          <div className="card question-card">
            <h3>Directe vraag aan projectleider</h3>
            <div className="question-form">
              <input
                type="text"
                placeholder="Onderwerp van uw vraag"
                value={questionForm.subject}
                onChange={(e) => setQuestionForm({...questionForm, subject: e.target.value})}
                className="question-input"
              />
              
              <textarea
                placeholder="Beschrijf uw vraag of opmerking..."
                value={questionForm.message}
                onChange={(e) => setQuestionForm({...questionForm, message: e.target.value})}
                rows={4}
                className="question-textarea"
              />
              
              <div className="question-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={questionForm.isUrgent}
                    onChange={(e) => setQuestionForm({...questionForm, isUrgent: e.target.checked})}
                  />
                  <span>🔴 Spoedgeval (binnen 24u reactie)</span>
                </label>
              </div>
              
              <button
                onClick={handleAskQuestion}
                disabled={!questionForm.subject.trim() || !questionForm.message.trim()}
                className="btn-send-question"
              >
                📨 Vraag versturen
              </button>
            </div>
          </div>
        </div>

        {/* Rechter kolom: Recente activiteiten & Milestones */}
        <div className="right-column">
          {/* Recent Activity Card */}
          <div className="card activity-card">
            <div className="card-header">
              <h3>Recente Activiteiten</h3>
              <button className="btn-view-all" onClick={() => setActiveTab('communication')}>
                Alles bekijken
              </button>
            </div>
            
            <div className="activity-list">
              {projectData.recent_activities && projectData.recent_activities.length > 0 ? (
                projectData.recent_activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-icon">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      <p>{activity.description}</p>
                      <span className="activity-time">
                        {formatDate(activity.timestamp, true)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-activities">
                  <p>Nog geen recente activiteiten</p>
                </div>
              )}
            </div>
          </div>

          {/* Milestones Card */}
          <div className="card milestones-card">
            <div className="card-header">
              <h3>Komende Milestones</h3>
              <button className="btn-view-all" onClick={() => setActiveTab('timeline')}>
                Volledige planning
              </button>
            </div>
            
            <div className="milestones-list">
              {timeline?.milestones && timeline.milestones.length > 0 ? (
                timeline.milestones
                  .filter(milestone => milestone.status === 'pending')
                  .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                  .slice(0, 4)
                  .map((milestone, index) => (
                    <div key={milestone.id} className="milestone-item">
                      <div className="milestone-status">
                        <div className={`status-dot ${getMilestoneStatusClass(milestone)}`}></div>
                      </div>
                      <div className="milestone-content">
                        <h4>{milestone.title}</h4>
                        <p>{milestone.description}</p>
                        <div className="milestone-meta">
                          <span className="milestone-date">
                            📅 {formatDate(milestone.due_date)}
                          </span>
                          {milestone.weight && (
                            <span className="milestone-weight">
                              ⚖️ Gewicht: {milestone.weight}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="no-milestones">
                  <p>Geen komende milestones</p>
                </div>
              )}
            </div>
            
            {timeline?.currentPhase && (
              <div className="current-phase">
                <h4>Huidige projectfase:</h4>
                <div className="phase-indicator">
                  <span className={`phase-badge phase-${timeline.currentPhase}`}>
                    {getPhaseLabel(timeline.currentPhase)}
                  </span>
                  <div className="phase-progress">
                    <div className="phase-bar">
                      <div 
                        className="phase-fill" 
                        style={{ width: `${calculatePhaseProgress(timeline.currentPhase, projectData.progress)}%` }}
                      ></div>
                    </div>
                    <span>{calculatePhaseProgress(timeline.currentPhase, projectData.progress)}% van fase</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Documents Card */}
          <div className="card documents-card">
            <div className="card-header">
              <h3>Recente Documenten</h3>
              <button className="btn-view-all" onClick={() => setActiveTab('documents')}>
                Alle documenten
              </button>
            </div>
            
            <div className="documents-list">
              {projectData.documents && projectData.documents.length > 0 ? (
                projectData.documents.slice(0, 3).map((document, index) => (
                  <div key={document.id} className="document-item">
                    <div className="document-icon">
                      {getDocumentIcon(document.type)}
                    </div>
                    <div className="document-content">
                      <h4>{document.title}</h4>
                      <p>
                        {document.type} • {formatFileSize(document.file_size)} • 
                        {formatDate(document.created_at, true)}
                      </p>
                      <div className="document-actions">
                        <a 
                          href={document.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-view-document"
                        >
                          👁️ Bekijken
                        </a>
                        <a 
                          href={document.file_url} 
                          download
                          className="btn-download-document"
                        >
                          📥 Downloaden
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-documents">
                  <p>Nog geen documenten geüpload</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Stats Row */}
      <div className="bottom-stats-row">
        <div className="stats-card">
          <h4>Meerwerk Overzicht</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">In afwachting:</span>
              <span className="stat-value">{stats?.extraWork?.byStatus?.pending || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Offerte beschikbaar:</span>
              <span className="stat-value">{stats?.extraWork?.byStatus?.quote_provided || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Goedgekeurd:</span>
              <span className="stat-value">{stats?.extraWork?.byStatus?.quote_approved || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">In uitvoering:</span>
              <span className="stat-value">{stats?.extraWork?.byStatus?.in_progress || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Voltooid:</span>
              <span className="stat-value">{stats?.extraWork?.byStatus?.completed || 0}</span>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <h4>Documenten Overzicht</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Contracten:</span>
              <span className="stat-value">{stats?.documents?.byType?.contract || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Tekeningen:</span>
              <span className="stat-value">{stats?.documents?.byType?.drawing || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Rapporten:</span>
              <span className="stat-value">{stats?.documents?.byType?.report || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Foto's:</span>
              <span className="stat-value">{stats?.documents?.byType?.photo || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Gedeeld met u:</span>
              <span className="stat-value">{stats?.documents?.sharedWithClients || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SUPER_ADMIN Debug Panel (alleen in development of voor SUPER_ADMIN) */}
      {(process.env.NODE_ENV === 'development' || isSuperAdmin) && (
        <div className="super-admin-panel">
          <div className="admin-panel-header">
            <h3>🚀 SUPER_ADMIN Debug Panel</h3>
            <button 
              onClick={() => setActiveTab('admin')}
              className="btn-admin-panel"
            >
              Volledig Admin Panel
            </button>
          </div>
          
          <div className="admin-debug-info">
            <div className="debug-section">
              <h4>Project Data</h4>
              <pre>{JSON.stringify(projectData, null, 2)}</pre>
            </div>
            
            <div className="debug-section">
              <h4>Statistics</h4>
              <pre>{JSON.stringify(stats, null, 2)}</pre>
            </div>
            
            <div className="admin-actions">
              <button 
                onClick={() => window.open(`/admin/projects/${projectId}/edit`, '_blank')}
                className="btn-admin-edit"
              >
                ✏️ Project Bewerken
              </button>
              <button 
                onClick={() => window.open(`/admin/projects/${projectId}/users`, '_blank')}
                className="btn-admin-users"
              >
                👥 Gebruikers Beheren
              </button>
              <button 
                onClick={() => window.open(`/admin/audit?project=${projectId}`, '_blank')}
                className="btn-admin-audit"
              >
                📊 Audit Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getStatusLabel = (status) => {
  const labels = {
    'planning': 'Planning',
    'preparation': 'Voorbereiding',
    'execution': 'Uitvoering',
    'completion': 'Afronding',
    'on_hold': 'Gepauzeerd',
    'completed': 'Voltooid',
    'cancelled': 'Geannuleerd'
  };
  return labels[status] || status;
};

const getActivityIcon = (type) => {
  const icons = {
    'document_uploaded': '📄',
    'extra_work_pending': '📋',
    'extra_work_quote_provided': '💰',
    'extra_work_quote_approved': '✅',
    'extra_work_in_progress': '🚧',
    'extra_work_completed': '🏁',
    'message_sent': '💬',
    'contract_signed': '📝',
    'milestone_completed': '🎯'
  };
  return icons[type] || '🔔';
};

const getMilestoneStatusClass = (milestone) => {
  const now = new Date();
  const dueDate = new Date(milestone.due_date);
  
  if (milestone.status === 'completed') return 'completed';
  if (dueDate < now) return 'overdue';
  if (dueDate < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) return 'upcoming';
  return 'pending';
};

const getPhaseLabel = (phase) => {
  const labels = {
    'planning': 'Planning',
    'preparation': 'Voorbereiding',
    'execution': 'Uitvoering',
    'completion': 'Afronding'
  };
  return labels[phase] || phase;
};

const calculatePhaseProgress = (phase, overallProgress) => {
  const phaseRanges = {
    'planning': { min: 0, max: 25 },
    'preparation': { min: 26, max: 50 },
    'execution': { min: 51, max: 85 },
    'completion': { min: 86, max: 100 }
  };
  
  const range = phaseRanges[phase];
  if (!range) return 0;
  
  const phaseWidth = range.max - range.min;
  const progressInPhase = Math.max(0, Math.min(100, overallProgress) - range.min);
  
  return Math.round((progressInPhase / phaseWidth) * 100);
};

const getDocumentIcon = (type) => {
  const icons = {
    'contract': '📝',
    'drawing': '📐',
    'report': '📊',
    'photo': '📷',
    'other': '📄'
  };
  return icons[type] || '📄';
};

export default ProjectOverview;
