// Frontend/pages/projectportaal/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  fetchProjectData, 
  postClientAction,
  subscribeToProjectUpdates,
  unsubscribeFromProjectUpdates
} from '../../services/api';
import { 
  ProjectOverview, 
  ContractSection, 
  DrawingsSection, 
  DeliverySection,
  ExtraWorkSection,
  CommunicationSection,
  ReportingSection,
  LoadingSpinner,
  ErrorDisplay,
  PortalHeader,
  MobileNavigation,
  DesktopSidebar,
  ExportDossierButton
} from './components';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { auditLog } from '../../utils/auditLogger';
import AdminLayout from '../../components/Layout/AdminLayout';
import './ProjectPortaal.css';

/**
 * Hoofdcomponent voor het Opdrachtgever Projectportaal
 * @component
 */
const ProjectPortaal = () => {
  // ==================== HOOKS & STATE ====================
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { clientToken, validateAccess } = useAuth();
  const { showNotification, notifyClient } = useNotifications();
  
  const [projectData, setProjectData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');

  // ==================== EFFECTS ====================
  
  // 1. Initial project data load with authentication
  useEffect(() => {
    let isMounted = true;
    
    const loadProjectData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setConnectionStatus('connecting');
      
      try {
        // Validate client access to this specific project
        const hasAccess = await validateAccess(projectId);
        if (!hasAccess) {
          throw new Error('Geen toegang tot dit project');
        }
        
        // Fetch complete project data for client view
        const data = await fetchProjectData(projectId, {
          include: [
            'overview',
            'contracts',
            'drawings',
            'delivery',
            'extraWork',
            'communication',
            'reports',
            'settings'
          ],
          clientView: true, // Flag to filter internal data
          token: clientToken
        });
        
        if (isMounted) {
          setProjectData(data);
          setLastUpdate(new Date().toISOString());
          setConnectionStatus('connected');
          
          // Log portal access
          await auditLog('PORTAL_ACCESS', {
            projectId,
            clientId: data.clientId,
            section: 'overview'
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Project load error:', err);
          
          if (err.response?.status === 403) {
            setError('U heeft geen toegang tot dit projectportaal. Controleer de link of neem contact op met de projectleider.');
            setConnectionStatus('unauthorized');
          } else if (err.response?.status === 404) {
            setError('Project niet gevonden. Het project kan zijn afgerond of gearchiveerd.');
            setConnectionStatus('not_found');
          } else {
            setError(`Fout bij laden project: ${err.message}`);
            setConnectionStatus('error');
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadProjectData();
    
    return () => {
      isMounted = false;
    };
  }, [projectId, clientToken, validateAccess]);

  // 2. Real-time updates subscription
  useEffect(() => {
    if (!projectData || connectionStatus !== 'connected') return;
    
    const handleUpdate = (update) => {
      setProjectData(prev => ({
        ...prev,
        ...update.payload,
        lastUpdated: update.timestamp
      }));
      setLastUpdate(update.timestamp);
      
      // Show notification for important updates
      if (update.type === 'EXTRA_WORK_QUOTE_READY') {
        showNotification({
          type: 'info',
          title: 'Nieuwe meerwerkofferte',
          message: 'Er is een nieuwe offerte gereed voor uw goedkeuring',
          action: () => setActiveSection('extraWork')
        });
      }
      
      // Notify client if they're not on relevant section
      if (update.important && activeSection !== update.relevantSection) {
        notifyClient(update);
      }
    };
    
    const subscriptionId = subscribeToProjectUpdates(projectId, handleUpdate);
    
    return () => {
      unsubscribeFromProjectUpdates(subscriptionId);
    };
  }, [projectId, projectData, connectionStatus, activeSection, showNotification, notifyClient]);

  // 3. Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setConnectionStatus('connected');
      showNotification({
        type: 'success',
        title: 'Verbonden',
        message: 'Projectportaal is gesynchroniseerd',
        duration: 3000
      });
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setConnectionStatus('disconnected');
      showNotification({
        type: 'warning',
        title: 'Offline modus',
        message: 'Sommige functies zijn beperkt',
        duration: 5000
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [showNotification]);

  // 4. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+E for export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        handleExportDossier();
      }
      // Escape to clear errors
      if (e.key === 'Escape' && error) {
        setError(null);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [error]);

  // ==================== CORE FUNCTIONS ====================

  /**
   * Handle client actions (approvals, questions, requests)
   */
  const handleClientAction = useCallback(async (actionType, payload) => {
    try {
      // Validate required fields based on action type
      if (actionType === 'APPROVE_QUOTE' && !payload.quoteId) {
        throw new Error('Offerte-ID is vereist');
      }
      
      // Show loading state
      const actionId = `action_${Date.now()}`;
      showNotification({
        id: actionId,
        type: 'loading',
        title: 'Actie verwerken...',
        message: 'Een moment geduld'
      });
      
      // Execute action via API
      const result = await postClientAction(projectId, actionType, {
        ...payload,
        clientId: projectData.clientId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: await getClientIP() // Utility function needed
      });
      
      // Update local state
      if (result.updatedProject) {
        setProjectData(prev => ({
          ...prev,
          ...result.updatedProject
        }));
      }
      
      // Log successful action
      await auditLog('CLIENT_ACTION', {
        projectId,
        actionType,
        payload: payload,
        result: result,
        clientId: projectData.clientId
      });
      
      // Show success notification
      showNotification({
        type: 'success',
        title: 'Actie voltooid',
        message: getActionSuccessMessage(actionType),
        duration: 5000
      });
      
      // Send real-time update to dashboard
      if (window.WebSocket && window.socket) {
        window.socket.send(JSON.stringify({
          type: 'CLIENT_ACTION_PERFORMED',
          projectId,
          actionType,
          timestamp: new Date().toISOString()
        }));
      }
      
      return result;
      
    } catch (err) {
      console.error('Client action failed:', err);
      
      // Show error notification
      showNotification({
        type: 'error',
        title: 'Actie mislukt',
        message: err.message || 'Er ging iets mis. Probeer het opnieuw.',
        duration: 8000
      });
      
      // Log error
      await auditLog('CLIENT_ACTION_ERROR', {
        projectId,
        actionType,
        error: err.message,
        payload: payload
      });
      
      throw err;
    }
  }, [projectId, projectData, showNotification]);

  /**
   * Export complete project dossier
   */
  const handleExportDossier = useCallback(async () => {
    try {
      const exportData = {
        projectId,
        include: [
          'contracts',
          'drawings',
          'delivery_documents',
          'extra_work_quotes',
          'communication_logs',
          'reports',
          'approvals'
        ],
        format: 'zip', // Could also be 'pdf' or 'combined_pdf'
        timestamp: new Date().toISOString()
      };
      
      const result = await handleClientAction('EXPORT_PROJECT_DOSSIER', exportData);
      
      // Trigger download
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      
    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [projectId, handleClientAction]);

  /**
   * Section change handler with analytics
   */
  const handleSectionChange = useCallback(async (sectionId) => {
    const prevSection = activeSection;
    setActiveSection(sectionId);
    
    // Track section views
    await auditLog('PORTAL_SECTION_VIEW', {
      projectId,
      fromSection: prevSection,
      toSection: sectionId,
      duration: calculateSectionDuration(prevSection) // Utility function needed
    });
    
    // Update URL without page reload
    window.history.replaceState(
      {},
      '',
      `/projectportaal/${projectId}?section=${sectionId}`
    );
  }, [activeSection, projectId]);

  // ==================== RENDER LOGIC ====================

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="portal-loading-container">
          <LoadingSpinner 
            size="large"
            message={`Portaal laden voor project ${projectId}`}
            subMessage="Dit kan even duren bij de eerste keer"
          />
          <div className="connection-status">
            <span className={`status-dot ${connectionStatus}`}></span>
            {connectionStatus === 'connecting' && 'Verbinding maken...'}
            {connectionStatus === 'authorizing' && 'Toegang controleren...'}
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <ErrorDisplay 
          error={error}
          projectId={projectId}
          onRetry={() => window.location.reload()}
          onContact={() => handleClientAction('REQUEST_SUPPORT', { issue: error })}
        />
      </AdminLayout>
    );
  }

  // No data state
  if (!projectData) {
    return (
      <AdminLayout>
        <div className="no-data-container">
          <h2>Geen projectgegevens beschikbaar</h2>
          <p>Het project kan zijn gearchiveerd of verwijderd.</p>
          <button 
            className="btn-primary"
            onClick={() => navigate('/')}
          >
            Terug naar homepage
          </button>
        </div>
      </AdminLayout>
    );
  }

  // ==================== MAIN RENDER ====================
  return (
    <AdminLayout>
      <div className={`project-portal ${isOffline ? 'offline-mode' : ''}`}>
        {/* Connection Status Banner */}
        {isOffline && (
          <div className="offline-banner">
            <span className="offline-icon">⚠️</span>
            Offline modus - Beperkte functionaliteit
          </div>
        )}
        
        {/* Portal Header */}
        <PortalHeader 
          projectName={projectData.name}
          projectStatus={projectData.status}
          lastUpdate={lastUpdate}
          clientName={projectData.clientName}
          onExport={handleExportDossier}
        />
        
        {/* Mobile Navigation */}
        <MobileNavigation
          sections={[
            { id: 'overview', label: 'Overzicht', icon: '📊' },
            { id: 'contract', label: 'Contract', icon: '📄' },
            { id: 'drawings', label: 'Tekeningen', icon: '📐' },
            { id: 'delivery', label: 'Oplevering', icon: '✅' },
            { id: 'extraWork', label: 'Meerwerk', icon: '🔧' },
            { id: 'communication', label: 'Berichten', icon: '💬' },
            { id: 'reports', label: 'Rapportages', icon: '📈' }
          ]}
          activeSection={activeSection}
          onChangeSection={handleSectionChange}
          hasNewMessages={projectData.communication?.unreadCount > 0}
          hasPendingApprovals={projectData.extraWork?.pendingQuotes > 0}
        />
        
        <div className="portal-content-wrapper">
          {/* Desktop Sidebar */}
          <DesktopSidebar
            projectData={projectData}
            activeSection={activeSection}
            onChangeSection={handleSectionChange}
            onExport={handleExportDossier}
            onLogout={() => {
              handleClientAction('LOGOUT', {});
              navigate('/logout');
            }}
          />
          
          {/* Main Content Area */}
          <main className="portal-main-content" id="portal-main-content">
            {/* Section Router */}
            {activeSection === 'overview' && (
              <ProjectOverview 
                data={projectData.overview}
                onAskQuestion={(subject, message) => 
                  handleClientAction('ASK_QUESTION', { subject, message })
                }
                onRequestMeeting={() => 
                  handleClientAction('REQUEST_MEETING', {})
                }
              />
            )}
            
            {activeSection === 'contract' && (
              <ContractSection 
                documents={projectData.contracts}
                onConfirmAgreement={(docId, version) => 
                  handleClientAction('CONFIRM_CONTRACT', { 
                    documentId: docId,
                    version: version
                  })
                }
                onRequestClarification={(docId, question) => 
                  handleClientAction('REQUEST_CLARIFICATION', {
                    documentId: docId,
                    question: question
                  })
                }
              />
            )}
            
            {activeSection === 'drawings' && (
              <DrawingsSection 
                drawings={projectData.drawings}
                onRequestRevision={(drawingId, reason) => 
                  handleClientAction('REQUEST_DRAWING_REVISION', {
                    drawingId,
                    reason
                  })
                }
                onView3DModel={(modelId) => 
                  handleClientAction('VIEW_3D_MODEL', { modelId })
                }
              />
            )}
            
            {activeSection === 'delivery' && (
              <DeliverySection 
                deliveryData={projectData.delivery}
                onConfirmDelivery={(pointId, notes) => 
                  handleClientAction('CONFIRM_DELIVERY_POINT', { 
                    deliveryPointId: pointId,
                    clientNotes: notes
                  })
                }
                onReportIssue={(pointId, issue) => 
                  handleClientAction('REPORT_DELIVERY_ISSUE', {
                    pointId,
                    issue
                  })
                }
              />
            )}
            
            {activeSection === 'extraWork' && (
              <ExtraWorkSection 
                requests={projectData.extraWork}
                onRequestExtraWork={(requestData) => 
                  handleClientAction('REQUEST_EXTRA_WORK', {
                    ...requestData,
                    includeDrawings: true,
                    include3D: requestData.type === 'aesthetic'
                  })
                }
                onApproveQuote={(quoteId, conditions) => 
                  handleClientAction('APPROVE_EXTRA_WORK_QUOTE', { 
                    quoteId,
                    conditions,
                    legalConsent: true
                  })
                }
                onRequestQuoteRevision={(quoteId, changes) => 
                  handleClientAction('REQUEST_QUOTE_REVISION', {
                    quoteId,
                    requestedChanges: changes
                  })
                }
                onDownloadQuote={(quoteId) => 
                  handleClientAction('DOWNLOAD_QUOTE', { quoteId })
                }
              />
            )}
            
            {activeSection === 'communication' && (
              <CommunicationSection 
                logs={projectData.communication}
                onNewMessage={(message, attachments) => 
                  handleClientAction('SEND_MESSAGE', { 
                    message,
                    attachments,
                    channel: 'portal'
                  })
                }
                onMarkAsRead={(messageIds) => 
                  handleClientAction('MARK_MESSAGES_READ', { messageIds })
                }
                onExportConversation={() => 
                  handleClientAction('EXPORT_CONVERSATION', {})
                }
              />
            )}
            
            {activeSection === 'reports' && (
              <ReportingSection 
                reports={projectData.reports}
                onGenerateCustomReport={(params) => 
                  handleClientAction('GENERATE_CUSTOM_REPORT', params)
                }
                onDownloadReport={(reportId, format) => 
                  handleClientAction('DOWNLOAD_REPORT', { reportId, format })
                }
                onSubscribeReport={(reportId, frequency) => 
                  handleClientAction('SUBSCRIBE_REPORT', { reportId, frequency })
                }
              />
            )}
          </main>
        </div>
        
        {/* Global Action Buttons (Floating) */}
        <div className="floating-actions">
          <ExportDossierButton 
            onExport={handleExportDossier}
            isProcessing={false}
          />
          
          <button 
            className="fab-question"
            onClick={() => handleClientAction('QUICK_QUESTION', {})}
            title="Vraag stellen"
          >
            ❓
          </button>
          
          <button 
            className="fab-print"
            onClick={() => window.print()}
            title="Huidige pagina printen"
          >
            🖨️
          </button>
        </div>
        
        {/* Footer with legal info */}
        <footer className="portal-footer">
          <div className="footer-content">
            <span>Projectportaal v1.0 • {projectData.projectCode}</span>
            <span>Laatste synchronisatie: {new Date(lastUpdate).toLocaleTimeString()}</span>
            <span className="legal-disclaimer">
              Alle acties worden juridisch vastgelegd • 
              <button 
                className="btn-legal"
                onClick={() => handleClientAction('VIEW_LEGAL_DISCLAIMER', {})}
              >
                Privacy & Voorwaarden
              </button>
            </span>
          </div>
        </footer>
      </div>
    </AdminLayout>
  );
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get client IP address (simplified)
 */
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'unknown';
  }
};

/**
 * Calculate time spent in section
 */
const calculateSectionDuration = (sectionId) => {
  const startTime = sessionStorage.getItem(`section_start_${sectionId}`);
  if (startTime) {
    return Date.now() - parseInt(startTime);
  }
  return 0;
};

/**
 * Get success message for action type
 */
const getActionSuccessMessage = (actionType) => {
  const messages = {
    'APPROVE_QUOTE': 'Offerte succesvol goedgekeurd',
    'ASK_QUESTION': 'Vraag succesvol verstuurd',
    'CONFIRM_CONTRACT': 'Contract bevestigd',
    'REQUEST_EXTRA_WORK': 'Meerwerkaanvraag ingediend',
    'SEND_MESSAGE': 'Bericht verzonden',
    'EXPORT_PROJECT_DOSSIER': 'Export gestart'
  };
  return messages[actionType] || 'Actie voltooid';
};

// ==================== EXPORT ====================

export default ProjectPortaal;
