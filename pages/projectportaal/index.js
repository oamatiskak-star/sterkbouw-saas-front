// Frontend/pages/projectportaal/index.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  Dropdown,
  Menu,
  Avatar,
  Progress,
  Tabs,
  Timeline,
  notification,
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
  Checkbox,
  Radio,
  Switch,
  Slider,
  Rate,
  Cascader,
  TreeSelect,
  InputNumber,
  Mentions,
  Transfer,
  UploadButton,
  Drawer,
  List,
  Descriptions,
  Empty,
  Result,
  Steps,
  Timeline as AntTimeline,
  Calendar,
  Carousel,
  Collapse,
  Popover,
  Popconfirm,
  Comment,
  PageHeader,
  Anchor,
  BackTop,
  ConfigProvider,
  theme
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
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  ProjectOutlined,
  TeamOutlined,
  SettingOutlined,
  FileSearchOutlined,
  CalculatorOutlined,
  BarChartOutlined,
  FolderOutlined,
  CloudUploadOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ShareAltOutlined,
  LockOutlined,
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  ReloadOutlined,
  SaveOutlined,
  SearchOutlined,
  FilterOutlined,
  SortAscendingOutlined,
  UploadOutlined,
  PaperClipOutlined,
  LinkOutlined,
  QrcodeOutlined,
  WhatsAppOutlined,
  MailOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  PictureOutlined,
  FilePdfOutlined,
  FileExcelOutlined,
  FileWordOutlined,
  FileZipOutlined,
  FileImageOutlined,
  FileUnknownOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  GlobalOutlined,
  WifiOutlined,
  CloudServerOutlined,
  ApartmentOutlined,
  BuildOutlined,
  CrownOutlined,
  FlagOutlined,
  FireOutlined,
  ThunderboltOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  BankOutlined,
  CarOutlined,
  MedicineBoxOutlined,
  ExperimentOutlined,
  ToolOutlined,
  ControlOutlined,
  GatewayOutlined,
  ClusterOutlined,
  DeploymentUnitOutlined,
  CodepenOutlined,
  CodeOutlined,
  BugOutlined,
  SecurityScanOutlined,
  BlockOutlined,
  ExceptionOutlined,
  StopOutlined,
  SyncOutlined,
  RedoOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  ArrowsAltOutlined,
  ShrinkOutlined,
  ExpandOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignMiddleOutlined,
  VerticalAlignBottomOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  BorderOutlined,
  RadiusUpleftOutlined,
  RadiusUprightOutlined,
  RadiusBottomleftOutlined,
  RadiusBottomrightOutlined,
  BorderInnerOutlined,
  BorderOuterOutlined,
  BorderTopOutlined,
  BorderBottomOutlined,
  BorderLeftOutlined,
  BorderRightOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// API Services
import { 
  fetchProjectData, 
  postClientAction,
  subscribeToProjectUpdates,
  unsubscribeFromProjectUpdates,
  downloadProjectDossier,
  uploadClientDocument,
  sendClientMessage,
  requestProjectMeeting,
  approveExtraWorkQuote,
  rejectExtraWorkQuote,
  confirmDeliveryPoint,
  reportDeliveryIssue,
  requestDrawingRevision,
  generateCustomReport,
  exportProjectReport,
  markMessagesAsRead,
  getUnreadMessagesCount,
  getPendingActions,
  syncProjectData
} from '../../services/api';

// Contexts & Hooks
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { usePermissions } from '../../hooks/usePermissions';
import { useSocket } from '../../hooks/useSocket';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

// Utils
import { auditLog } from '../../utils/auditLogger';
import { formatCurrency } from '../../utils/formatters';
import { downloadFile, exportToPDF, exportToExcel } from '../../utils/exportUtils';
import { validateFileType, validateFileSize } from '../../utils/validation';
import { encryptData, decryptData } from '../../utils/encryption';

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

// Custom Components
import ProjectStatusBadge from '../../components/ProjectStatusBadge';
import ClientAvatar from '../../components/ClientAvatar';
import DocumentViewer from '../../components/DocumentViewer';
import FileUploader from '../../components/FileUploader';
import RealTimeIndicator from '../../components/RealTimeIndicator';
import OfflineBanner from '../../components/OfflineBanner';
import ActionConfirmationModal from '../../components/ActionConfirmationModal';
import LoadingOverlay from '../../components/LoadingOverlay';
import ErrorBoundary from '../../components/ErrorBoundary';

// Styles
import './ProjectPortaal.css';

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Step } = Steps;
const { Panel } = Collapse;

/**
 * Hoofdcomponent voor het Opdrachtgever Projectportaal
 * Geïntegreerd met Sterkbouw Admin sidebar en Ant Design
 */
const ProjectPortaal = () => {
  // ==================== HOOKS & PARAMS ====================
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialSection = queryParams.get('section') || 'overview';
  
  // Authentication & Context
  const { 
    clientToken, 
    validateAccess, 
    user,
    logout,
    refreshToken 
  } = useAuth();
  
  const { showNotification, clearNotifications } = useNotifications();
  const { hasPermission, checkAccess } = usePermissions();
  const { socket, isConnected, sendMessage } = useSocket();
  const [storedSettings, setStoredSettings] = useLocalStorage(`project_${projectId}_settings`, {});
  const isOnline = useOnlineStatus();
  
  // Notification API
  const [api, contextHolder] = notification.useNotification();
  
  // ==================== STATE MANAGEMENT ====================
  const [collapsed, setCollapsed] = useState(false);
  const [projectData, setProjectData] = useState(null);
  const [activeSection, setActiveSection] = useState(initialSection);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [meetingModalVisible, setMeetingModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    title: '',
    content: '',
    onConfirm: null,
    onCancel: null
  });
  
  // Form states
  const [messageForm] = Form.useForm();
  const [meetingForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [reportForm] = Form.useForm();
  const [uploadForm] = Form.useForm();
  
  // ==================== SIDEBAR CONFIGURATION ====================
  // Dit is de Sterkbouw Admin sidebar configuratie
  const sidebarMenuItems = useMemo(() => [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      type: 'item',
      path: '/dashboard'
    },
    {
      key: 'projects',
      icon: <ProjectOutlined />,
      label: 'Projecten',
      type: 'submenu',
      children: [
        {
          key: 'all-projects',
          icon: <ProjectOutlined />,
          label: 'Alle Projecten',
          path: '/projects'
        },
        {
          key: 'active-projects',
          icon: <RocketOutlined />,
          label: 'Actieve Projecten',
          path: '/projects/active'
        },
        {
          key: 'completed-projects',
          icon: <CheckCircleOutlined />,
          label: 'Afgeronde Projecten',
          path: '/projects/completed'
        },
        {
          key: 'archived-projects',
          icon: <FolderOutlined />,
          label: 'Gearchiveerd',
          path: '/projects/archived'
        }
      ]
    },
    {
      key: 'clients',
      icon: <TeamOutlined />,
      label: 'Klanten',
      type: 'item',
      path: '/clients'
    },
    {
      key: 'financial',
      icon: <CalculatorOutlined />,
      label: 'Financieel',
      type: 'submenu',
      children: [
        {
          key: 'invoices',
          icon: <FileTextOutlined />,
          label: 'Facturen',
          path: '/financial/invoices'
        },
        {
          key: 'quotes',
          icon: <FileSearchOutlined />,
          label: 'Offertes',
          path: '/financial/quotes'
        },
        {
          key: 'expenses',
          icon: <MinusOutlined />,
          label: 'Uitgaven',
          path: '/financial/expenses'
        },
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Rapportages',
          path: '/financial/reports'
        }
      ]
    },
    {
      key: 'documents',
      icon: <FolderOutlined />,
      label: 'Documenten',
      type: 'item',
      path: '/documents'
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Instellingen',
      type: 'item',
      path: '/settings'
    },
    // Project-specifieke items voor huidig project
    {
      key: 'project-portal',
      icon: <ProjectOutlined />,
      label: 'Project Portaal',
      type: 'group',
      children: [
        {
          key: 'overview',
          icon: <HomeOutlined />,
          label: (
            <Badge count={projectData?.overview?.newUpdates || 0} offset={[10, 0]}>
              <span>Overzicht</span>
            </Badge>
          ),
          path: `/projectportaal/${projectId}?section=overview`
        },
        {
          key: 'contract',
          icon: <FileTextOutlined />,
          label: (
            <Badge count={projectData?.contracts?.pendingSignatures || 0} offset={[10, 0]}>
              <span>Contract</span>
            </Badge>
          ),
          path: `/projectportaal/${projectId}?section=contract`
        },
        {
          key: 'drawings',
          icon: <FileSearchOutlined />,
          label: (
            <Badge count={projectData?.drawings?.newRevisions || 0} offset={[10, 0]}>
              <span>Tekeningen</span>
            </Badge>
          ),
          path: `/projectportaal/${projectId}?section=drawings`
        },
        {
          key: 'delivery',
          icon: <CheckCircleOutlined />,
          label: (
            <Badge count={projectData?.delivery?.pendingConfirmations || 0} offset={[10, 0]}>
              <span>Oplevering</span>
            </Badge>
          ),
          path: `/projectportaal/${projectId}?section=delivery`
        },
        {
          key: 'extra-work',
          icon: <WarningOutlined />,
          label: (
            <Badge count={projectData?.extraWork?.pendingQuotes || 0} offset={[10, 0]}>
              <span>Meerwerk</span>
            </Badge>
          ),
          path: `/projectportaal/${projectId}?section=extraWork`
        },
        {
          key: 'communication',
          icon: <MessageOutlined />,
          label: (
            <Badge count={projectData?.communication?.unreadCount || 0} offset={[10, 0]}>
              <span>Berichten</span>
            </Badge>
          ),
          path: `/projectportaal/${projectId}?section=communication`
        },
        {
          key: 'reports',
          icon: <BarChartOutlined />,
          label: 'Rapportages',
          path: `/projectportaal/${projectId}?section=reports`
        }
      ]
    }
  ], [projectId, projectData]);

  // ==================== EFFECTS ====================
  
  // 1. Initial project data load
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadProjectData = async () => {
      if (!isMounted) return;
      
      setIsLoading(true);
      setConnectionStatus('connecting');
      
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
            'reports',
            'settings',
            'team',
            'timeline',
            'documents',
            'budget',
            'risks',
            'issues'
          ],
          clientView: true,
          token: clientToken
        });

        if (isMounted) {
          setProjectData(data);
          setLastUpdate(new Date().toISOString());
          setConnectionStatus('connected');
          
          // Log access
          await auditLog('PORTAL_ACCESS', {
            projectId,
            clientId: data.clientId,
            section: activeSection
          });

          // Show welcome notification
          if (data.isFirstVisit) {
            api.success({
              message: `Welkom bij project ${data.name}`,
              description: 'U heeft toegang tot alle projectinformatie',
              duration: 5
            });
          }
        }
      } catch (err) {
        if (isMounted) {
          if (err.name === 'AbortError') {
            console.log('Request cancelled');
            return;
          }
          
          console.error('Project load error:', err);
          
          if (err.response?.status === 403) {
            setError({
              type: 'unauthorized',
              message: 'U heeft geen toegang tot dit projectportaal.',
              details: 'Controleer de link of neem contact op met de projectleider.'
            });
            setConnectionStatus('unauthorized');
          } else if (err.response?.status === 404) {
            setError({
              type: 'not_found',
              message: 'Project niet gevonden.',
              details: 'Het project kan zijn afgerond of gearchiveerd.'
            });
            setConnectionStatus('not_found');
          } else if (err.response?.status === 401) {
            setError({
              type: 'auth_required',
              message: 'Sessie verlopen.',
              details: 'Log opnieuw in om verder te gaan.'
            });
            setConnectionStatus('auth_required');
          } else {
            setError({
              type: 'general',
              message: 'Fout bij laden project',
              details: err.message
            });
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
      controller.abort();
    };
  }, [projectId, clientToken, validateAccess, api, activeSection]);

  // 2. Real-time updates via WebSocket
  useEffect(() => {
    if (!projectData || connectionStatus !== 'connected' || !socket) return;

    const handleSocketMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'PROJECT_UPDATE':
            handleProjectUpdate(data.payload);
            break;
          case 'NEW_MESSAGE':
            handleNewMessage(data.payload);
            break;
          case 'QUOTE_APPROVED':
            handleQuoteUpdate(data.payload);
            break;
          case 'DOCUMENT_UPDATED':
            handleDocumentUpdate(data.payload);
            break;
          case 'DELIVERY_STATUS_CHANGE':
            handleDeliveryUpdate(data.payload);
            break;
          case 'SYSTEM_NOTIFICATION':
            handleSystemNotification(data.payload);
            break;
        }
      } catch (err) {
        console.error('Socket message error:', err);
      }
    };

    const handleProjectUpdate = (update) => {
      setProjectData(prev => ({
        ...prev,
        ...update.data,
        lastUpdated: update.timestamp
      }));
      setLastUpdate(update.timestamp);
      
      // Show notification for important updates
      if (update.important) {
        showUpdateNotification(update);
      }
    };

    const handleNewMessage = (message) => {
      setProjectData(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          messages: [message, ...prev.communication.messages],
          unreadCount: prev.communication.unreadCount + 1
        }
      }));

      if (activeSection !== 'communication') {
        api.info({
          message: 'Nieuw bericht',
          description: `Van: ${message.sender}`,
          onClick: () => setActiveSection('communication'),
          placement: 'bottomRight'
        });
      }
    };

    const showUpdateNotification = (update) => {
      const notifications = {
        'EXTRA_WORK_QUOTE_READY': {
          title: 'Nieuwe meerwerkofferte',
          description: 'Er is een nieuwe offerte gereed voor uw goedkeuring'
        },
        'CONTRACT_UPDATED': {
          title: 'Contract bijgewerkt',
          description: 'Het contract is aangepast, controleer de wijzigingen'
        },
        'DRAWING_APPROVED': {
          title: 'Tekening goedgekeurd',
          description: 'Een tekening is goedgekeurd door de architect'
        },
        'DELIVERY_SCHEDULED': {
          title: 'Oplevering gepland',
          description: 'Er is een nieuwe opleveringsdatum vastgesteld'
        }
      };

      const notif = notifications[update.type];
      if (notif) {
        api.info({
          ...notif,
          duration: 6,
          onClick: () => {
            if (update.relevantSection) {
              setActiveSection(update.relevantSection);
            }
          }
        });
      }
    };

    socket.addEventListener('message', handleSocketMessage);

    // Subscribe to project updates
    if (isConnected) {
      sendMessage({
        type: 'SUBSCRIBE_PROJECT',
        projectId,
        clientId: projectData.clientId
      });
    }

    return () => {
      socket.removeEventListener('message', handleSocketMessage);
      if (isConnected) {
        sendMessage({
          type: 'UNSUBSCRIBE_PROJECT',
          projectId
        });
      }
    };
  }, [projectId, projectData, socket, isConnected, activeSection, api, sendMessage, connectionStatus]);

  // 3. Online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus('connected');
      api.success({
        message: 'Verbonden',
        description: 'Projectportaal is gesynchroniseerd',
        duration: 3
      });
      // Sync data when coming back online
      syncData();
    };

    const handleOffline = () => {
      setConnectionStatus('disconnected');
      api.warning({
        message: 'Offline modus',
        description: 'Sommige functies zijn beperkt',
        duration: 5
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [api]);

  // 4. Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + E: Export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportDossier();
      }
      // Ctrl/Cmd + F: Search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
      // Escape: Close modals/clear errors
      if (e.key === 'Escape') {
        if (error) setError(null);
        if (uploadModalVisible) setUploadModalVisible(false);
        if (meetingModalVisible) setMeetingModalVisible(false);
        if (exportModalVisible) setExportModalVisible(false);
        if (reportModalVisible) setReportModalVisible(false);
        if (drawerVisible) setDrawerVisible(false);
      }
      // Numbers 1-7: Switch sections
      if (e.key >= '1' && e.key <= '7' && !e.ctrlKey && !e.metaKey) {
        const sections = ['overview', 'contract', 'drawings', 'delivery', 'extraWork', 'communication', 'reports'];
        const index = parseInt(e.key) - 1;
        if (sections[index]) {
          e.preventDefault();
          setActiveSection(sections[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [error, uploadModalVisible, meetingModalVisible, exportModalVisible, reportModalVisible, drawerVisible]);

  // ==================== CORE FUNCTIONS ====================

  /**
   * Synchronize project data
   */
  const syncData = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      const updatedData = await syncProjectData(projectId, {
        lastUpdate,
        token: clientToken
      });
      
      setProjectData(prev => ({
        ...prev,
        ...updatedData
      }));
      setLastUpdate(new Date().toISOString());
      
      api.success({
        message: 'Gesynchroniseerd',
        description: 'Projectgegevens zijn bijgewerkt',
        duration: 2
      });
    } catch (err) {
      console.error('Sync failed:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [projectId, lastUpdate, clientToken, isOnline, isSyncing, api]);

  /**
   * Handle client actions with confirmation
   */
  const handleClientAction = useCallback(async (actionType, payload, options = {}) => {
    const {
      confirm = false,
      confirmTitle = 'Bevestig actie',
      confirmContent = 'Weet u zeker dat u deze actie wilt uitvoeren?',
      onSuccess,
      onError
    } = options;

    // If confirmation is required, show modal
    if (confirm) {
      setConfirmModal({
        visible: true,
        title: confirmTitle,
        content: confirmContent,
        onConfirm: async () => {
          try {
            await executeAction(actionType, payload);
            if (onSuccess) onSuccess();
          } catch (err) {
            if (onError) onError(err);
          }
        },
        onCancel: () => {
          setConfirmModal(prev => ({ ...prev, visible: false }));
        }
      });
      return;
    }

    // Execute immediately
    return executeAction(actionType, payload);
  }, [projectId, projectData, api]);

  /**
   * Execute action with loading state and error handling
   */
  const executeAction = useCallback(async (actionType, payload) => {
    const actionId = `action_${Date.now()}`;
    const loadingKey = `${actionType}_${actionId}`;
    
    // Show loading notification
    api.open({
      key: loadingKey,
      message: 'Actie verwerken...',
      description: 'Een moment geduld alstublieft',
      duration: 0,
      icon: <Spin />
    });

    try {
      // Validate required fields
      const validationError = validateAction(actionType, payload);
      if (validationError) {
        throw new Error(validationError);
      }

      // Execute action via API
      const result = await postClientAction(projectId, actionType, {
        ...payload,
        clientId: projectData.clientId,
        userId: user?.id,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ipAddress: await getClientIP()
      });

      // Update local state if needed
      if (result.updatedProject) {
        setProjectData(prev => ({
          ...prev,
          ...result.updatedProject
        }));
      }

      // Log successful action
      await auditLog('CLIENT_ACTION_SUCCESS', {
        projectId,
        actionType,
        payload,
        result,
        clientId: projectData.clientId
      });

      // Show success notification
      api.destroy(loadingKey);
      api.success({
        message: 'Actie voltooid',
        description: getActionSuccessMessage(actionType),
        duration: 4,
        placement: 'bottomRight'
      });

      // Send real-time update
      if (socket && isConnected) {
        sendMessage({
          type: 'CLIENT_ACTION',
          projectId,
          actionType,
          timestamp: new Date().toISOString()
        });
      }

      return result;

    } catch (err) {
      console.error('Action failed:', err);
      
      // Show error notification
      api.destroy(loadingKey);
      api.error({
        message: 'Actie mislukt',
        description: err.message || 'Er ging iets mis. Probeer het opnieuw.',
        duration: 6,
        placement: 'bottomRight'
      });

      // Log error
      await auditLog('CLIENT_ACTION_ERROR', {
        projectId,
        actionType,
        error: err.message,
        payload
      });

      throw err;
    }
  }, [projectId, projectData, user, socket, isConnected, sendMessage, api]);

  /**
   * Validate action payload
   */
  const validateAction = (actionType, payload) => {
    const validations = {
      'APPROVE_QUOTE': () => {
        if (!payload.quoteId) return 'Offerte-ID is vereist';
        if (!payload.conditions) return 'Voorwaarden zijn vereist';
      },
      'SEND_MESSAGE': () => {
        if (!payload.message) return 'Bericht is vereist';
        if (payload.message.length < 5) return 'Bericht is te kort';
      },
      'UPLOAD_DOCUMENT': () => {
        if (!payload.file) return 'Bestand is vereist';
        if (!validateFileType(payload.file)) return 'Bestandstype niet ondersteund';
        if (!validateFileSize(payload.file)) return 'Bestand is te groot';
      },
      'REQUEST_MEETING': () => {
        if (!payload.date) return 'Datum is vereist';
        if (!payload.time) return 'Tijd is vereist';
        if (!payload.subject) return 'Onderwerp is vereist';
      }
    };

    const validator = validations[actionType];
    return validator ? validator() : null;
  };

  /**
   * Export complete project dossier
   */
  const handleExportDossier = useCallback(async (options = {}) => {
    const {
      format = 'zip',
      includeAll = true,
      customSelection = []
    } = options;

    try {
      const exportData = {
        projectId,
        format,
        include: includeAll ? [
          'contracts',
          'drawings',
          'delivery_documents',
          'extra_work_quotes',
          'communication_logs',
          'reports',
          'approvals',
          'meeting_minutes',
          'photos',
          'videos',
          'certificates'
        ] : customSelection,
        timestamp: new Date().toISOString(),
        compression: format === 'zip' ? 'high' : 'none'
      };

      const result = await handleClientAction('EXPORT_PROJECT_DOSSIER', exportData, {
        confirm: true,
        confirmTitle: 'Export projectdossier',
        confirmContent: 'Weet u zeker dat u het volledige projectdossier wilt exporteren? Dit kan even duren.'
      });

      if (result?.downloadUrl) {
        // Open download in new tab
        window.open(result.downloadUrl, '_blank');
        
        // Log export
        await auditLog('DOSSIER_EXPORT', {
          projectId,
          format,
          size: result.fileSize,
          clientId: projectData.clientId
        });
      }

    } catch (err) {
      console.error('Export failed:', err);
    }
  }, [projectId, handleClientAction, projectData]);

  /**
   * Handle section change with analytics
   */
  const handleSectionChange = useCallback(async (sectionKey) => {
    const prevSection = activeSection;
    
    // Update state
    setActiveSection(sectionKey);
    
    // Update URL
    navigate(`/projectportaal/${projectId}?section=${sectionKey}`, { replace: true });
    
    // Track analytics
    await auditLog('PORTAL_SECTION_CHANGE', {
      projectId,
      fromSection: prevSection,
      toSection: sectionKey,
      duration: calculateSectionDuration(prevSection),
      clientId: projectData?.clientId
    });
    
    // Mark messages as read if entering communication section
    if (sectionKey === 'communication' && projectData?.communication?.unreadCount > 0) {
      try {
        await markMessagesAsRead(projectId, {
          messageIds: projectData.communication.messages
            .filter(m => !m.read)
            .map(m => m.id)
        });
        
        setProjectData(prev => ({
          ...prev,
          communication: {
            ...prev.communication,
            unreadCount: 0
          }
        }));
      } catch (err) {
        console.error('Failed to mark messages as read:', err);
      }
    }
  }, [activeSection, projectId, navigate, projectData]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(async (file, metadata) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', projectId);
      formData.append('metadata', JSON.stringify({
        ...metadata,
        uploadedBy: user?.name || 'Client',
        uploadedAt: new Date().toISOString()
      }));

      const result = await uploadClientDocument(formData, {
        headers: {
          'Authorization': `Bearer ${clientToken}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update project data
      setProjectData(prev => ({
        ...prev,
        documents: [...(prev.documents || []), result.document]
      }));

      api.success({
        message: 'Bestand geüpload',
        description: `${file.name} is succesvol geüpload`,
        duration: 3
      });

      return result;
    } catch (err) {
      api.error({
        message: 'Upload mislukt',
        description: err.message || 'Kon bestand niet uploaden',
        duration: 5
      });
      throw err;
    }
  }, [projectId, user, clientToken, api]);

  /**
   * Handle sending message
   */
  const handleSendMessage = useCallback(async (message, attachments = []) => {
    try {
      const result = await sendClientMessage(projectId, {
        message,
        attachments,
        sender: user?.name || 'Client',
        timestamp: new Date().toISOString(),
        priority: message.includes('urgent') ? 'high' : 'normal'
      });

      // Update communication logs
      setProjectData(prev => ({
        ...prev,
        communication: {
          ...prev.communication,
          messages: [result.message, ...prev.communication.messages]
        }
      }));

      // Clear form
      messageForm.resetFields();

      return result;
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    }
  }, [projectId, user, messageForm]);

  // ==================== MODAL HANDLERS ====================

  const showUploadModal = () => {
    setUploadModalVisible(true);
  };

  const hideUploadModal = () => {
    setUploadModalVisible(false);
    uploadForm.resetFields();
  };

  const showMeetingModal = () => {
    setMeetingModalVisible(true);
  };

  const hideMeetingModal = () => {
    setMeetingModalVisible(false);
    meetingForm.resetFields();
  };

  const showExportModal = () => {
    setExportModalVisible(true);
  };

  const hideExportModal = () => {
    setExportModalVisible(false);
    exportForm.resetFields();
  };

  const showReportModal = () => {
    setReportModalVisible(true);
  };

  const hideReportModal = () => {
    setReportModalVisible(false);
    reportForm.resetFields();
  };

  // ==================== RENDER UTILITIES ====================

  /**
   * Render the main content based on active section
   */
  const renderMainContent = () => {
    if (!projectData) return null;

    const contentMap = {
      overview: (
        <ProjectOverview 
          data={projectData.overview}
          onAskQuestion={showMeetingModal}
          onRequestMeeting={showMeetingModal}
          onUploadDocument={showUploadModal}
          projectId={projectId}
        />
      ),
      contract: (
        <ContractSection 
          documents={projectData.contracts}
          onConfirmAgreement={(docId, version) => 
            handleClientAction('CONFIRM_CONTRACT', { 
              documentId: docId,
              version: version
            }, {
              confirm: true,
              confirmTitle: 'Contract bevestigen',
              confirmContent: 'Weet u zeker dat u dit contract wilt bevestigen? Dit is juridisch bindend.'
            })
          }
          onRequestClarification={(docId, question) => 
            handleClientAction('REQUEST_CLARIFICATION', {
              documentId: docId,
              question
            })
          }
          onViewDocument={setSelectedDocument}
        />
      ),
      drawings: (
        <DrawingsSection 
          drawings={projectData.drawings}
          onRequestRevision={(drawingId, reason) => 
            handleClientAction('REQUEST_DRAWING_REVISION', {
              drawingId,
              reason
            }, {
              confirm: true,
              confirmTitle: 'Revisie aanvragen',
              confirmContent: 'Weet u zeker dat u een revisie wilt aanvragen voor deze tekening?'
            })
          }
          onView3DModel={(modelId) => 
            handleClientAction('VIEW_3D_MODEL', { modelId })
          }
          onDownloadDrawing={(drawingId, format) => 
            handleClientAction('DOWNLOAD_DRAWING', { drawingId, format })
          }
        />
      ),
      delivery: (
        <DeliverySection 
          deliveryData={projectData.delivery}
          onConfirmDelivery={(pointId, notes) => 
            handleClientAction('CONFIRM_DELIVERY_POINT', { 
              deliveryPointId: pointId,
              clientNotes: notes
            }, {
              confirm: true,
              confirmTitle: 'Oplevering bevestigen',
              confirmContent: 'Weet u zeker dat u dit onderdeel wilt aftekenen?'
            })
          }
          onReportIssue={(pointId, issue) => 
            handleClientAction('REPORT_DELIVERY_ISSUE', {
              pointId,
              issue
            })
          }
          onScheduleInspection={(date, time) => 
            handleClientAction('SCHEDULE_INSPECTION', { date, time })
          }
        />
      ),
      extraWork: (
        <ExtraWorkSection 
          requests={projectData.extraWork}
          onRequestExtraWork={(requestData) => 
            handleClientAction('REQUEST_EXTRA_WORK', {
              ...requestData,
              includeDrawings: true,
              include3D: requestData.type === 'aesthetic'
            }, {
              confirm: true,
              confirmTitle: 'Meerwerk aanvragen',
              confirmContent: 'Weet u zeker dat u deze meerwerkaanvraag wilt indienen?'
            })
          }
          onApproveQuote={(quoteId, conditions) => 
            handleClientAction('APPROVE_EXTRA_WORK_QUOTE', { 
              quoteId,
              conditions,
              legalConsent: true
            }, {
              confirm: true,
              confirmTitle: 'Offerte goedkeuren',
              confirmContent: 'Weet u zeker dat u deze offerte wilt goedkeuren? Dit is financieel bindend.'
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
      ),
      communication: (
        <CommunicationSection 
          logs={projectData.communication}
          onNewMessage={handleSendMessage}
          onMarkAsRead={(messageIds) => 
            handleClientAction('MARK_MESSAGES_READ', { messageIds })
          }
          onExportConversation={() => 
            handleClientAction('EXPORT_CONVERSATION', {})
          }
          onReplyMessage={(messageId, reply) => 
            handleClientAction('REPLY_MESSAGE', { messageId, reply })
          }
        />
      ),
      reports: (
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
          onScheduleReport={(reportId, schedule) => 
            handleClientAction('SCHEDULE_REPORT', { reportId, schedule })
          }
        />
      )
    };

    return contentMap[activeSection] || contentMap.overview;
  };

  /**
   * Get project status color
   */
  const getStatusColor = (status) => {
    const colors = {
      'concept': 'default',
      'actief': 'green',
      'lopend': 'blue',
      'opgeleverd': 'cyan',
      'afgerond': 'purple',
      'gearchiveerd': 'gray',
      'gepauzeerd': 'orange',
      'geannuleerd': 'red'
    };
    return colors[status?.toLowerCase()] || 'default';
  };

  /**
   * Get project status text
   */
  const getStatusText = (status) => {
    const texts = {
      'concept': 'Concept',
      'actief': 'Actief',
      'lopend': 'Lopend',
      'opgeleverd': 'Oplevering',
      'afgerond': 'Afgerond',
      'gearchiveerd': 'Gearchiveerd',
      'gepauzeerd': 'Gepauzeerd',
      'geannuleerd': 'Geannuleerd'
    };
    return texts[status?.toLowerCase()] || status;
  };

  // ==================== RENDER LOGIC ====================

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout
        sidebarMenuItems={sidebarMenuItems}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        user={user}
      >
        {contextHolder}
        <LoadingOverlay 
          message={`Projectportaal laden...`}
          subMessage="Even geduld alstublieft"
          progress={connectionStatus === 'connecting' ? 30 : 70}
        />
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout
        sidebarMenuItems={sidebarMenuItems}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        user={user}
      >
        {contextHolder}
        <Content style={{ padding: 24 }}>
          <Card>
            <Result
              status="error"
              title={error.message}
              subTitle={error.details}
              extra={[
                <Button 
                  key="retry" 
                  type="primary" 
                  onClick={() => window.location.reload()}
                >
                  Opnieuw proberen
                </Button>,
                <Button 
                  key="contact" 
                  onClick={() => handleClientAction('REQUEST_SUPPORT', { 
                    issue: error.message,
                    type: error.type 
                  })}
                >
                  Contact opnemen
                </Button>,
                <Button 
                  key="home" 
                  onClick={() => navigate('/')}
                >
                  Naar dashboard
                </Button>
              ]}
            />
          </Card>
        </Content>
      </AdminLayout>
    );
  }

  // Main render
  return (
    <AdminLayout
      sidebarMenuItems={sidebarMenuItems}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      user={user}
      extraHeaderContent={
        <Space size="middle">
          <RealTimeIndicator 
            isOnline={isOnline}
            lastUpdate={lastUpdate}
            onRefresh={syncData}
            isRefreshing={isSyncing}
          />
          <Button 
            type="primary" 
            icon={<ExportOutlined />}
            onClick={showExportModal}
            size="small"
          >
            Exporteren
          </Button>
          <Badge count={projectData?.communication?.unreadCount || 0}>
            <Button 
              icon={<BellOutlined />}
              onClick={() => handleSectionChange('communication')}
              size="small"
            />
          </Badge>
        </Space>
      }
    >
      {contextHolder}
      
      {/* Offline Banner */}
      {!isOnline && (
        <OfflineBanner 
          message="Offline modus - Beperkte functionaliteit"
          onRetry={syncData}
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
        <Breadcrumb.Item>
          {projectData?.name}
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Project Header */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Space direction="vertical" size="small">
              <Title level={2} style={{ margin: 0 }}>
                {projectData?.name}
                <Tag 
                  color={getStatusColor(projectData?.status)}
                  style={{ marginLeft: 8, fontSize: 12 }}
                >
                  {getStatusText(projectData?.status)}
                </Tag>
              </Title>
              <Space split={<Divider type="vertical" />}>
                <Text type="secondary">
                  <ProjectOutlined /> Projectcode: {projectData?.projectCode}
                </Text>
                <Text type="secondary">
                  <EnvironmentOutlined /> {projectData?.location}
                </Text>
                <Text type="secondary">
                  <CalendarOutlined /> Start: {dayjs(projectData?.startDate).format('DD-MM-YYYY')}
                </Text>
                <Text type="secondary">
                  <ClockCircleOutlined /> Eind: {dayjs(projectData?.endDate).format('DD-MM-YYYY')}
                </Text>
              </Space>
            </Space>
          </Col>
          <Col>
            <Space direction="vertical" align="end">
              <Statistic 
                title="Projectvoortgang" 
                value={projectData?.progress || 0} 
                suffix="%" 
              />
              <Progress 
                percent={projectData?.progress || 0} 
                status="active" 
                strokeWidth={10}
                style={{ width: 200 }}
              />
            </Space>
          </Col>
        </Row>
      </Card>
      
      {/* Tabs for section navigation (mobile/alternative) */}
      <Card style={{ marginBottom: 24 }} bodyStyle={{ padding: 0 }}>
        <Tabs
          activeKey={activeSection}
          onChange={handleSectionChange}
          type="card"
          size="large"
          tabBarExtraContent={
            <Space style={{ marginRight: 8 }}>
              <Tooltip title="Vraag stellen">
                <Button 
                  icon={<QuestionCircleOutlined />}
                  onClick={showMeetingModal}
                  shape="circle"
                />
              </Tooltip>
              <Tooltip title="Document uploaden">
                <Button 
                  icon={<CloudUploadOutlined />}
                  onClick={showUploadModal}
                  shape="circle"
                />
              </Tooltip>
              <Tooltip title="Printen">
                <Button 
                  icon={<PrinterOutlined />}
                  onClick={() => window.print()}
                  shape="circle"
                />
              </Tooltip>
            </Space>
          }
        >
          <Tabs.TabPane 
            key="overview" 
            tab={
              <span>
                <HomeOutlined /> Overzicht
                {projectData?.overview?.newUpdates > 0 && (
                  <Badge count={projectData.overview.newUpdates} offset={[10, -5]} size="small" />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="contract" 
            tab={
              <span>
                <FileTextOutlined /> Contract
                {projectData?.contracts?.pendingSignatures > 0 && (
                  <Badge count={projectData.contracts.pendingSignatures} offset={[10, -5]} size="small" />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="drawings" 
            tab={
              <span>
                <FileSearchOutlined /> Tekeningen
                {projectData?.drawings?.newRevisions > 0 && (
                  <Badge count={projectData.drawings.newRevisions} offset={[10, -5]} size="small" />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="delivery" 
            tab={
              <span>
                <CheckCircleOutlined /> Oplevering
                {projectData?.delivery?.pendingConfirmations > 0 && (
                  <Badge count={projectData.delivery.pendingConfirmations} offset={[10, -5]} size="small" />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="extraWork" 
            tab={
              <span>
                <WarningOutlined /> Meerwerk
                {projectData?.extraWork?.pendingQuotes > 0 && (
                  <Badge count={projectData.extraWork.pendingQuotes} offset={[10, -5]} size="small" />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="communication" 
            tab={
              <span>
                <MessageOutlined /> Berichten
                {projectData?.communication?.unreadCount > 0 && (
                  <Badge count={projectData.communication.unreadCount} offset={[10, -5]} size="small" />
                )}
              </span>
            } 
          />
          <Tabs.TabPane 
            key="reports" 
            tab={
              <span>
                <BarChartOutlined /> Rapportages
              </span>
            } 
          />
        </Tabs>
      </Card>
      
      {/* Main Content */}
      <Content>
        <ErrorBoundary>
          {renderMainContent()}
        </ErrorBoundary>
      </Content>
      
      {/* Modals */}
      <ActionConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        content={confirmModal.content}
        onConfirm={confirmModal.onConfirm}
        onCancel={confirmModal.onCancel}
        okText="Bevestigen"
        cancelText="Annuleren"
      />
      
      {/* Upload Document Modal */}
      <Modal
        title="Document uploaden"
        open={uploadModalVisible}
        onCancel={hideUploadModal}
        footer={null}
        width={600}
      >
        <Form
          form={uploadForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              await handleFileUpload(values.file.file, {
                category: values.category,
                description: values.description,
                tags: values.tags
              });
              hideUploadModal();
            } catch (err) {
              console.error('Upload failed:', err);
            }
          }}
        >
          <Form.Item
            name="file"
            label="Bestand"
            rules={[{ required: true, message: 'Selecteer een bestand' }]}
          >
            <Upload
              maxCount={1}
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.dxf,.zip"
            >
              <Button icon={<UploadOutlined />}>Selecteer bestand</Button>
            </Upload>
          </Form.Item>
          
          <Form.Item
            name="category"
            label="Categorie"
            rules={[{ required: true, message: 'Selecteer een categorie' }]}
          >
            <Select placeholder="Selecteer categorie">
              <Option value="contract">Contract</Option>
              <Option value="drawing">Tekening</Option>
              <Option value="quote">Offerte</Option>
              <Option value="report">Rapport</Option>
              <Option value="photo">Foto</Option>
              <Option value="other">Overig</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Omschrijving"
            rules={[{ required: true, message: 'Voer een omschrijving in' }]}
          >
            <Input.TextArea rows={3} placeholder="Beschrijf het document..." />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Select
              mode="tags"
              placeholder="Voeg tags toe (druk op enter)"
              tokenSeparators={[',']}
            />
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
        width={500}
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
                description: values.description,
                type: values.type,
                attendees: values.attendees,
                location: values.location
              });
              hideMeetingModal();
            } catch (err) {
              console.error('Meeting request failed:', err);
            }
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Datum"
                rules={[{ required: true, message: 'Selecteer een datum' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Tijd"
                rules={[{ required: true, message: 'Selecteer een tijd' }]}
              >
                <TimePicker style={{ width: '100%' }} format="HH:mm" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item
            name="subject"
            label="Onderwerp"
            rules={[{ required: true, message: 'Voer een onderwerp in' }]}
          >
            <Input placeholder="Onderwerp van de meeting" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Beschrijving"
            rules={[{ required: true, message: 'Voer een beschrijving in' }]}
          >
            <Input.TextArea rows={4} placeholder="Beschrijf de agendapunten..." />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="Type meeting"
            rules={[{ required: true, message: 'Selecteer een type' }]}
          >
            <Select placeholder="Selecteer type">
              <Option value="onsite">Op locatie</Option>
              <Option value="online">Online</Option>
              <Option value="hybrid">Hybride</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="location"
            label="Locatie/URL"
          >
            <Input placeholder="Adres of meeting link" />
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
        width={700}
      >
        <Form
          form={exportForm}
          layout="vertical"
          onFinish={(values) => {
            handleExportDossier({
              format: values.format,
              includeAll: values.includeAll,
              customSelection: values.customSelection || []
            });
            hideExportModal();
          }}
        >
          <Form.Item
            name="format"
            label="Exportformaat"
            rules={[{ required: true, message: 'Selecteer een formaat' }]}
          >
            <Radio.Group>
              <Radio value="zip">ZIP (alle bestanden)</Radio>
              <Radio value="pdf">PDF (gecombineerd)</Radio>
              <Radio value="excel">Excel (data)</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="includeAll"
            label="Inhoud"
            initialValue={true}
          >
            <Radio.Group>
              <Radio value={true}>Volledig dossier</Radio>
              <Radio value={false}>Selectie maken</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.includeAll !== currentValues.includeAll}
          >
            {({ getFieldValue }) =>
              getFieldValue('includeAll') === false ? (
                <Form.Item
                  name="customSelection"
                  label="Selecteer onderdelen"
                  rules={[{ required: true, message: 'Selecteer minimaal één onderdeel' }]}
                >
                  <Checkbox.Group style={{ width: '100%' }}>
                    <Row>
                      <Col span={8}>
                        <Checkbox value="contracts">Contracten</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="drawings">Tekeningen</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="delivery_documents">Oplevering</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="extra_work_quotes">Meerwerk</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="communication_logs">Berichten</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="reports">Rapportages</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="photos">Foto's</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="certificates">Certificaten</Checkbox>
                      </Col>
                      <Col span={8}>
                        <Checkbox value="financial">Financieel</Checkbox>
                      </Col>
                    </Row>
                  </Checkbox.Group>
                </Form.Item>
              ) : null
            }
          </Form.Item>
          
          <Divider />
          
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
      
      {/* Quick Actions Drawer */}
      <Drawer
        title="Snelle acties"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={350}
      >
        <List
          dataSource={[
            {
              key: 'question',
              title: 'Vraag stellen',
              icon: <QuestionCircleOutlined />,
              action: showMeetingModal
            },
            {
              key: 'upload',
              title: 'Document uploaden',
              icon: <CloudUploadOutlined />,
              action: showUploadModal
            },
            {
              key: 'export',
              title: 'Exporteren',
              icon: <ExportOutlined />,
              action: showExportModal
            },
            {
              key: 'print',
              title: 'Printen',
              icon: <PrinterOutlined />,
              action: () => window.print()
            },
            {
              key: 'refresh',
              title: 'Vernieuwen',
              icon: <ReloadOutlined />,
              action: syncData
            },
            {
              key: 'support',
              title: 'Support',
              icon: <InfoCircleOutlined />,
              action: () => handleClientAction('REQUEST_SUPPORT', {})
            }
          ]}
          renderItem={item => (
            <List.Item>
              <Button 
                type="text" 
                icon={item.icon}
                onClick={item.action}
                style={{ width: '100%', textAlign: 'left' }}
              >
                {item.title}
              </Button>
            </List.Item>
          )}
        />
      </Drawer>
      
      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          visible={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onDownload={() => handleClientAction('DOWNLOAD_DOCUMENT', {
            documentId: selectedDocument.id
          })}
        />
      )}
      
      {/* Back to top button */}
      <BackTop />
    </AdminLayout>
  );
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Get client IP address
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
    'EXPORT_PROJECT_DOSSIER': 'Export gestart',
    'UPLOAD_DOCUMENT': 'Document geüpload',
    'REQUEST_MEETING': 'Meeting aangevraagd',
    'CONFIRM_DELIVERY_POINT': 'Oplevering bevestigd',
    'REPORT_DELIVERY_ISSUE': 'Probleem gemeld',
    'REQUEST_DRAWING_REVISION': 'Revisie aangevraagd',
    'APPROVE_EXTRA_WORK_QUOTE': 'Meerwerkofferte goedgekeurd',
    'DOWNLOAD_DOCUMENT': 'Download gestart',
    'MARK_MESSAGES_READ': 'Berichten gemarkeerd als gelezen'
  };
  return messages[actionType] || 'Actie voltooid';
};

// Prop Types zouden hier komen in een productie-omgeving

export default ProjectPortaal;
