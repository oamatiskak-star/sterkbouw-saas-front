// Frontend/pages/projectportaal/index.js
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Layout,
  Card,
  Row,
  Col,
  Button,
  Space,
  Alert,
  Typography,
  Spin,
  Tag,
  Badge,
  Breadcrumb,
  Divider,
  Statistic,
  Progress,
  Tabs,
  message,
  Result
} from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ExportOutlined,
  MessageOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  PrinterOutlined,
  QuestionCircleOutlined,
  CloudUploadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// API Services
import { fetchProjectData, postClientAction } from '../../services/api';

// Components
import AdminLayout from '../../components/Layout/AdminLayout';

// Utils
import { auditLog } from '../../utils/auditLogger';

// Importeer sectie componenten
const ProjectOverview = React.lazy(() => import('./components/ProjectOverview'));
const ContractSection = React.lazy(() => import('./components/ContractSection'));
const DrawingsSection = React.lazy(() => import('./components/DrawingsSection'));
const DeliverySection = React.lazy(() => import('./components/DeliverySection'));
const ExtraWorkSection = React.lazy(() => import('./components/ExtraWorkSection'));
const CommunicationSection = React.lazy(() => import('./components/CommunicationSection'));
const ReportingSection = React.lazy(() => import('./components/ReportingSection'));

const { Content } = Layout;
const { Title, Text } = Typography;

const ProjectPortaal = () => {
  // ==================== HOOKS ====================
  const { projectId } = useParams();
  const navigate = useNavigate();

  // ==================== STATE ====================
  const [projectData, setProjectData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // ==================== SIDEBAR CONFIG ====================
  const sidebarMenuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      path: '/dashboard'
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projecten',
      path: '/projects'
    },
    {
      key: 'project-portal',
      icon: <ProjectOutlined />,
      label: 'Project Portaal',
      children: [
        {
          key: 'overview',
          icon: <HomeOutlined />,
          label: 'Overzicht',
          path: `/projectportaal/${projectId}?section=overview`
        },
        {
          key: 'contract',
          icon: <FileTextOutlined />,
          label: 'Contract',
          path: `/projectportaal/${projectId}?section=contract`
        },
        {
          key: 'drawings',
          icon: <FileTextOutlined />,
          label: 'Tekeningen',
          path: `/projectportaal/${projectId}?section=drawings`
        },
        {
          key: 'delivery',
          icon: <CheckCircleOutlined />,
          label: 'Oplevering',
          path: `/projectportaal/${projectId}?section=delivery`
        },
        {
          key: 'extraWork',
          icon: <WarningOutlined />,
          label: 'Meerwerk',
          path: `/projectportaal/${projectId}?section=extraWork`
        },
        {
          key: 'communication',
          icon: <MessageOutlined />,
          label: 'Berichten',
          path: `/projectportaal/${projectId}?section=communication`
        },
        {
          key: 'reports',
          icon: <FileTextOutlined />,
          label: 'Rapportages',
          path: `/projectportaal/${projectId}?section=reports`
        }
      ]
    }
  ];

  // ==================== EFFECTS ====================
  
  // 1. Load project data
  useEffect(() => {
    let isMounted = true;

    const loadProjectData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      try {
        // Fetch project data
        const data = await fetchProjectData(projectId, {
          include: ['overview', 'contracts', 'drawings', 'delivery', 'extraWork', 'communication', 'reports'],
          clientView: true
        });

        if (isMounted) {
          setProjectData(data);
          setLastUpdate(new Date().toISOString());
          
          // Log access
          await auditLog('PORTAL_ACCESS', {
            projectId,
            clientId: data.clientId,
            section: activeSection
          });
        }
      } catch (err) {
        if (isMounted) {
          console.error('Project load error:', err);
          
          if (err.response?.status === 403) {
            setError('U heeft geen toegang tot dit projectportaal.');
          } else if (err.response?.status === 404) {
            setError('Project niet gevonden.');
          } else {
            setError('Fout bij laden project.');
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
  }, [projectId, activeSection]);

  // 2. Online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      message.success('Verbonden - Projectportaal is gesynchroniseerd');
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      message.warning('Offline modus - Sommige functies zijn beperkt');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ==================== FUNCTIES ====================

  /**
   * Client actie uitvoeren
   */
  const handleClientAction = useCallback(async (actionType, payload) => {
    try {
      message.loading({ content: 'Actie verwerken...', key: 'action', duration: 0 });

      // API call
      const result = await postClientAction(projectId, actionType, {
        ...payload,
        timestamp: new Date().toISOString()
      });

      // Update state
      if (result.updatedProject) {
        setProjectData(prev => ({
          ...prev,
          ...result.updatedProject
        }));
      }

      // Log
      await auditLog('CLIENT_ACTION', {
        projectId,
        actionType,
        payload
      });

      // Success melding
      message.success({ content: getActionSuccessMessage(actionType), key: 'action' });

      return result;

    } catch (err) {
      console.error('Actie mislukt:', err);
      message.error({ content: 'Actie mislukt', key: 'action' });
      throw err;
    }
  }, [projectId]);

  /**
   * Export projectdossier
   */
  const handleExportDossier = useCallback(async () => {
    try {
      message.loading({ content: 'Export voorbereiden...', key: 'export' });
      
      const result = await handleClientAction('EXPORT_DOSSIER', {
        projectId,
        format: 'zip'
      });
      
      if (result?.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
        message.success({ content: 'Export voltooid', key: 'export' });
      }
      
    } catch (err) {
      console.error('Export mislukt:', err);
      message.error({ content: 'Export mislukt', key: 'export' });
    }
  }, [projectId, handleClientAction]);

  /**
   * Sectie wijzigen
   */
  const handleSectionChange = useCallback((sectionKey) => {
    setActiveSection(sectionKey);
    navigate(`/projectportaal/${projectId}?section=${sectionKey}`, { replace: true });
  }, [projectId, navigate]);

  /**
   * Project synchroniseren
   */
  const syncProject = async () => {
    setIsSyncing(true);
    try {
      const data = await fetchProjectData(projectId, {
        clientView: true
      });
      
      setProjectData(data);
      setLastUpdate(new Date().toISOString());
      
      message.success('Projectgegevens zijn bijgewerkt');
    } catch (err) {
      console.error('Sync mislukt:', err);
      message.error('Synchronisatie mislukt');
    } finally {
      setIsSyncing(false);
    }
  };

  // ==================== RENDER LOGICA ====================

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout sidebarMenuItems={sidebarMenuItems}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh' 
        }}>
          <Spin size="large" tip="Projectportaal laden..." />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout sidebarMenuItems={sidebarMenuItems}>
        <Content style={{ padding: 24 }}>
          <Result
            status="error"
            title={error}
            extra={[
              <Button key="retry" type="primary" onClick={() => window.location.reload()}>
                Opnieuw proberen
              </Button>,
              <Button key="home" onClick={() => navigate('/')}>
                Naar dashboard
              </Button>
            ]}
          />
        </Content>
      </AdminLayout>
    );
  }

  // No data
  if (!projectData) {
    return (
      <AdminLayout sidebarMenuItems={sidebarMenuItems}>
        <Content style={{ padding: 24 }}>
          <Card>
            <Title level={3}>Geen projectgegevens</Title>
            <Button type="primary" onClick={() => navigate('/')}>
              Terug naar dashboard
            </Button>
          </Card>
        </Content>
      </AdminLayout>
    );
  }

  // ==================== HOOFD RENDER ====================
  return (
    <AdminLayout 
      sidebarMenuItems={sidebarMenuItems}
      extraHeaderContent={
        <Space>
          {!isOnline && <Tag color="orange">Offline</Tag>}
          <Button 
            icon={<ReloadOutlined spin={isSyncing} />} 
            onClick={syncProject}
            size="small"
            title="Synchroniseren"
          />
          <Button 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={handleExportDossier}
            size="small"
          >
            Exporteren
          </Button>
        </Space>
      }
    >
      {/* Offline waarschuwing */}
      {!isOnline && (
        <Alert
          message="Offline modus"
          description="Sommige functies zijn beperkt. Controleer uw internetverbinding."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Breadcrumb */}
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Button type="link" onClick={() => navigate('/')} icon={<HomeOutlined />}>
            Dashboard
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Button type="link" onClick={() => navigate('/projects')}>
            Projecten
          </Button>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{projectData.name}</Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Project header */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}>
                {projectData.name}
                <Tag color={getStatusColor(projectData.status)} style={{ marginLeft: 8 }}>
                  {projectData.status}
                </Tag>
              </Title>
              <Space split={<Divider type="vertical" />}>
                <Text type="secondary">
                  <ProjectOutlined /> {projectData.projectCode}
                </Text>
                {projectData.location && (
                  <Text type="secondary">
                    <EnvironmentOutlined /> {projectData.location}
                  </Text>
                )}
                {projectData.startDate && (
                  <Text type="secondary">
                    <CalendarOutlined /> {dayjs(projectData.startDate).format('DD-MM-YYYY')}
                  </Text>
                )}
              </Space>
            </Space>
          </Col>
          <Col>
            <Statistic title="Voortgang" value={projectData.progress || 0} suffix="%" />
            <Progress percent={projectData.progress || 0} />
          </Col>
        </Row>
      </Card>
      
      {/* Tabs voor secties */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
        <Tabs
          activeKey={activeSection}
          onChange={handleSectionChange}
          type="card"
          tabBarExtraContent={
            <Space style={{ marginRight: 8 }}>
              <Button 
                icon={<QuestionCircleOutlined />} 
                onClick={() => handleClientAction('ASK_QUESTION', { subject: 'Vraag' })}
                title="Vraag stellen"
              />
              <Button 
                icon={<PrinterOutlined />} 
                onClick={() => window.print()}
                title="Printen"
              />
            </Space>
          }
        >
          <Tabs.TabPane key="overview" tab={<span><HomeOutlined /> Overzicht</span>} />
          <Tabs.TabPane key="contract" tab={<span><FileTextOutlined /> Contract</span>} />
          <Tabs.TabPane key="drawings" tab={<span><FileTextOutlined /> Tekeningen</span>} />
          <Tabs.TabPane key="delivery" tab={<span><CheckCircleOutlined /> Oplevering</span>} />
          <Tabs.TabPane key="extraWork" tab={<span><WarningOutlined /> Meerwerk</span>} />
          <Tabs.TabPane key="communication" tab={
            <span>
              <MessageOutlined /> Berichten
              {projectData.communication?.unreadCount > 0 && (
                <Badge count={projectData.communication.unreadCount} style={{ marginLeft: 8 }} />
              )}
            </span>
          } />
          <Tabs.TabPane key="reports" tab={<span><FileTextOutlined /> Rapportages</span>} />
        </Tabs>
      </Card>
      
      {/* Hoofd content */}
      <Content>
        <React.Suspense fallback={<Spin tip="Sectie laden..." />}>
          {activeSection === 'overview' && (
            <ProjectOverview 
              data={projectData.overview}
              onAskQuestion={() => handleClientAction('ASK_QUESTION', {})}
              onRequestMeeting={() => handleClientAction('REQUEST_MEETING', {})}
            />
          )}
          
          {activeSection === 'contract' && (
            <ContractSection 
              documents={projectData.contracts}
              onConfirmAgreement={(docId) => 
                handleClientAction('CONFIRM_CONTRACT', { documentId: docId })
              }
            />
          )}
          
          {activeSection === 'drawings' && (
            <DrawingsSection 
              drawings={projectData.drawings}
              onRequestRevision={(drawingId) => 
                handleClientAction('REQUEST_REVISION', { drawingId })
              }
            />
          )}
          
          {activeSection === 'delivery' && (
            <DeliverySection 
              deliveryData={projectData.delivery}
              onConfirmDelivery={(pointId) => 
                handleClientAction('CONFIRM_DELIVERY', { deliveryPointId: pointId })
              }
            />
          )}
          
          {activeSection === 'extraWork' && (
            <ExtraWorkSection 
              requests={projectData.extraWork}
              onApproveQuote={(quoteId) => 
                handleClientAction('APPROVE_QUOTE', { quoteId })
              }
            />
          )}
          
          {activeSection === 'communication' && (
            <CommunicationSection 
              logs={projectData.communication}
              onNewMessage={(message) => 
                handleClientAction('SEND_MESSAGE', { message })
              }
            />
          )}
          
          {activeSection === 'reports' && (
            <ReportingSection 
              reports={projectData.reports}
              onDownloadReport={(reportId) => 
                handleClientAction('DOWNLOAD_REPORT', { reportId })
              }
            />
          )}
        </React.Suspense>
      </Content>
    </AdminLayout>
  );
};

// ==================== HELPER FUNCTIES ====================

const getStatusColor = (status) => {
  if (!status) return 'default';
  
  const statusLower = status.toLowerCase();
  if (statusLower.includes('actief') || statusLower.includes('lopend')) return 'green';
  if (statusLower.includes('concept')) return 'orange';
  if (statusLower.includes('afgerond')) return 'blue';
  if (statusLower.includes('geannuleerd')) return 'red';
  return 'default';
};

const getActionSuccessMessage = (actionType) => {
  const messages = {
    'CONFIRM_CONTRACT': 'Contract bevestigd',
    'REQUEST_REVISION': 'Revisie aangevraagd',
    'CONFIRM_DELIVERY': 'Oplevering bevestigd',
    'APPROVE_QUOTE': 'Offerte goedgekeurd',
    'SEND_MESSAGE': 'Bericht verzonden',
    'ASK_QUESTION': 'Vraag verzonden',
    'REQUEST_MEETING': 'Meeting aangevraagd',
    'DOWNLOAD_REPORT': 'Download gestart',
    'EXPORT_DOSSIER': 'Export gestart'
  };
  return messages[actionType] || 'Actie voltooid';
};

export default ProjectPortaal;
