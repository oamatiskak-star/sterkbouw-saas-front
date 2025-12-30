import React, { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useProject } from '../../context/ProjectContext';
import { useWebSocket } from '../../context/WebSocketContext';
import { useAuth } from '../../context/AuthContext';
import { useGeoLocation } from '../../hooks/useGeoLocation';
import { useOfflineSync } from '../../hooks/useOfflineSync';

// Dynamische imports voor performance
const DeliveryPointsManager = dynamic(() => import('../../components/bouwplaats/DeliveryPointsManager'), {
  loading: () => <div className="loading">Opleverpunten laden...</div>
});

const PlanningIntegration = dynamic(() => import('../../components/bouwplaats/PlanningIntegration'), {
  loading: () => <div className="loading">Planning laden...</div>
});

const SafetyInspector = dynamic(() => import('../../components/bouwplaats/SafetyInspector'), {
  loading: () => <div className="loading">Veiligheid laden...</div>
});

const MaterialScanner = dynamic(() => import('../../components/bouwplaats/MaterialScanner'), {
  loading: () => <div className="loading">Scanner laden...</div>
});

const BIMViewer = dynamic(() => import('../../components/bouwplaats/BIMViewer'), {
  loading: () => <div className="loading">BIM laden...</div>,
  ssr: false
});

export default function BouwplaatsAppPage() {
  // Context hooks
  const { projects, activeProject, setActiveProject, fetchProjectDetails } = useProject();
  const { user, permissions, teamMembers } = useAuth();
  const { subscribe, unsubscribe, sendMessage, connectionStatus } = useWebSocket();
  const { location, accuracy, getCurrentLocation } = useGeoLocation();
  const { isOnline, syncPendingChanges, hasPendingChanges } = useOfflineSync();
  
  // Main state variables
  const [language, setLanguage] = useState('nl');
  const [viewMode, setViewMode] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Project specific state
  const [buildingNumbers, setBuildingNumbers] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [workAreas, setWorkAreas] = useState([]);
  const [currentLocation, setCurrentLocation] = useState({ building: '', space: '', area: '' });
  
  // Delivery points state
  const [deliveryPoints, setDeliveryPoints] = useState([]);
  const [deliveryStats, setDeliveryStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    ready: 0,
    approved: 0,
    critical: 0,
    withPhotos: 0
  });
  const [deliveryFilters, setDeliveryFilters] = useState({
    buildingNumber: '',
    space: '',
    status: '',
    priority: '',
    assignedTo: '',
    dateRange: { start: null, end: null }
  });
  
  // Planning state
  const [dailyPlanning, setDailyPlanning] = useState([]);
  const [weeklyPlanning, setWeeklyPlanning] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);
  const [taskProgress, setTaskProgress] = useState({});
  const [planningStats, setPlanningStats] = useState({
    completed: 0,
    inProgress: 0,
    delayed: 0,
    onSchedule: 0,
    totalHours: 0,
    variance: 0
  });
  
  // Material state
  const [materials, setMaterials] = useState([]);
  const [materialCategories, setMaterialCategories] = useState([]);
  const [materialOrders, setMaterialOrders] = useState([]);
  const [materialUsage, setMaterialUsage] = useState([]);
  const [inventoryAlerts, setInventoryAlerts] = useState([]);
  
  // Safety state
  const [safetyChecks, setSafetyChecks] = useState([]);
  const [safetyIncidents, setSafetyIncidents] = useState([]);
  const [ppeStatus, setPpeStatus] = useState({});
  const [safetyScore, setSafetyScore] = useState(95);
  
  // Quality control state
  const [qualityChecks, setQualityChecks] = useState([]);
  const [qualityIssues, setQualityIssues] = useState([]);
  const [qualityStandards, setQualityStandards] = useState([]);
  const [inspectionReports, setInspectionReports] = useState([]);
  
  // Photo & documentation state
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [photoFilters, setPhotoFilters] = useState({
    category: '',
    date: '',
    location: '',
    tagged: false
  });
  
  // Team & communication state
  const [teamChat, setTeamChat] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [teamPresence, setTeamPresence] = useState({});
  
  // AI Assistant state
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponses, setAiResponses] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState({});
  
  // Settings state
  const [userSettings, setUserSettings] = useState({
    notifications: true,
    vibration: true,
    sound: true,
    autoSave: true,
    offlineMode: true,
    darkMode: false,
    fontSize: 'medium',
    language: 'nl',
    syncFrequency: 'realtime',
    dataRetention: '30d',
    backupEnabled: true
  });
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [showSignature, setShowSignature] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  
  // Refs
  const cameraRef = useRef(null);
  const chatContainerRef = useRef(null);
  const scannerRef = useRef(null);
  const signatureRef = useRef(null);
  
  // Translation system with all languages
  const translations = {
    nl: require('../../locales/nl.json'),
    en: require('../../locales/en.json'),
    de: require('../../locales/de.json'),
    pl: require('../../locales/pl.json'),
    fr: require('../../locales/fr.json'),
    es: require('../../locales/es.json')
  };
  
  const t = useCallback((key, params = {}) => {
    let translation = translations[language]?.[key] || translations.nl[key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{${param}}`, params[param]);
    });
    
    return translation;
  }, [language]);
  
  // Initialize app
  useEffect(() => {
    initializeApp();
    
    // Setup service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered:', registration);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
    
    // Setup beforeinstallprompt for PWA
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showInstallPromotion();
    });
    
    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      hideInstallPromotion();
    });
    
    return () => {
      // Cleanup event listeners
      window.removeEventListener('beforeinstallprompt', () => {});
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);
  
  // Project change effect
  useEffect(() => {
    if (activeProject) {
      loadProjectData(activeProject.id);
      setupWebSocketSubscriptions(activeProject.id);
    }
    
    return () => {
      if (activeProject) {
        cleanupWebSocketSubscriptions(activeProject.id);
      }
    };
  }, [activeProject]);
  
  // WebSocket connection monitoring
  useEffect(() => {
    if (connectionStatus === 'connected' && hasPendingChanges) {
      syncPendingChanges();
    }
  }, [connectionStatus, hasPendingChanges, syncPendingChanges]);
  
  // Initialize app function
  const initializeApp = async () => {
    setIsLoading(true);
    
    try {
      // Load user settings
      const savedSettings = localStorage.getItem('bouwplaats_settings');
      if (savedSettings) {
        setUserSettings(JSON.parse(savedSettings));
      }
      
      // Load notifications
      const savedNotifications = localStorage.getItem('bouwplaats_notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      }
      
      // Request necessary permissions
      await requestPermissions();
      
      // Setup geolocation tracking
      startLocationTracking();
      
      // Load initial data
      await loadInitialData();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      showError(t('initialization_error'));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Request permissions
  const requestPermissions = async () => {
    const permissions = [
      { name: 'camera', required: false },
      { name: 'location', required: true },
      { name: 'notifications', required: false },
      { name: 'microphone', required: false }
    ];
    
    for (const permission of permissions) {
      try {
        if (permission.name === 'camera') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        } else if (permission.name === 'location') {
          await navigator.permissions.query({ name: 'geolocation' });
        } else if (permission.name === 'notifications') {
          if ('Notification' in window && Notification.permission === 'default') {
            await Notification.requestPermission();
          }
        }
      } catch (error) {
        if (permission.required) {
          console.warn(`Permission ${permission.name} denied:`, error);
        }
      }
    }
  };
  
  // Start location tracking
  const startLocationTracking = () => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        updateUserLocation(latitude, longitude, accuracy);
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  };
  
  // Update user location
  const updateUserLocation = async (lat, lng, acc) => {
    // Update local state
    setLocation({ lat, lng, accuracy: acc });
    
    // Send to server if online
    if (isOnline && activeProject) {
      sendMessage({
        type: 'location_update',
        data: {
          userId: user.id,
          projectId: activeProject.id,
          latitude: lat,
          longitude: lng,
          accuracy: acc,
          timestamp: new Date().toISOString()
        }
      });
    }
    
    // Check if user is in restricted area
    checkLocationRestrictions(lat, lng);
  };
  
  // Load project data
  const loadProjectData = async (projectId) => {
    try {
      const [
        buildingData,
        spacesData,
        deliveryPointsData,
        planningData,
        materialsData,
        safetyData,
        qualityData,
        teamData
      ] = await Promise.all([
        fetchProjectDetails(projectId, 'building_numbers'),
        fetchProjectDetails(projectId, 'spaces'),
        fetchProjectDetails(projectId, 'delivery_points'),
        fetchProjectDetails(projectId, 'planning'),
        fetchProjectDetails(projectId, 'materials'),
        fetchProjectDetails(projectId, 'safety'),
        fetchProjectDetails(projectId, 'quality'),
        fetchProjectDetails(projectId, 'team')
      ]);
      
      setBuildingNumbers(buildingData);
      setSpaces(spacesData);
      setDeliveryPoints(deliveryPointsData);
      setDailyPlanning(planningData.daily);
      setWeeklyPlanning(planningData.weekly);
      setMaterials(materialsData.inventory);
      setMaterialCategories(materialsData.categories);
      setSafetyChecks(safetyData.checks);
      setSafetyIncidents(safetyData.incidents);
      setQualityChecks(qualityData.checks);
      setQualityStandards(qualityData.standards);
      
      // Calculate statistics
      calculateDeliveryStats(deliveryPointsData);
      calculatePlanningStats(planningData.daily);
      calculateMaterialStats(materialsData.inventory);
      calculateSafetyStats(safetyData);
      calculateQualityStats(qualityData);
      
    } catch (error) {
      console.error('Error loading project data:', error);
      showError(t('data_loading_error'));
    }
  };
  
  // Setup WebSocket subscriptions
  const setupWebSocketSubscriptions = (projectId) => {
    // Delivery points updates
    subscribe(`project-${projectId}-delivery`, handleDeliveryUpdate);
    
    // Planning updates
    subscribe(`project-${projectId}-planning`, handlePlanningUpdate);
    
    // Material updates
    subscribe(`project-${projectId}-materials`, handleMaterialUpdate);
    
    // Safety updates
    subscribe(`project-${projectId}-safety`, handleSafetyUpdate);
    
    // Quality updates
    subscribe(`project-${projectId}-quality`, handleQualityUpdate);
    
    // Team updates
    subscribe(`project-${projectId}-team`, handleTeamUpdate);
    
    // Chat messages
    subscribe(`project-${projectId}-chat`, handleChatMessage);
    
    // Notifications
    subscribe(`user-${user.id}-notifications`, handleNotification);
    
    // System alerts
    subscribe(`project-${projectId}-alerts`, handleSystemAlert);
  };
  
  // Cleanup WebSocket subscriptions
  const cleanupWebSocketSubscriptions = (projectId) => {
    unsubscribe(`project-${projectId}-delivery`);
    unsubscribe(`project-${projectId}-planning`);
    unsubscribe(`project-${projectId}-materials`);
    unsubscribe(`project-${projectId}-safety`);
    unsubscribe(`project-${projectId}-quality`);
    unsubscribe(`project-${projectId}-team`);
    unsubscribe(`project-${projectId}-chat`);
    unsubscribe(`user-${user.id}-notifications`);
    unsubscribe(`project-${projectId}-alerts`);
  };
  
  // WebSocket handlers
  const handleDeliveryUpdate = (data) => {
    switch (data.action) {
      case 'created':
        setDeliveryPoints(prev => [...prev, data.point]);
        addNotification('delivery', t('new_delivery_point', { building: data.point.buildingNumber, space: data.point.space }));
        break;
      case 'updated':
        setDeliveryPoints(prev => prev.map(p => p.id === data.point.id ? data.point : p));
        break;
      case 'deleted':
        setDeliveryPoints(prev => prev.filter(p => p.id !== data.pointId));
        break;
      case 'status_changed':
        setDeliveryPoints(prev => prev.map(p => p.id === data.pointId ? { ...p, status: data.newStatus } : p));
        break;
    }
    calculateDeliveryStats();
  };
  
  const handlePlanningUpdate = (data) => {
    // Handle planning updates
    setDailyPlanning(prev => prev.map(task => 
      task.id === data.taskId ? { ...task, ...data.updates } : task
    ));
    calculatePlanningStats();
  };
  
  const handleMaterialUpdate = (data) => {
    // Handle material updates
    setMaterials(prev => prev.map(material => 
      material.id === data.materialId ? { ...material, ...data.updates } : material
    ));
  };
  
  const handleSafetyUpdate = (data) => {
    // Handle safety updates
    switch (data.type) {
      case 'check_completed':
        setSafetyChecks(prev => [...prev, data.check]);
        break;
      case 'incident_reported':
        setSafetyIncidents(prev => [...prev, data.incident]);
        showEmergencyAlert(data.incident);
        break;
      case 'ppe_updated':
        setPpeStatus(prev => ({ ...prev, [data.userId]: data.status }));
        break;
    }
  };
  
  const handleQualityUpdate = (data) => {
    // Handle quality updates
    setQualityChecks(prev => [...prev, data.check]);
  };
  
  const handleTeamUpdate = (data) => {
    // Handle team updates
    setTeamPresence(prev => ({ ...prev, [data.userId]: data.status }));
  };
  
  const handleChatMessage = (data) => {
    // Handle chat messages
    setTeamChat(prev => [...prev, data.message]);
    if (!document.hasFocus()) {
      showChatNotification(data.message);
    }
  };
  
  const handleNotification = (data) => {
    // Handle notifications
    addNotification(data.type, data.message, data.data);
  };
  
  const handleSystemAlert = (data) => {
    // Handle system alerts
    showAlert(data.severity, data.message, data.action);
  };
  
  // Statistics calculation functions
  const calculateDeliveryStats = (points = deliveryPoints) => {
    const stats = {
      total: points.length,
      open: points.filter(p => p.status === 'open').length,
      inProgress: points.filter(p => p.status === 'in_progress').length,
      ready: points.filter(p => p.status === 'ready').length,
      approved: points.filter(p => p.status === 'approved').length,
      critical: points.filter(p => p.priority === 'critical').length,
      withPhotos: points.filter(p => p.photos && p.photos.length > 0).length
    };
    setDeliveryStats(stats);
  };
  
  const calculatePlanningStats = (tasks = dailyPlanning) => {
    const stats = {
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      delayed: tasks.filter(t => t.status === 'delayed').length,
      onSchedule: tasks.filter(t => t.status === 'on_schedule').length,
      totalHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      variance: tasks.reduce((sum, task) => sum + (task.variance || 0), 0) / tasks.length || 0
    };
    setPlanningStats(stats);
  };
  
  const calculateMaterialStats = (materialsList = materials) => {
    // Calculate material statistics
    const lowStock = materialsList.filter(m => m.quantity <= m.minStock).length;
    const outOfStock = materialsList.filter(m => m.quantity === 0).length;
    const totalValue = materialsList.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0);
    
    setInventoryAlerts([
      { type: 'low_stock', count: lowStock, severity: 'warning' },
      { type: 'out_of_stock', count: outOfStock, severity: 'danger' },
      { type: 'high_value', value: totalValue, severity: 'info' }
    ]);
  };
  
  const calculateSafetyStats = (safetyData) => {
    const totalChecks = safetyData.checks.length;
    const passedChecks = safetyData.checks.filter(c => c.status === 'passed').length;
    const score = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;
    setSafetyScore(score);
  };
  
  const calculateQualityStats = (qualityData) => {
    // Calculate quality statistics
    const passedChecks = qualityData.checks.filter(c => c.result === 'passed').length;
    const totalChecks = qualityData.checks.length;
    const passRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100;
    
    setQualityIssues(qualityData.checks.filter(c => c.result === 'failed'));
  };
  
  // Delivery point management
  const addDeliveryPoint = async (pointData) => {
    const newPoint = {
      id: `dp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      projectId: activeProject.id,
      buildingNumber: pointData.buildingNumber,
      space: pointData.space,
      type: pointData.type,
      description: pointData.description,
      status: 'open',
      priority: pointData.priority || 'medium',
      reportedBy: user.id,
      reportedAt: new Date().toISOString(),
      assignedTo: pointData.assignedTo || null,
      deadline: pointData.deadline || null,
      photos: pointData.photos || [],
      location: {
        latitude: location.lat,
        longitude: location.lng,
        accuracy: location.accuracy
      },
      metadata: {
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        version: 1
      }
    };
    
    // Add locally
    setDeliveryPoints(prev => [...prev, newPoint]);
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'delivery_point_create',
        data: newPoint
      });
    } else {
      // Store for offline sync
      storeOfflineChange('delivery_points', 'create', newPoint);
    }
    
    // Add notification
    addNotification('delivery', t('delivery_point_added', {
      type: t(pointData.type),
      building: pointData.buildingNumber,
      space: pointData.space
    }));
    
    return newPoint;
  };
  
  const updateDeliveryPoint = async (pointId, updates) => {
    const updatedPoint = {
      ...deliveryPoints.find(p => p.id === pointId),
      ...updates,
      metadata: {
        ...deliveryPoints.find(p => p.id === pointId).metadata,
        modified: new Date().toISOString(),
        version: (deliveryPoints.find(p => p.id === pointId).metadata.version || 0) + 1
      }
    };
    
    // Update locally
    setDeliveryPoints(prev => prev.map(p => p.id === pointId ? updatedPoint : p));
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'delivery_point_update',
        data: { pointId, updates }
      });
    } else {
      storeOfflineChange('delivery_points', 'update', { pointId, updates });
    }
    
    return updatedPoint;
  };
  
  const deleteDeliveryPoint = async (pointId) => {
    // Remove locally
    setDeliveryPoints(prev => prev.filter(p => p.id !== pointId));
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'delivery_point_delete',
        data: { pointId }
      });
    } else {
      storeOfflineChange('delivery_points', 'delete', { pointId });
    }
  };
  
  const addPhotoToDeliveryPoint = async (pointId, photoData) => {
    const point = deliveryPoints.find(p => p.id === pointId);
    if (!point) return;
    
    const updatedPhotos = [...(point.photos || []), photoData];
    
    await updateDeliveryPoint(pointId, {
      photos: updatedPhotos,
      lastPhotoAdded: new Date().toISOString()
    });
    
    // AI analysis of photo
    analyzePhoto(photoData, point);
  };
  
  // Planning management
  const startTask = async (taskId) => {
    const task = dailyPlanning.find(t => t.id === taskId);
    if (!task) return;
    
    const updates = {
      status: 'in_progress',
      actualStart: new Date().toISOString(),
      startedBy: user.id
    };
    
    await updateTask(taskId, updates);
    setCurrentTask({ ...task, ...updates });
    
    // Notify team
    sendMessage({
      type: 'task_started',
      data: { taskId, userId: user.id }
    });
  };
  
  const updateTaskProgress = async (taskId, progress) => {
    const updates = {
      progress,
      lastUpdate: new Date().toISOString()
    };
    
    if (progress === 100) {
      updates.status = 'completed';
      updates.actualEnd = new Date().toISOString();
    }
    
    await updateTask(taskId, updates);
    
    // Update task progress visualization
    setTaskProgress(prev => ({ ...prev, [taskId]: progress }));
  };
  
  const reportTaskDelay = async (taskId, reason, estimatedDelay) => {
    const updates = {
      status: 'delayed',
      delayReason: reason,
      estimatedDelay,
      delayedAt: new Date().toISOString(),
      reportedBy: user.id
    };
    
    await updateTask(taskId, updates);
    
    // Send delay notification
    addNotification('planning', t('task_delayed', {
      task: dailyPlanning.find(t => t.id === taskId)?.name || taskId,
      reason
    }));
    
    // Update dependent tasks
    updateDependentTasks(taskId, estimatedDelay);
  };
  
  const updateTask = async (taskId, updates) => {
    // Update locally
    setDailyPlanning(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'task_update',
        data: { taskId, updates }
      });
    } else {
      storeOfflineChange('tasks', 'update', { taskId, updates });
    }
  };
  
  const updateDependentTasks = (delayedTaskId, delay) => {
    const delayedTask = dailyPlanning.find(t => t.id === delayedTaskId);
    if (!delayedTask || !delayedTask.dependencies) return;
    
    delayedTask.dependencies.forEach(depId => {
      const dependentTask = dailyPlanning.find(t => t.id === depId);
      if (dependentTask) {
        const newStart = new Date(dependentTask.plannedStart);
        newStart.setMinutes(newStart.getMinutes() + delay);
        
        updateTask(depId, {
          plannedStart: newStart.toISOString(),
          delayPropagation: true
        });
      }
    });
  };
  
  // Material management
  const scanMaterial = async (barcode) => {
    setShowScanner(false);
    
    try {
      // Look up material by barcode
      const material = materials.find(m => m.barcode === barcode) ||
        materialCategories.find(cat => cat.barcode === barcode);
      
      if (material) {
        setActiveModal('material_details');
        // Show material details
        showMaterialDetails(material);
      } else {
        // Unknown barcode - prompt for manual entry
        setActiveModal('add_material');
        showAddMaterialPrompt(barcode);
      }
    } catch (error) {
      showError(t('scan_error'));
    }
  };
  
  const registerMaterialUsage = async (materialId, quantity, location, purpose) => {
    const usageRecord = {
      id: `mu-${Date.now()}`,
      materialId,
      quantity,
      location,
      purpose,
      usedBy: user.id,
      usedAt: new Date().toISOString(),
      projectId: activeProject.id,
      verified: false
    };
    
    // Update material quantity
    const material = materials.find(m => m.id === materialId);
    if (material) {
      const newQuantity = material.quantity - quantity;
      await updateMaterial(materialId, { quantity: Math.max(0, newQuantity) });
    }
    
    // Add usage record
    setMaterialUsage(prev => [...prev, usageRecord]);
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'material_usage',
        data: usageRecord
      });
    } else {
      storeOfflineChange('material_usage', 'create', usageRecord);
    }
    
    // Check for low stock alert
    if (material && material.quantity <= material.minStock) {
      addNotification('material', t('low_stock_alert', {
        material: material.name,
        quantity: material.quantity,
        unit: material.unit
      }));
    }
  };
  
  const updateMaterial = async (materialId, updates) => {
    // Update locally
    setMaterials(prev => prev.map(m => 
      m.id === materialId ? { ...m, ...updates } : m
    ));
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'material_update',
        data: { materialId, updates }
      });
    } else {
      storeOfflineChange('materials', 'update', { materialId, updates });
    }
  };
  
  // Safety management
  const performSafetyCheck = async (checklistId, answers) => {
    const check = {
      id: `sc-${Date.now()}`,
      checklistId,
      answers,
      performedBy: user.id,
      performedAt: new Date().toISOString(),
      location: {
        building: currentLocation.building,
        space: currentLocation.space,
        coordinates: { lat: location.lat, lng: location.lng }
      },
      status: 'completed',
      score: calculateSafetyScore(answers)
    };
    
    // Add to checks
    setSafetyChecks(prev => [...prev, check]);
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'safety_check_completed',
        data: check
      });
    } else {
      storeOfflineChange('safety_checks', 'create', check);
    }
    
    // Check for issues
    const issues = identifySafetyIssues(answers);
    if (issues.length > 0) {
      reportSafetyIssues(issues, check.location);
    }
    
    return check;
  };
  
  const reportSafetyIncident = async (incidentData) => {
    const incident = {
      id: `si-${Date.now()}`,
      ...incidentData,
      reportedBy: user.id,
      reportedAt: new Date().toISOString(),
      location: {
        building: currentLocation.building,
        space: currentLocation.space,
        coordinates: { lat: location.lat, lng: location.lng }
      },
      status: 'reported',
      severity: incidentData.severity || 'medium',
      photos: incidentData.photos || []
    };
    
    // Add to incidents
    setSafetyIncidents(prev => [...prev, incident]);
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'safety_incident',
        data: incident
      });
    } else {
      storeOfflineChange('safety_incidents', 'create', incident);
    }
    
    // Emergency procedures
    if (incident.severity === 'high' || incident.severity === 'critical') {
      triggerEmergencyProcedures(incident);
    }
    
    // Notify team
    sendEmergencyNotification(incident);
    
    return incident;
  };
  
  // Quality control
  const performQualityCheck = async (standardId, measurements, photos = []) => {
    const check = {
      id: `qc-${Date.now()}`,
      standardId,
      measurements,
      photos,
      checkedBy: user.id,
      checkedAt: new Date().toISOString(),
      location: {
        building: currentLocation.building,
        space: currentLocation.space,
        coordinates: { lat: location.lat, lng: location.lng }
      },
      result: 'pending',
      tolerance: calculateTolerance(measurements, standardId)
    };
    
    // AI analysis
    const aiResult = await analyzeQualityCheck(check);
    check.result = aiResult.passed ? 'passed' : 'failed';
    check.aiAnalysis = aiResult;
    
    // Add to checks
    setQualityChecks(prev => [...prev, check]);
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'quality_check',
        data: check
      });
    } else {
      storeOfflineChange('quality_checks', 'create', check);
    }
    
    // If failed, create delivery point
    if (check.result === 'failed') {
      createQualityIssueFromCheck(check);
    }
    
    return check;
  };
  
  // Photo management
  const takePhoto = async (context = 'general') => {
    if (!cameraRef.current) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      cameraRef.current.srcObject = stream;
      setShowCamera(true);
      
      // Store context for when photo is taken
      setPhotoContext(context);
    } catch (error) {
      console.error('Camera error:', error);
      showError(t('camera_error'));
    }
  };
  
  const capturePhoto = async () => {
    if (!cameraRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = cameraRef.current.videoWidth;
    canvas.height = cameraRef.current.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(cameraRef.current, 0, 0);
    
    const photoData = {
      id: `photo-${Date.now()}`,
      dataUrl: canvas.toDataURL('image/jpeg', 0.8),
      timestamp: new Date().toISOString(),
      location: {
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy
      },
      context: photoContext,
      projectId: activeProject.id,
      takenBy: user.id,
      metadata: {
        resolution: `${canvas.width}x${canvas.height}`,
        size: canvas.toDataURL('image/jpeg').length,
        format: 'jpeg'
      }
    };
    
    // Add to photos
    setPhotos(prev => [...prev, photoData]);
    
    // Stop camera
    cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
    setShowCamera(false);
    
    // AI analysis
    analyzePhoto(photoData, photoContext);
    
    // Store locally and sync
    if (isOnline) {
      sendMessage({
        type: 'photo_taken',
        data: photoData
      });
    } else {
      storeOfflineChange('photos', 'create', photoData);
    }
    
    return photoData;
  };
  
  // AI functions
  const askAI = async (question, context = {}) => {
    const aiRequest = {
      id: `ai-${Date.now()}`,
      question,
      context: {
        ...context,
        project: activeProject,
        location: currentLocation,
        userRole: user.role,
        timestamp: new Date().toISOString()
      },
      status: 'processing'
    };
    
    setAiResponses(prev => [...prev, aiRequest]);
    
    try {
      // Simulate AI processing
      const response = await simulateAIResponse(question, context);
      
      aiRequest.status = 'completed';
      aiRequest.response = response;
      aiRequest.timestamp = new Date().toISOString();
      
      setAiResponses(prev => prev.map(r => 
        r.id === aiRequest.id ? aiRequest : r
      ));
      
      // Store in suggestions if helpful
      if (response.suggestions && response.suggestions.length > 0) {
        setAiSuggestions(prev => [...response.suggestions, ...prev.slice(0, 9)]);
      }
      
      return aiRequest;
    } catch (error) {
      aiRequest.status = 'error';
      aiRequest.error = error.message;
      
      setAiResponses(prev => prev.map(r => 
        r.id === aiRequest.id ? aiRequest : r
      ));
      
      throw error;
    }
  };
  
  const analyzePhoto = async (photoData, context) => {
    // Simulate AI photo analysis
    const analysis = {
      id: `analysis-${Date.now()}`,
      photoId: photoData.id,
      timestamp: new Date().toISOString(),
      detectedObjects: [],
      qualityIssues: [],
      safetyConcerns: [],
      measurements: [],
      recommendations: []
    };
    
    // Simulate object detection
    if (context === 'safety') {
      analysis.detectedObjects = ['person', 'helmet', 'vest', 'gloves'];
      analysis.safetyConcerns = Math.random() > 0.8 ? ['missing_ppe'] : [];
    } else if (context === 'quality') {
      analysis.detectedObjects = ['wall', 'tile', 'joint'];
      analysis.qualityIssues = Math.random() > 0.7 ? ['uneven_surface', 'crack'] : [];
      analysis.measurements = [
        { type: 'alignment', value: 2.5, unit: 'mm', tolerance: 3 },
        { type: 'level', value: 0.8, unit: 'degrees', tolerance: 1 }
      ];
    }
    
    // Add to analysis
    setAiAnalysis(prev => ({ ...prev, [photoData.id]: analysis }));
    
    // Create issues if detected
    if (analysis.qualityIssues.length > 0) {
      createDeliveryPointFromAnalysis(analysis, photoData);
    }
    
    if (analysis.safetyConcerns.length > 0) {
      reportSafetyIssueFromAnalysis(analysis, photoData);
    }
    
    return analysis;
  };
  
  // Communication functions
  const sendChatMessage = async (message, attachments = []) => {
    const chatMessage = {
      id: `msg-${Date.now()}`,
      sender: user.id,
      senderName: user.name,
      message,
      attachments,
      timestamp: new Date().toISOString(),
      projectId: activeProject.id,
      readBy: [user.id],
      type: 'text'
    };
    
    // Add to chat
    setTeamChat(prev => [...prev, chatMessage]);
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'chat_message',
        data: chatMessage
      });
    } else {
      storeOfflineChange('chat_messages', 'create', chatMessage);
    }
    
    // Scroll to bottom
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    
    return chatMessage;
  };
  
  const startVoiceMessage = async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showError(t('voice_not_supported'));
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = language;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    recognition.start();
    
    recognition.onresult = async (event) => {
      const transcript = event.results[0][0].transcript;
      await sendChatMessage(transcript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      showError(t('voice_error'));
    };
  };
  
  // Export functions
  const generateReport = async (type, filters = {}) => {
    setIsLoading(true);
    
    try {
      let reportData;
      
      switch (type) {
        case 'daily_report':
          reportData = await generateDailyReport(filters.date || new Date());
          break;
        case 'delivery_report':
          reportData = await generateDeliveryReport(filters);
          break;
        case 'safety_report':
          reportData = await generateSafetyReport(filters);
          break;
        case 'quality_report':
          reportData = await generateQualityReport(filters);
          break;
        case 'material_report':
          reportData = await generateMaterialReport(filters);
          break;
        default:
          throw new Error('Unknown report type');
      }
      
      // Generate PDF
      const pdfUrl = await generatePDF(reportData);
      
      // Download
      downloadFile(pdfUrl, `${type}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Log export
      logExport(type, filters);
      
      return reportData;
    } catch (error) {
      console.error('Report generation error:', error);
      showError(t('report_generation_error'));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  const shareData = async (data, recipients, permissions) => {
    const shareData = {
      id: `share-${Date.now()}`,
      data,
      recipients,
      permissions,
      sharedBy: user.id,
      sharedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    // Send to server
    if (isOnline) {
      sendMessage({
        type: 'data_shared',
        data: shareData
      });
    } else {
      storeOfflineChange('shared_data', 'create', shareData);
    }
    
    // Generate shareable link
    const shareLink = generateShareLink(shareData.id);
    
    return { shareData, shareLink };
  };
  
  // Utility functions
  const showError = (message) => {
    addNotification('error', message);
    
    // Show error toast
    const toast = document.createElement('div');
    toast.className = 'error-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
  };
  
  const showSuccess = (message) => {
    const toast = document.createElement('div');
    toast.className = 'success-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
  };
  
  const addNotification = (type, message, data = {}) => {
    const notification = {
      id: `notif-${Date.now()}`,
      type,
      message,
      data,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    setNotifications(prev => [notification, ...prev.slice(0, 99)]); // Keep last 100
    setUnreadNotifications(prev => prev + 1);
    
    // Save to localStorage
    localStorage.setItem('bouwplaats_notifications', 
      JSON.stringify([notification, ...notifications.slice(0, 99)])
    );
    
    // Show system notification if permitted
    if (userSettings.notifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(t('app_name'), {
        body: message,
        icon: '/icons/icon-192x192.png',
        tag: type
      });
    }
    
    // Vibrate if enabled
    if (userSettings.vibration && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  };
  
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => prev.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
    setUnreadNotifications(prev => Math.max(0, prev - 1));
  };
  
  const clearNotifications = () => {
    setNotifications([]);
    setUnreadNotifications(0);
    localStorage.removeItem('bouwplaats_notifications');
  };
  
  const downloadFile = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const storeOfflineChange = (type, action, data) => {
    const change = {
      id: `offline-${Date.now()}`,
      type,
      action,
      data,
      timestamp: new Date().toISOString(),
      synced: false
    };
    
    // Store in IndexedDB or localStorage
    const offlineChanges = JSON.parse(localStorage.getItem('offline_changes') || '[]');
    offlineChanges.push(change);
    localStorage.setItem('offline_changes', JSON.stringify(offlineChanges));
    
    // Update offline sync status
    useOfflineSync.setState({ hasPendingChanges: true });
  };
  
  // Render functions for different view modes
  const renderDashboard = () => (
    <div className="dashboard-view">
      {/* Dashboard header with stats */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{t('welcome_back')}, {user.name}!</h1>
          <p>{t('project')}: <strong>{activeProject?.name}</strong></p>
          <div className="connection-status">
            <span className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
              <i className={`fas fa-${isOnline ? 'wifi' : 'wifi-slash'}`}></i>
              {isOnline ? t('online') : t('offline')}
            </span>
            <span className="location-status">
              <i className="fas fa-map-marker-alt"></i>
              {currentLocation.building || t('no_location')}
            </span>
          </div>
        </div>
        
        <div className="quick-stats">
          <div className="stat-card">
            <div className="stat-icon delivery">
              <i className="fas fa-clipboard-check"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{deliveryStats.open}</div>
              <div className="stat-label">{t('open_points')}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon planning">
              <i className="fas fa-tasks"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{planningStats.completed}/{dailyPlanning.length}</div>
              <div className="stat-label">{t('tasks_completed')}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon safety">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{safetyScore}%</div>
              <div className="stat-label">{t('safety_score')}</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon team">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-content">
              <div className="stat-value">{Object.keys(teamPresence).filter(id => teamPresence[id] === 'online').length}</div>
              <div className="stat-label">{t('team_online')}</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main dashboard content */}
      <div className="dashboard-content">
        {/* Left column */}
        <div className="dashboard-column">
          {/* Current task */}
          {currentTask && (
            <div className="dashboard-card current-task-card">
              <div className="card-header">
                <h3><i className="fas fa-play-circle"></i> {t('current_task')}</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setViewMode('planning')}>
                  {t('view_all')}
                </button>
              </div>
              <div className="task-info">
                <h4>{currentTask.name}</h4>
                <div className="task-details">
                  <span className="badge bg-primary">{currentTask.buildingNumber}</span>
                  <span className="badge bg-secondary">{currentTask.space}</span>
                  <span className="badge bg-info">{currentTask.estimatedHours}h</span>
                </div>
                <div className="task-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${currentTask.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{currentTask.progress || 0}%</span>
                </div>
                <div className="task-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={() => updateTaskProgress(currentTask.id, Math.min((currentTask.progress || 0) + 10, 100))}
                  >
                    <i className="fas fa-plus"></i> {t('update_progress')}
                  </button>
                  <button 
                    className="btn btn-success"
                    onClick={() => updateTaskProgress(currentTask.id, 100)}
                  >
                    <i className="fas fa-check"></i> {t('mark_complete')}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Quick actions */}
          <div className="dashboard-card quick-actions-card">
            <div className="card-header">
              <h3><i className="fas fa-bolt"></i> {t('quick_actions')}</h3>
            </div>
            <div className="quick-actions-grid">
              <button className="quick-action" onClick={() => setShowCamera(true)}>
                <div className="action-icon photo">
                  <i className="fas fa-camera"></i>
                </div>
                <span>{t('take_photo')}</span>
              </button>
              
              <button className="quick-action" onClick={() => setShowScanner(true)}>
                <div className="action-icon scan">
                  <i className="fas fa-qrcode"></i>
                </div>
                <span>{t('scan_material')}</span>
              </button>
              
              <button className="quick-action" onClick={() => setViewMode('delivery')}>
                <div className="action-icon delivery">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <span>{t('add_point')}</span>
              </button>
              
              <button className="quick-action" onClick={() => setActiveModal('safety_check')}>
                <div className="action-icon safety">
                  <i className="fas fa-clipboard-list"></i>
                </div>
                <span>{t('safety_check')}</span>
              </button>
              
              <button className="quick-action" onClick={() => startVoiceMessage()}>
                <div className="action-icon voice">
                  <i className="fas fa-microphone"></i>
                </div>
                <span>{t('voice_message')}</span>
              </button>
              
              <button className="quick-action" onClick={() => setActiveModal('ai_assistant')}>
                <div className="action-icon ai">
                  <i className="fas fa-robot"></i>
                </div>
                <span>{t('ask_ai')}</span>
              </button>
            </div>
          </div>
          
          {/* Recent photos */}
          {photos.length > 0 && (
            <div className="dashboard-card recent-photos-card">
              <div className="card-header">
                <h3><i className="fas fa-images"></i> {t('recent_photos')}</h3>
                <button className="btn btn-sm btn-outline" onClick={() => setViewMode('photos')}>
                  {t('view_all')}
                </button>
              </div>
              <div className="photos-grid">
                {photos.slice(0, 4).map(photo => (
                  <div key={photo.id} className="photo-thumbnail">
                    <img src={photo.dataUrl} alt={photo.context} />
                    <div className="photo-overlay">
                      <span className="photo-context">{photo.context}</span>
                      <span className="photo-time">
                        {new Date(photo.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Right column */}
        <div className="dashboard-column">
          {/* Delivery points overview */}
          <div className="dashboard-card delivery-overview-card">
            <div className="card-header">
              <h3><i className="fas fa-clipboard-check"></i> {t('delivery_overview')}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setViewMode('delivery')}>
                {t('view_all')}
              </button>
            </div>
            <div className="delivery-stats-overview">
              <div className="stat-item">
                <div className="stat-value open">{deliveryStats.open}</div>
                <div className="stat-label">{t('open')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value in-progress">{deliveryStats.inProgress}</div>
                <div className="stat-label">{t('in_progress')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value ready">{deliveryStats.ready}</div>
                <div className="stat-label">{t('ready')}</div>
              </div>
              <div className="stat-item">
                <div className="stat-value approved">{deliveryStats.approved}</div>
                <div className="stat-label">{t('approved')}</div>
              </div>
            </div>
            
            {deliveryPoints.slice(0, 3).map(point => (
              <div key={point.id} className="delivery-point-preview">
                <div className="point-header">
                  <span className="point-location">
                    <strong>{point.buildingNumber}</strong> • {point.space}
                  </span>
                  <span className={`status-badge ${point.status}`}>
                    {t(point.status)}
                  </span>
                </div>
                <p className="point-description">{point.description}</p>
                <div className="point-footer">
                  <small>{t('reported_by')}: {point.reportedBy}</small>
                  <small>{t('priority')}: {t(point.priority)}</small>
                </div>
              </div>
            ))}
          </div>
          
          {/* Team presence */}
          <div className="dashboard-card team-presence-card">
            <div className="card-header">
              <h3><i className="fas fa-users"></i> {t('team_presence')}</h3>
              <button className="btn btn-sm btn-outline" onClick={() => setViewMode('team')}>
                {t('chat')}
              </button>
            </div>
            <div className="team-list">
              {teamMembers.map(member => (
                <div key={member.id} className="team-member">
                  <div className="member-info">
                    <div className="member-avatar">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} />
                      ) : (
                        <div className="avatar-placeholder">{member.name.charAt(0)}</div>
                      )}
                      <div className={`presence-dot ${teamPresence[member.id] || 'offline'}`}></div>
                    </div>
                    <div className="member-details">
                      <strong>{member.name}</strong>
                      <span className="member-role">{member.role}</span>
                    </div>
                  </div>
                  <div className="member-location">
                    <small>{member.currentLocation || t('location_unknown')}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* AI suggestions */}
          {aiSuggestions.length > 0 && (
            <div className="dashboard-card ai-suggestions-card">
              <div className="card-header">
                <h3><i className="fas fa-lightbulb"></i> {t('ai_suggestions')}</h3>
              </div>
              <div className="suggestions-list">
                {aiSuggestions.slice(0, 3).map((suggestion, index) => (
                  <div key={index} className="suggestion-item">
                    <i className="fas fa-robot suggestion-icon"></i>
                    <p className="suggestion-text">{suggestion}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
  
  // Render other view modes...
  const renderDeliveryView = () => (
    <DeliveryPointsManager
      projectId={activeProject?.id}
      deliveryPoints={deliveryPoints}
      buildingNumbers={buildingNumbers}
      spaces={spaces}
      filters={deliveryFilters}
      onAddPoint={addDeliveryPoint}
      onUpdatePoint={updateDeliveryPoint}
      onDeletePoint={deleteDeliveryPoint}
      onAddPhoto={addPhotoToDeliveryPoint}
      onFilterChange={setDeliveryFilters}
      onGenerateReport={generateReport}
      t={t}
    />
  );
  
  const renderPlanningView = () => (
    <PlanningIntegration
      projectId={activeProject?.id}
      dailyPlanning={dailyPlanning}
      weeklyPlanning={weeklyPlanning}
      currentTask={currentTask}
      buildingNumbers={buildingNumbers}
      spaces={spaces}
      teamMembers={teamMembers}
      onStartTask={startTask}
      onUpdateProgress={updateTaskProgress}
      onReportDelay={reportTaskDelay}
      onGenerateReport={generateReport}
      t={t}
    />
  );
  
  const renderSafetyView = () => (
    <SafetyInspector
      projectId={activeProject?.id}
      safetyChecks={safetyChecks}
      safetyIncidents={safetyIncidents}
      ppeStatus={ppeStatus}
      safetyScore={safetyScore}
      location={currentLocation}
      onPerformCheck={performSafetyCheck}
      onReportIncident={reportSafetyIncident}
      onGenerateReport={generateReport}
      t={t}
    />
  );
  
  // Main render
  return (
    <>
      <Head>
        <title>{t('app_name')} - {activeProject?.name || t('no_project')}</title>
        <meta name="description" content={t('app_description')} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="theme-color" content="#1a5f7a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </Head>
      
      {/* App container */}
      <div className={`app-container ${isFullscreen ? 'fullscreen' : ''} ${userSettings.darkMode ? 'dark-mode' : ''}`}>
        {/* Top navigation */}
        <header className="app-header">
          <div className="header-left">
            <button 
              className="menu-toggle"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <i className="fas fa-bars"></i>
            </button>
            
            <div className="project-selector">
              <select 
                className="project-select"
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setActiveProject(project);
                }}
              >
                <option value="">{t('select_project')}</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="header-center">
            <div className="view-selector">
              <button 
                className={`view-btn ${viewMode === 'dashboard' ? 'active' : ''}`}
                onClick={() => setViewMode('dashboard')}
              >
                <i className="fas fa-home"></i>
                <span>{t('dashboard')}</span>
              </button>
              
              <button 
                className={`view-btn ${viewMode === 'delivery' ? 'active' : ''}`}
                onClick={() => setViewMode('delivery')}
              >
                <i className="fas fa-clipboard-check"></i>
                <span>{t('delivery')}</span>
              </button>
              
              <button 
                className={`view-btn ${viewMode === 'planning' ? 'active' : ''}`}
                onClick={() => setViewMode('planning')}
              >
                <i className="fas fa-tasks"></i>
                <span>{t('planning')}</span>
              </button>
              
              <button 
                className={`view-btn ${viewMode === 'safety' ? 'active' : ''}`}
                onClick={() => setViewMode('safety')}
              >
                <i className="fas fa-shield-alt"></i>
                <span>{t('safety')}</span>
              </button>
              
              <button 
                className={`view-btn ${viewMode === 'materials' ? 'active' : ''}`}
                onClick={() => setViewMode('materials')}
              >
                <i className="fas fa-boxes"></i>
                <span>{t('materials')}</span>
              </button>
            </div>
          </div>
          
          <div className="header-right">
            <div className="search-box">
              <input 
                type="text" 
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <i className="fas fa-search"></i>
            </div>
            
            <button 
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <i className="fas fa-bell"></i>
              {unreadNotifications > 0 && (
                <span className="notification-badge">{unreadNotifications}</span>
              )}
            </button>
            
            <button 
              className="fullscreen-btn"
              onClick={() => setIsFullscreen(!isFullscreen)}
            >
              <i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}></i>
            </button>
            
            <div className="user-menu">
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <div className="avatar-placeholder">{user.name.charAt(0)}</div>
                )}
              </div>
              <div className="user-info">
                <strong>{user.name}</strong>
                <small>{user.role}</small>
              </div>
              <button className="menu-dropdown">
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          </div>
        </header>
        
        {/* Sidebar */}
        <aside className={`app-sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <h3><i className="fas fa-hard-hat"></i> {t('app_name')}</h3>
            <button className="sidebar-close" onClick={() => setIsSidebarOpen(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="sidebar-content">
            <nav className="sidebar-nav">
              <div className="nav-section">
                <h4>{t('project_tools')}</h4>
                <ul>
                  <li className={viewMode === 'dashboard' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('dashboard'); }}>
                      <i className="fas fa-home"></i>
                      <span>{t('dashboard')}</span>
                    </a>
                  </li>
                  <li className={viewMode === 'delivery' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('delivery'); }}>
                      <i className="fas fa-clipboard-check"></i>
                      <span>{t('delivery_points')}</span>
                      {deliveryStats.open > 0 && (
                        <span className="nav-badge">{deliveryStats.open}</span>
                      )}
                    </a>
                  </li>
                  <li className={viewMode === 'planning' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('planning'); }}>
                      <i className="fas fa-tasks"></i>
                      <span>{t('planning')}</span>
                    </a>
                  </li>
                  <li className={viewMode === 'safety' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('safety'); }}>
                      <i className="fas fa-shield-alt"></i>
                      <span>{t('safety')}</span>
                    </a>
                  </li>
                  <li className={viewMode === 'quality' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('quality'); }}>
                      <i className="fas fa-award"></i>
                      <span>{t('quality')}</span>
                    </a>
                  </li>
                  <li className={viewMode === 'materials' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('materials'); }}>
                      <i className="fas fa-boxes"></i>
                      <span>{t('materials')}</span>
                      {inventoryAlerts.length > 0 && (
                        <span className="nav-badge alert">{inventoryAlerts.length}</span>
                      )}
                    </a>
                  </li>
                  <li className={viewMode === 'photos' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('photos'); }}>
                      <i className="fas fa-camera"></i>
                      <span>{t('photos')}</span>
                      <span className="nav-badge">{photos.length}</span>
                    </a>
                  </li>
                  <li className={viewMode === 'documents' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('documents'); }}>
                      <i className="fas fa-file-alt"></i>
                      <span>{t('documents')}</span>
                    </a>
                  </li>
                  <li className={viewMode === 'bim' ? 'active' : ''}>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('bim'); }}>
                      <i className="fas fa-cube"></i>
                      <span>{t('bim_viewer')}</span>
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="nav-section">
                <h4>{t('communication')}</h4>
                <ul>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setViewMode('team'); }}>
                      <i className="fas fa-users"></i>
                      <span>{t('team_chat')}</span>
                      <span className="nav-badge">{teamChat.filter(m => !m.readBy?.includes(user.id)).length}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('ai_assistant'); }}>
                      <i className="fas fa-robot"></i>
                      <span>{t('ai_assistant')}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('report_issue'); }}>
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>{t('report_issue')}</span>
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="nav-section">
                <h4>{t('reports_export')}</h4>
                <ul>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); generateReport('daily_report'); }}>
                      <i className="fas fa-file-pdf"></i>
                      <span>{t('daily_report')}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); generateReport('delivery_report'); }}>
                      <i className="fas fa-clipboard-list"></i>
                      <span>{t('delivery_report')}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); generateReport('safety_report'); }}>
                      <i className="fas fa-shield-alt"></i>
                      <span>{t('safety_report')}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); generateReport('quality_report'); }}>
                      <i className="fas fa-chart-line"></i>
                      <span>{t('quality_report')}</span>
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className="nav-section">
                <h4>{t('settings')}</h4>
                <ul>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('settings'); }}>
                      <i className="fas fa-cog"></i>
                      <span>{t('app_settings')}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); setActiveModal('profile'); }}>
                      <i className="fas fa-user"></i>
                      <span>{t('profile')}</span>
                    </a>
                  </li>
                  <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>{t('logout')}</span>
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
            
            <div className="sidebar-footer">
              <div className="connection-status">
                <div className={`status-indicator ${isOnline ? 'online' : 'offline'}`}>
                  <i className={`fas fa-${isOnline ? 'wifi' : 'wifi-slash'}`}></i>
                  {isOnline ? t('online') : t('offline')}
                </div>
                {!isOnline && hasPendingChanges && (
                  <div className="sync-status">
                    <i className="fas fa-sync-alt"></i>
                    <span>{t('pending_sync')}</span>
                  </div>
                )}
              </div>
              
              <div className="location-status">
                <i className="fas fa-map-marker-alt"></i>
                <span>{currentLocation.building || t('no_location')}</span>
              </div>
              
              <div className="battery-status">
                <i className="fas fa-battery-three-quarters"></i>
                <span>78%</span>
              </div>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="app-main">
          {/* Loading overlay */}
          {isLoading && (
            <div className="loading-overlay">
              <div className="loading-spinner">
                <i className="fas fa-hard-hat fa-spin"></i>
              </div>
              <p>{t('loading')}</p>
            </div>
          )}
          
          {/* Sync progress */}
          {syncProgress > 0 && syncProgress < 100 && (
            <div className="sync-progress">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${syncProgress}%` }}></div>
              </div>
              <span>{t('syncing')} {syncProgress}%</span>
            </div>
          )}
          
          {/* View content */}
          <div className="view-content">
            {viewMode === 'dashboard' && renderDashboard()}
            {viewMode === 'delivery' && renderDeliveryView()}
            {viewMode === 'planning' && renderPlanningView()}
            {viewMode === 'safety' && renderSafetyView()}
            {/* Add other view modes */}
          </div>
          
          {/* Quick actions floating button */}
          {!showQuickActions && (
            <button 
              className="quick-actions-fab"
              onClick={() => setShowQuickActions(true)}
            >
              <i className="fas fa-plus"></i>
            </button>
          )}
          
          {/* Quick actions menu */}
          {showQuickActions && (
            <div className="quick-actions-menu">
              <div className="quick-actions-header">
                <h4>{t('quick_actions')}</h4>
                <button className="close-actions" onClick={() => setShowQuickActions(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="quick-actions-grid">
                <button className="quick-action" onClick={() => { setShowCamera(true); setShowQuickActions(false); }}>
                  <div className="action-icon">
                    <i className="fas fa-camera"></i>
                  </div>
                  <span>{t('take_photo')}</span>
                </button>
                
                <button className="quick-action" onClick={() => { setShowScanner(true); setShowQuickActions(false); }}>
                  <div className="action-icon">
                    <i className="fas fa-qrcode"></i>
                  </div>
                  <span>{t('scan_code')}</span>
                </button>
                
                <button className="quick-action" onClick={() => { setActiveModal('add_delivery_point'); setShowQuickActions(false); }}>
                  <div className="action-icon">
                    <i className="fas fa-clipboard-check"></i>
                  </div>
                  <span>{t('add_point')}</span>
                </button>
                
                <button className="quick-action" onClick={() => { setActiveModal('safety_check'); setShowQuickActions(false); }}>
                  <div className="action-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <span>{t('safety_check')}</span>
                </button>
                
                <button className="quick-action" onClick={() => { setActiveModal('report_issue'); setShowQuickActions(false); }}>
                  <div className="action-icon">
                    <i className="fas fa-exclamation-triangle"></i>
                  </div>
                  <span>{t('report_issue')}</span>
                </button>
                
                <button className="quick-action" onClick={() => { startVoiceMessage(); setShowQuickActions(false); }}>
                  <div className="action-icon">
                    <i className="fas fa-microphone"></i>
                  </div>
                  <span>{t('voice_note')}</span>
                </button>
              </div>
            </div>
          )}
        </main>
        
        {/* Notifications panel */}
        {showNotifications && (
          <div className="notifications-panel">
            <div className="notifications-header">
              <h3><i className="fas fa-bell"></i> {t('notifications')}</h3>
              <div className="notifications-actions">
                <button className="btn btn-sm btn-outline" onClick={markAllAsRead}>
                  {t('mark_all_read')}
                </button>
                <button className="btn btn-sm btn-outline" onClick={clearNotifications}>
                  {t('clear_all')}
                </button>
              </div>
            </div>
            
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <i className="fas fa-check-circle"></i>
                  <p>{t('no_notifications')}</p>
                </div>
              ) : (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      <i className={`fas fa-${getNotificationIcon(notification.type)}`}></i>
                    </div>
                    <div className="notification-content">
                      <p className="notification-message">{notification.message}</p>
                      <small className="notification-time">
                        {new Date(notification.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </small>
                    </div>
                    {!notification.read && <div className="unread-dot"></div>}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        {/* Emergency button */}
        <button className="emergency-button" onClick={handleEmergency}>
          <i className="fas fa-phone-alt"></i>
          <span>{t('emergency')}</span>
        </button>
        
        {/* Modals */}
        {activeModal === 'camera' && (
          <div className="modal-overlay">
            <div className="modal camera-modal">
              <div className="modal-header">
                <h3><i className="fas fa-camera"></i> {t('take_photo')}</h3>
                <button className="modal-close" onClick={() => setActiveModal(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="camera-preview">
                  <video 
                    ref={cameraRef}
                    autoPlay
                    playsInline
                  ></video>
                </div>
                <div className="camera-controls">
                  <button className="btn btn-primary" onClick={capturePhoto}>
                    <i className="fas fa-camera"></i> {t('capture')}
                  </button>
                  <button className="btn btn-outline" onClick={() => setActiveModal(null)}>
                    {t('cancel')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeModal === 'scanner' && (
          <div className="modal-overlay">
            <div className="modal scanner-modal">
              <div className="modal-header">
                <h3><i className="fas fa-qrcode"></i> {t('scan_code')}</h3>
                <button className="modal-close" onClick={() => setActiveModal(null)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <MaterialScanner
                  ref={scannerRef}
                  onScan={scanMaterial}
                  onClose={() => setActiveModal(null)}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Add other modals as needed */}
        
        {/* PWA install prompt */}
        <div id="install-prompt" className="install-prompt">
          <div className="prompt-content">
            <i className="fas fa-download"></i>
            <div className="prompt-text">
              <h4>{t('install_app')}</h4>
              <p>{t('install_description')}</p>
            </div>
            <div className="prompt-actions">
              <button className="btn btn-outline" onClick={hideInstallPromotion}>
                {t('not_now')}
              </button>
              <button className="btn btn-primary" onClick={installPWA}>
                {t('install')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Global styles */}
      <style jsx global>{`
        /* Complete CSS styles - Over 1500 lines */
        /* This would include all the CSS from previous versions plus new styles */
        /* Due to length, I'm showing structure but actual CSS would be here */
        
        :root {
          /* Color variables */
          --primary: #1a5f7a;
          --secondary: #57c5b6;
          --accent: #f24c3d;
          --light: #f8f9fa;
          --dark: #343a40;
          --gray: #6c757d;
          --success: #28a745;
          --warning: #ffc107;
          --danger: #dc3545;
          --info: #17a2b8;
          --purple: #6f42c1;
          --pink: #e83e8c;
          --orange: #fd7e14;
          --teal: #20c997;
          --cyan: #0dcaf0;
          --indigo: #6610f2;
          
          /* Spacing */
          --spacing-xs: 4px;
          --spacing-sm: 8px;
          --spacing-md: 16px;
          --spacing-lg: 24px;
          --spacing-xl: 32px;
          --spacing-xxl: 48px;
          
          /* Border radius */
          --radius-sm: 4px;
          --radius-md: 8px;
          --radius-lg: 12px;
          --radius-xl: 16px;
          --radius-round: 50%;
          
          /* Shadows */
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.12);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
          --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
          --shadow-xl: 0 20px 40px rgba(0,0,0,0.15);
          
          /* Transitions */
          --transition-fast: 150ms ease;
          --transition-normal: 300ms ease;
          --transition-slow: 500ms ease;
          
          /* Z-index layers */
          --z-dropdown: 1000;
          --z-sticky: 1020;
          --z-fixed: 1030;
          --z-modal-backdrop: 1040;
          --z-modal: 1050;
          --z-popover: 1060;
          --z-tooltip: 1070;
          --z-toast: 1080;
        }
        
        /* Dark mode variables */
        .dark-mode {
          --primary: #2c8db5;
          --secondary: #6ed4c3;
          --light: #212529;
          --dark: #f8f9fa;
          --gray: #adb5bd;
          --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
          --shadow-md: 0 4px 6px rgba(0,0,0,0.25);
          --shadow-lg: 0 10px 25px rgba(0,0,0,0.25);
        }
        
        /* Base styles */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        html {
          font-size: 16px;
          height: 100%;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: var(--dark);
          background-color: var(--light);
          height: 100%;
          overflow-x: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        /* App container */
        .app-container {
          display: flex;
          flex-direction: column;
          height: 100vh;
          width: 100vw;
          position: relative;
          transition: background-color var(--transition-normal);
        }
        
        .app-container.fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: var(--z-modal);
        }
        
        /* Header */
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-md) var(--spacing-lg);
          background-color: white;
          box-shadow: var(--shadow-sm);
          z-index: var(--z-fixed);
          position: sticky;
          top: 0;
          transition: all var(--transition-normal);
        }
        
        .dark-mode .app-header {
          background-color: #2d3748;
          color: white;
        }
        
        .header-left,
        .header-center,
        .header-right {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .menu-toggle {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: var(--primary);
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-round);
          transition: background-color var(--transition-fast);
        }
        
        .menu-toggle:hover {
          background-color: rgba(26, 95, 122, 0.1);
        }
        
        .project-select {
          padding: var(--spacing-sm) var(--spacing-md);
          border: 1px solid var(--gray);
          border-radius: var(--radius-md);
          background-color: white;
          color: var(--dark);
          font-weight: 500;
          min-width: 200px;
          cursor: pointer;
        }
        
        .dark-mode .project-select {
          background-color: #4a5568;
          color: white;
          border-color: #718096;
        }
        
        .view-selector {
          display: flex;
          gap: var(--spacing-xs);
          background-color: var(--light);
          padding: var(--spacing-xs);
          border-radius: var(--radius-lg);
        }
        
        .view-btn {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          border: none;
          background: none;
          color: var(--gray);
          cursor: pointer;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          font-weight: 500;
        }
        
        .view-btn:hover {
          background-color: rgba(26, 95, 122, 0.1);
          color: var(--primary);
        }
        
        .view-btn.active {
          background-color: var(--primary);
          color: white;
          box-shadow: var(--shadow-sm);
        }
        
        .search-box {
          position: relative;
        }
        
        .search-box input {
          padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) var(--spacing-xl);
          border: 1px solid var(--gray);
          border-radius: var(--radius-md);
          background-color: white;
          color: var(--dark);
          width: 200px;
        }
        
        .search-box i {
          position: absolute;
          left: var(--spacing-md);
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray);
        }
        
        .notification-btn {
          position: relative;
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--gray);
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-round);
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background-color: var(--danger);
          color: white;
          font-size: 0.75rem;
          padding: 2px 6px;
          border-radius: var(--radius-round);
          min-width: 18px;
          text-align: center;
        }
        
        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-md);
          transition: background-color var(--transition-fast);
        }
        
        .user-menu:hover {
          background-color: rgba(26, 95, 122, 0.1);
        }
        
        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-round);
          overflow: hidden;
        }
        
        .user-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background-color: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 1.2rem;
        }
        
        /* Sidebar */
        .app-sidebar {
          position: fixed;
          top: 0;
          left: -300px;
          width: 300px;
          height: 100vh;
          background-color: white;
          box-shadow: var(--shadow-lg);
          z-index: var(--z-modal);
          transition: left var(--transition-normal);
          display: flex;
          flex-direction: column;
        }
        
        .app-sidebar.open {
          left: 0;
        }
        
        .dark-mode .app-sidebar {
          background-color: #2d3748;
          color: white;
        }
        
        .sidebar-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--gray);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        
        .sidebar-close {
          background: none;
          border: none;
          font-size: 1.25rem;
          color: var(--gray);
          cursor: pointer;
          padding: var(--spacing-sm);
          border-radius: var(--radius-round);
        }
        
        .sidebar-content {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-md);
        }
        
        .nav-section {
          margin-bottom: var(--spacing-xl);
        }
        
        .nav-section h4 {
          color: var(--gray);
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: var(--spacing-md);
          padding-left: var(--spacing-sm);
        }
        
        .sidebar-nav ul {
          list-style: none;
        }
        
        .sidebar-nav li {
          margin-bottom: var(--spacing-xs);
        }
        
        .sidebar-nav a {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--dark);
          text-decoration: none;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }
        
        .dark-mode .sidebar-nav a {
          color: white;
        }
        
        .sidebar-nav a:hover {
          background-color: rgba(26, 95, 122, 0.1);
        }
        
        .sidebar-nav li.active a {
          background-color: var(--primary);
          color: white;
        }
        
        .nav-badge {
          margin-left: auto;
          background-color: var(--primary);
          color: white;
          font-size: 0.75rem;
          padding: 2px 8px;
          border-radius: var(--radius-round);
          min-width: 20px;
          text-align: center;
        }
        
        .nav-badge.alert {
          background-color: var(--danger);
        }
        
        /* Main content */
        .app-main {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
          position: relative;
        }
        
        /* Dashboard styles */
        .dashboard-view {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--spacing-lg);
        }
        
        .welcome-section h1 {
          font-size: 2rem;
          margin-bottom: var(--spacing-sm);
          color: var(--primary);
        }
        
        .connection-status {
          display: flex;
          gap: var(--spacing-lg);
          margin-top: var(--spacing-md);
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          border-radius: var(--radius-md);
          font-weight: 500;
        }
        
        .status-indicator.online {
          background-color: rgba(40, 167, 69, 0.1);
          color: var(--success);
        }
        
        .status-indicator.offline {
          background-color: rgba(220, 53, 69, 0.1);
          color: var(--danger);
        }
        
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
          min-width: 600px;
        }
        
        .stat-card {
          background-color: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-md);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          box-shadow: var(--shadow-sm);
          transition: transform var(--transition-fast), box-shadow var(--transition-fast);
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        
        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        
        .stat-icon.delivery {
          background-color: rgba(87, 197, 182, 0.1);
          color: var(--secondary);
        }
        
        .stat-icon.planning {
          background-color: rgba(23, 162, 184, 0.1);
          color: var(--info);
        }
        
        .stat-icon.safety {
          background-color: rgba(255, 193, 7, 0.1);
          color: var(--warning);
        }
        
        .stat-icon.team {
          background-color: rgba(108, 117, 125, 0.1);
          color: var(--gray);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--dark);
        }
        
        .stat-label {
          font-size: 0.875rem;
          color: var(--gray);
        }
        
        /* Dashboard content layout */
        .dashboard-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: var(--spacing-lg);
        }
        
        .dashboard-column {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }
        
        .dashboard-card {
          background-color: white;
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          box-shadow: var(--shadow-sm);
        }
        
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }
        
        .card-header h3 {
          font-size: 1.25rem;
          color: var(--primary);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
        
        /* Quick actions grid */
        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-md);
        }
        
        .quick-action {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-lg) var(--spacing-md);
          background: none;
          border: 1px solid var(--gray);
          border-radius: var(--radius-lg);
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        
        .quick-action:hover {
          background-color: var(--primary);
          color: white;
          border-color: var(--primary);
          transform: translateY(-2px);
        }
        
        .action-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-round);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          margin-bottom: var(--spacing-sm);
        }
        
        .action-icon.photo { background-color: rgba(220, 53, 69, 0.1); color: var(--danger); }
        .action-icon.scan { background-color: rgba(111, 66, 193, 0.1); color: var(--purple); }
        .action-icon.delivery { background-color: rgba(87, 197, 182, 0.1); color: var(--secondary); }
        .action-icon.safety { background-color: rgba(255, 193, 7, 0.1); color: var(--warning); }
        .action-icon.voice { background-color: rgba(32, 201, 151, 0.1); color: var(--teal); }
        .action-icon.ai { background-color: rgba(253, 126, 20, 0.1); color: var(--orange); }
        
        .quick-action:hover .action-icon {
          background-color: white;
          color: var(--primary);
        }
        
        /* Photos grid */
        .photos-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-md);
        }
        
        .photo-thumbnail {
          position: relative;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
        }
        
        .photo-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-normal);
        }
        
        .photo-thumbnail:hover img {
          transform: scale(1.05);
        }
        
        .photo-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0,0,0,0.7));
          color: white;
          padding: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }
        
        /* Delivery overview */
        .delivery-stats-overview {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
        }
        
        .stat-item {
          text-align: center;
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          background-color: var(--light);
        }
        
        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: var(--spacing-xs);
        }
        
        .stat-value.open { color: var(--warning); }
        .stat-value.in-progress { color: var(--info); }
        .stat-value.ready { color: var(--secondary); }
        .stat-value.approved { color: var(--success); }
        
        .delivery-point-preview {
          padding: var(--spacing-md);
          border: 1px solid var(--gray);
          border-radius: var(--radius-md);
          margin-bottom: var(--spacing-md);
        }
        
        .point-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-sm);
        }
        
        .status-badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-round);
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .status-badge.open { background-color: rgba(255, 193, 7, 0.1); color: #856404; }
        .status-badge.in_progress { background-color: rgba(23, 162, 184, 0.1); color: #0c5460; }
        .status-badge.ready { background-color: rgba(87, 197, 182, 0.1); color: #155724; }
        .status-badge.approved { background-color: rgba(40, 167, 69, 0.1); color: #155724; }
        
        /* Team list */
        .team-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .team-member {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          border: 1px solid var(--gray);
          border-radius: var(--radius-md);
        }
        
        .member-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
        }
        
        .member-avatar {
          position: relative;
          width: 50px;
          height: 50px;
        }
        
        .presence-dot {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 12px;
          height: 12px;
          border-radius: var(--radius-round);
          border: 2px solid white;
        }
        
        .presence-dot.online { background-color: var(--success); }
        .presence-dot.offline { background-color: var(--gray); }
        .presence-dot.away { background-color: var(--warning); }
        
        /* AI suggestions */
        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }
        
        .suggestion-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border: 1px solid var(--gray);
          border-radius: var(--radius-md);
        }
        
        .suggestion-icon {
          color: var(--orange);
          font-size: 1.25rem;
          margin-top: 2px;
        }
        
        /* Quick actions FAB */
        .quick-actions-fab {
          position: fixed;
          bottom: var(--spacing-xl);
          right: var(--spacing-xl);
          width: 60px;
          height: 60px;
          border-radius: var(--radius-round);
          background-color: var(--primary);
          color: white;
          border: none;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          z-index: var(--z-fixed);
          transition: all var(--transition-normal);
        }
        
        .quick-actions-fab:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-xl);
        }
        
        /* Quick actions menu */
        .quick-actions-menu {
          position: fixed;
          bottom: calc(60px + var(--spacing-xl) + var(--spacing-md));
          right: var(--spacing-xl);
          width: 300px;
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: var(--z-fixed);
          padding: var(--spacing-md);
        }
        
        .quick-actions-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-md);
        }
        
        /* Notifications panel */
        .notifications-panel {
          position: fixed;
          top: 80px;
          right: var(--spacing-lg);
          width: 400px;
          max-height: 600px;
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          z-index: var(--z-modal);
          display: flex;
          flex-direction: column;
        }
        
        .notifications-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--gray);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .notifications-list {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-md);
        }
        
        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: background-color var(--transition-fast);
          position: relative;
        }
        
        .notification-item:hover {
          background-color: var(--light);
        }
        
        .notification-item.unread {
          background-color: rgba(26, 95, 122, 0.05);
        }
        
        .unread-dot {
          position: absolute;
          top: var(--spacing-md);
          right: var(--spacing-md);
          width: 8px;
          height: 8px;
          border-radius: var(--radius-round);
          background-color: var(--danger);
        }
        
        /* Emergency button */
        .emergency-button {
          position: fixed;
          bottom: var(--spacing-xl);
          left: var(--spacing-xl);
          background: linear-gradient(135deg, var(--danger), #b21f2d);
          color: white;
          border: none;
          padding: var(--spacing-md) var(--spacing-lg);
          border-radius: var(--radius-lg);
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-weight: bold;
          z-index: var(--z-fixed);
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
          100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
        }
        
        /* Modals */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal-backdrop);
        }
        
        .modal {
          background-color: white;
          border-radius: var(--radius-lg);
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        
        .modal-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid var(--gray);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: var(--spacing-lg);
        }
        
        /* Camera modal */
        .camera-preview {
          width: 100%;
          aspect-ratio: 4/3;
          background-color: black;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: var(--spacing-lg);
        }
        
        .camera-preview video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .camera-controls {
          display: flex;
          justify-content: center;
          gap: var(--spacing-lg);
        }
        
        /* Install prompt */
        .install-prompt {
          position: fixed;
          bottom: var(--spacing-xl);
          left: 50%;
          transform: translateX(-50%);
          background-color: white;
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          padding: var(--spacing-lg);
          z-index: var(--z-toast);
          display: none;
        }
        
        .install-prompt.show {
          display: block;
        }
        
        .prompt-content {
          display: flex;
          align-items: center;
          gap: var(--spacing-lg);
        }
        
        .prompt-content i {
          font-size: 2rem;
          color: var(--primary);
        }
        
        .prompt-actions {
          display: flex;
          gap: var(--spacing-md);
          margin-top: var(--spacing-md);
        }
        
        /* Loading states */
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255,255,255,0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: var(--z-modal);
        }
        
        .loading-spinner {
          font-size: 3rem;
          color: var(--primary);
          margin-bottom: var(--spacing-lg);
        }
        
        .sync-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background-color: var(--primary);
          color: white;
          padding: var(--spacing-sm);
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          z-index: var(--z-toast);
        }
        
        /* Responsive design */
        @media (max-width: 1200px) {
          .dashboard-content {
            grid-template-columns: 1fr;
          }
          
          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
            min-width: auto;
          }
        }
        
        @media (max-width: 768px) {
          .app-header {
            flex-direction: column;
            gap: var(--spacing-md);
            padding: var(--spacing-md);
          }
          
          .header-center {
            order: 3;
            width: 100%;
          }
          
          .view-selector {
            overflow-x: auto;
            padding: var(--spacing-xs);
          }
          
          .quick-stats {
            grid-template-columns: 1fr;
          }
          
          .quick-actions-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-header {
            flex-direction: column;
          }
          
          .notifications-panel {
            width: calc(100vw - var(--spacing-lg) * 2);
            right: var(--spacing-lg);
            left: var(--spacing-lg);
          }
          
          .emergency-button {
            bottom: var(--spacing-md);
            left: var(--spacing-md);
          }
          
          .quick-actions-fab {
            bottom: var(--spacing-md);
            right: var(--spacing-md);
          }
        }
        
        @media (max-width: 480px) {
          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
          
          .photos-grid {
            grid-template-columns: 1fr;
          }
          
          .delivery-stats-overview {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .modal {
            width: 95vw;
          }
        }
        
        /* Utility classes */
        .btn {
          padding: var(--spacing-sm) var(--spacing-md);
          border: none;
          border-radius: var(--radius-md);
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
        }
        
        .btn-primary {
          background-color: var(--primary);
          color: white;
        }
        
        .btn-primary:hover {
          background-color: #144b60;
          transform: translateY(-1px);
        }
        
        .btn-success {
          background-color: var(--success);
          color: white;
        }
        
        .btn-warning {
          background-color: var(--warning);
          color: var(--dark);
        }
        
        .btn-danger {
          background-color: var(--danger);
          color: white;
        }
        
        .btn-outline {
          background-color: transparent;
          border: 1px solid var(--gray);
          color: var(--dark);
        }
        
        .btn-outline:hover {
          background-color: var(--light);
        }
        
        .btn-sm {
          padding: var(--spacing-xs) var(--spacing-sm);
          font-size: 0.875rem;
        }
        
        .badge {
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-round);
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .bg-primary { background-color: var(--primary); color: white; }
        .bg-secondary { background-color: var(--secondary); color: white; }
        .bg-success { background-color: var(--success); color: white; }
        .bg-warning { background-color: var(--warning); color: var(--dark); }
        .bg-danger { background-color: var(--danger); color: white; }
        .bg-info { background-color: var(--info); color: white; }
        
        .text-muted { color: var(--gray); }
        .text-primary { color: var(--primary); }
        .text-success { color: var(--success); }
        .text-danger { color: var(--danger); }
        
        .d-flex { display: flex; }
        .flex-column { flex-direction: column; }
        .align-items-center { align-items: center; }
        .justify-content-between { justify-content: space-between; }
        .gap-1 { gap: var(--spacing-sm); }
        .gap-2 { gap: var(--spacing-md); }
        .gap-3 { gap: var(--spacing-lg); }
        
        .w-100 { width: 100%; }
        .h-100 { height: 100%; }
        
        .mt-1 { margin-top: var(--spacing-sm); }
        .mt-2 { margin-top: var(--spacing-md); }
        .mt-3 { margin-top: var(--spacing-lg); }
        
        .mb-1 { margin-bottom: var(--spacing-sm); }
        .mb-2 { margin-bottom: var(--spacing-md); }
        .mb-3 { margin-bottom: var(--spacing-lg); }
        
        .p-1 { padding: var(--spacing-sm); }
        .p-2 { padding: var(--spacing-md); }
        .p-3 { padding: var(--spacing-lg); }
        
        .shadow-sm { box-shadow: var(--shadow-sm); }
        .shadow-md { box-shadow: var(--shadow-md); }
        .shadow-lg { box-shadow: var(--shadow-lg); }
        
        .rounded { border-radius: var(--radius-md); }
        .rounded-lg { border-radius: var(--radius-lg); }
        .rounded-circle { border-radius: var(--radius-round); }
        
        /* Scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background-color: var(--light);
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: var(--gray);
          border-radius: var(--radius-round);
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: var(--dark);
        }
        
        /* Print styles */
        @media print {
          .app-header,
          .app-sidebar,
          .emergency-button,
          .quick-actions-fab {
            display: none !important;
          }
          
          .app-main {
            padding: 0;
          }
        }
      `}</style>
    </>
  );
}
