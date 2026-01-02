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
  Menu,
  Avatar,
  Progress,
  Tabs,
  Breadcrumb,
  Divider,
  Statistic,
  Tooltip,
  Modal,
  Form,
  Input,
  Upload,
  Select,
  DatePicker,
  TimePicker,
  Radio,
  Checkbox,
  notification,
  Result
} from 'antd';
import {
  DownloadOutlined,
  MessageOutlined,
  PrinterOutlined,
  QuestionCircleOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  BellOutlined,
  FileTextOutlined,
  HomeOutlined,
  LogoutOutlined,
  ProjectOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CloudUploadOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// API Services
import { 
  fetchProjectData, 
  postClientAction,
  subscribeToProjectUpdates,
  unsubscribeFromProjectUpdates
} from '../../services/api';

// Contexts
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

// Components
import AdminLayout from '../../components/Layout/AdminLayout';
import {
  ProjectOverview, 
  ContractSection, 
  DrawingsSection, 
  DeliverySection,
  ExtraWorkSection,
  CommunicationSection,
  ReportingSection
} from './components';

// Utils
import { auditLog } from '../../utils/auditLogger';

// Styles
import './ProjectPortaal.css';

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const ProjectPortaal = () => {
  // ==================== HOOKS ====================
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { clientToken, validateAccess, user } = useAuth();
  const { showNotification } = useNotifications();
  const [api, contextHolder] = notification.useNotification();

  // ==================== STATE ====================
  const [projectData, setProjectData] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Modal states
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  
  // Form refs
  const [uploadForm] = Form.useForm();
  const [meetingForm] = Form.useForm();
  const [exportForm] = Form.useForm();

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
    const controller = new AbortController();

    const loadProjectData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      
      try {
        // Validate access
        const hasAccess = await validateAccess(projectId);
        if (!hasAccess) {
          throw new Error('Geen toegang tot dit project');
        }

        // Fetch project data
        const data = await fetchProjectData(projectId, {
          signal: controller.signal,
          include: [
            'overview',
            'contracts',
            'drawings',
            'delivery',
            'extraWork',
            'communication',
            'reports'
          ],
          clientView: true,
          token: clientToken
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
          if (err.name === 'AbortError') return;
          
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
      controller.abort();
    };
  }, [projectId, clientToken, validateAccess, activeSection]);

  // 2. Real-time updates
  useEffect(() => {
    if (!projectData) return;
    
    const handleUpdate = (update) => {
      setProjectData(prev => ({
        ...prev,
        ...update.payload,
        lastUpdated: update.timestamp
      }));
      setLastUpdate(update.timestamp);
      
      // Show notification
      if (update.type === 'EXTRA_WORK_QUOTE_READY') {
        api.info({
          message: 'Nieuwe meerwerkofferte',
          description: 'Er is een nieuwe offerte gereed voor uw goedkeuring',
          onClick: () => setActiveSection('extraWork')
        });
      }
    };
    
    const subscriptionId = subscribeToProjectUpdates(projectId, handleUpdate);
    
    return () => {
      unsubscribeFromProjectUpdates(subscriptionId);
    };
  }, [projectId, projectData, api]);

  // 3. Online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      api.success({
        message: 'Verbonden',
        description: 'Projectportaal is gesynchroniseerd'
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      api.warning({
        message: 'Offline modus',
        description: 'Sommige functies zijn beperkt'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [api]);

  // ==================== FUNCTIES ====================

  /**
   * Client actie uitvoeren
   */
  const handleClientAction = useCallback(async (actionType, payload) => {
    try {
      // Laad indicator
      const loadingKey = `action_${Date.now()}`;
      api.open({
        key: loadingKey,
        message: 'Actie verwerken...',
        duration: 0
      });

      // API call
      const result = await postClientAction(projectId, actionType, {
        ...payload,
        clientId: projectData?.clientId,
        userId: user?.id,
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
      api.destroy(loadingKey);
      api.success({
        message: 'Actie voltooid',
        description: getActionSuccessMessage(actionType)
      });

      return result;

    } catch (err) {
      console.error('Actie mislukt:', err);
      
      api.error({
        message: 'Actie mislukt',
        description: err.message || 'Er ging iets mis.'
      });

      throw err;
    }
  }, [projectId, projectData, user, api]);

  /**
   * Export projectdossier
   */
  const handleExportDossier = useCallback(async () => {
    try {
      const exportData = {
        projectId,
        include: [
          'contracts',
          'drawings',
          'delivery',
          'extraWork',
          'communication',
          'reports'
        ],
        format: 'zip'
      };
      
      const result = await handleClientAction('EXPORT_DOSSIER', exportData);
      
      if (result?.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      
    } catch (err) {
      console.error('Export mislukt:', err);
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
        clientView: true,
        token: clientToken
      });
      
      setProjectData(data);
      setLastUpdate(new Date().toISOString());
      
      api.success({
        message: 'Gesynchroniseerd',
        description: 'Projectgegevens zijn bijgewerkt'
      });
    } catch (err) {
      console.error('Sync mislukt:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // ==================== MODAL FUNCTIES ====================

  const showUploadModal = () => setUploadModalVisible(true);
  const hideUploadModal = () => {
    setUploadModalVisible(false);
    uploadForm.resetFields();
  };

  const showMeetingModal = () => setMeetingModalVisible(true);
  const hideMeetingModal = () => {
    setMeetingModalVisible(false);
    meetingForm.resetFields();
  };

  const showExportModal = () => setExportModalVisible(true);
  const hideExportModal = () => {
    setExportModalVisible(false);
    exportForm.resetFields();
  };

  // ==================== RENDER LOGICA ====================

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout sidebarMenuItems={sidebarMenuItems}>
        {contextHolder}
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
        {contextHolder}
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
        {contextHolder}
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
          {!isOnline && (
            <Tag color="orange">Offline</Tag>
          )}
          <Tooltip title="Synchroniseren">
            <Button 
              icon={<ReloadOutlined spin={isSyncing} />} 
              onClick={syncProject}
              size="small"
            />
          </Tooltip>
          <Button 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={showExportModal}
            size="small"
          >
            Exporteren
          </Button>
        </Space>
      }
    >
      {contextHolder}
      
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
                <Text type="secondary">
                  <EnvironmentOutlined /> {projectData.location}
                </Text>
                <Text type="secondary">
                  <CalendarOutlined /> {dayjs(projectData.startDate).format('DD-MM-YYYY')}
                </Text>
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
              <Tooltip title="Vraag stellen">
                <Button icon={<QuestionCircleOutlined />} onClick={showMeetingModal} />
              </Tooltip>
              <Tooltip title="Document uploaden">
                <Button icon={<CloudUploadOutlined />} onClick={showUploadModal} />
              </Tooltip>
              <Tooltip title="Printen">
                <Button icon={<PrinterOutlined />} onClick={() => window.print()} />
              </Tooltip>
            </Space>
          }
        >
          <Tabs.TabPane 
            key="overview" 
            tab={
              <span>
                <HomeOutlined /> Overzicht
              </span>
            } 
          />
          <Tabs.TabPane 
            key="contract" 
            tab={
              <span>
                <FileTextOutlined /> Contract
              </span>
            } 
          />
          <Tabs.TabPane 
            key="drawings" 
            tab={
              <span>
                <FileTextOutlined /> Tekeningen
              </span>
            } 
          />
          <Tabs.TabPane 
            key="delivery" 
            tab={
              <span>
                <CheckCircleOutlined /> Oplevering
              </span>
            } 
          />
          <Tabs.TabPane 
            key="extraWork" 
            tab={
              <span>
                <WarningOutlined /> Meerwerk
              </span>
            } 
          />
          <Tabs.TabPane 
            key="communication" 
            tab={
              <span>
                <MessageOutlined /> Berichten
                {projectData.communication?.unreadCount > 0 && (
                  <Badge count={projectData.communication.unreadCount} style={{ marginLeft: 8 }} />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="reports" 
            tab={
              <span>
                <FileTextOutlined /> Rapportages
              </span>
            } 
          />
        </Tabs>
      </Card>
      
      {/* Hoofd content */}
      <Content>
        {activeSection === 'overview' && (
          <ProjectOverview 
            data={projectData.overview}
            onAskQuestion={showMeetingModal}
            onRequestMeeting={showMeetingModal}
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
          />
        )}
        
        {activeSection === 'drawings' && (
          <DrawingsSection 
            drawings={projectData.drawings}
            onRequestRevision={(drawingId, reason) => 
              handleClientAction('REQUEST_REVISION', {
                drawingId,
                reason
              })
            }
          />
        )}
        
        {activeSection === 'delivery' && (
          <DeliverySection 
            deliveryData={projectData.delivery}
            onConfirmDelivery={(pointId, notes) => 
              handleClientAction('CONFIRM_DELIVERY', { 
                deliveryPointId: pointId,
                clientNotes: notes
              })
            }
          />
        )}
        
        {activeSection === 'extraWork' && (
          <ExtraWorkSection 
            requests={projectData.extraWork}
            onApproveQuote={(quoteId, conditions) => 
              handleClientAction('APPROVE_QUOTE', { 
                quoteId,
                conditions
              })
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
      </Content>
      
      {/* Modals */}
      
      {/* Upload Document Modal */}
      <Modal
        title="Document uploaden"
        open={uploadModalVisible}
        onCancel={hideUploadModal}
        footer={null}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await handleClientAction('UPLOAD_DOCUMENT', {
                file: values.file,
                category: values.category,
                description: values.description
              });
              hideUploadModal();
            } catch (err) {
              console.error('Upload mislukt:', err);
            }
          }}
        >
          <Form.Item
            name="file"
            label="Bestand"
            rules={[{ required: true, message: 'Selecteer een bestand' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>Selecteer bestand</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Categorie"
            rules={[{ required: true, message: 'Selecteer categorie' }]}
          >
            <Select placeholder="Selecteer categorie">
              <Option value="contract">Contract</Option>
              <Option value="drawing">Tekening</Option>
              <Option value="photo">Foto</Option>
              <Option value="other">Overig</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Omschrijving"
          >
            <TextArea rows={3} placeholder="Beschrijf het document..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Uploaden
              </Button>
              <Button onClick={hideUploadModal}>
                Annuleren
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Meeting Request Modal */}
      <Modal
        title="Meeting aanvragen"
        open={meetingModalVisible}
        onCancel={hideMeetingModal}
        footer={null}
      >
        <Form
          form={meetingForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await handleClientAction('REQUEST_MEETING', {
                date: values.date.format('YYYY-MM-DD'),
                time: values.time.format('HH:mm'),
                subject: values.subject,
                description: values.description
              });
              hideMeetingModal();
            } catch (err) {
              console.error('Meeting request mislukt:', err);
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Datum"
                rules={[{ required: true, message: 'Selecteer datum' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Tijd"
                rules={[{ required: true, message: 'Selecteer tijd' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="subject"
            label="Onderwerp"
            rules={[{ required: true, message: 'Voer onderwerp in' }]}
          >
            <Input placeholder="Onderwerp van de meeting" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Beschrijving"
          >
            <TextArea rows={4} placeholder="Beschrijf de agendapunten..." />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Aanvragen
              </Button>
              <Button onClick={hideMeetingModal}>
                Annuleren
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      
      {/* Export Modal */}
      <Modal
        title="Project exporteren"
        open={exportModalVisible}
        onCancel={hideExportModal}
        footer={null}
      >
        <Form
          form={exportForm}
          layout="vertical"
          onFinish={(values) => {
            handleExportDossier();
            hideExportModal();
          }}
        >
          <Form.Item
            name="format"
            label="Exportformaat"
            initialValue="zip"
          >
            <Radio.Group>
              <Radio value="zip">ZIP (aanbevolen)</Radio>
              <Radio value="pdf">PDF</Radio>
              <Radio value="excel">Excel</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="include"
            label="Inhoud"
            initialValue="all"
          >
            <Radio.Group>
              <Radio value="all">Volledig dossier</Radio>
              <Radio value="current">Huidige sectie</Radio>
              <Radio value="custom">Selectie</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item>
            <Checkbox>Documenten</Checkbox>
            <Checkbox>Tekeningen</Checkbox>
            <Checkbox>Berichten</Checkbox>
            <Checkbox>Rapportages</Checkbox>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<ExportOutlined />}>
                Exporteren
              </Button>
              <Button onClick={hideExportModal}>
                Annuleren
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
};

// ==================== HELPER FUNCTIES ====================

const getStatusColor = (status) => {
  const colors = {
    'actief': 'green',
    'lopend': 'blue',
    'concept': 'orange',
    'afgerond': 'gray',
    'geannuleerd': 'red'
  };
  return colors[status?.toLowerCase()] || 'default';
};

const getActionSuccessMessage = (actionType) => {
  const messages = {
    'CONFIRM_CONTRACT': 'Contract bevestigd',
    'REQUEST_REVISION': 'Revisie aangevraagd',
    'CONFIRM_DELIVERY': 'Oplevering bevestigd',
    'APPROVE_QUOTE': 'Offerte goedgekeurd',
    'SEND_MESSAGE': 'Bericht verzonden',
    'UPLOAD_DOCUMENT': 'Document geüpload',
    'REQUEST_MEETING': 'Meeting aangevraagd',
    'DOWNLOAD_REPORT': 'Download gestart',
    'EXPORT_DOSSIER': 'Export gestart'
  };
  return messages[actionType] || 'Actie voltooid';
};

export default ProjectPortaal;
