// Frontend/services/api.js
import axios from 'axios';

// API configuratie
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const API_VERSION = 'v2'; // Gebruik de nieuwe portal API

// Axios instance met default config
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000, // 30 seconden timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor voor auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('portal_token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Voeg timestamp toe voor cache busting
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now()
      };
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor voor error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log succesvolle API calls in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Log errors
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data
    });

    // Handle specifieke error codes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expired, redirect naar login
          localStorage.removeItem('portal_token');
          window.dispatchEvent(new Event('token_expired'));
          break;
          
        case 403:
          // Toegang geweigerd
          window.dispatchEvent(new CustomEvent('access_denied', { 
            detail: data.error || 'Geen toegang' 
          }));
          break;
          
        case 404:
          // Resource niet gevonden
          console.warn('Resource niet gevonden:', error.config.url);
          break;
          
        case 429:
          // Rate limit
          alert('Te veel aanvragen. Probeer het later opnieuw.');
          break;
          
        case 500:
          // Server error
          window.dispatchEvent(new CustomEvent('server_error', {
            detail: data.error || 'Server fout'
          }));
          break;
      }
    }

    // Network error
    if (error.code === 'ECONNABORTED') {
      window.dispatchEvent(new CustomEvent('network_error', {
        detail: 'Server is niet bereikbaar. Controleer uw internetverbinding.'
      }));
    }

    return Promise.reject(error);
  }
);

/**
 * HEALTH & STATUS
 */
export const checkApiHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    return { status: 'unhealthy', error: error.message };
  }
};

export const pingApi = async () => {
  const response = await axios.get(`${API_BASE_URL}/ping`);
  return response.data;
};

/**
 * AUTHENTICATIE
 */
export const login = async (email, password) => {
  const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
    email,
    password
  });
  
  if (response.data.token) {
    localStorage.setItem('portal_token', response.data.token);
    apiClient.defaults.headers.Authorization = `Bearer ${response.data.token}`;
  }
  
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('portal_token');
  delete apiClient.defaults.headers.Authorization;
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/me');
    return response.data;
  } catch (error) {
    // Als niet geauthenticeerd, return null
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const validatePortalToken = async (projectId, token) => {
  const response = await apiClient.post(`/projects/${projectId}/validate-token`, { token });
  return response.data;
};

/**
 * PROJECTEN
 */
export const fetchProjects = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });
  
  const queryString = params.toString();
  const url = queryString ? `/projects?${queryString}` : '/projects';
  
  const response = await apiClient.get(url);
  return response.data;
};

export const fetchProjectDetails = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}`);
  return response.data;
};

export const fetchPortalData = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/portal`);
  return response.data.portalData;
};

export const updateProject = async (projectId, updates) => {
  const response = await apiClient.put(`/projects/${projectId}`, updates);
  return response.data;
};

export const inviteClientToProject = async (projectId, clientData) => {
  const response = await apiClient.post(`/projects/${projectId}/invite-client`, clientData);
  return response.data;
};

export const getProjectStats = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/stats`);
  return response.data.stats;
};

export const getProjectTimeline = async (projectId) => {
  const response = await apiClient.get(`/projects/${projectId}/timeline`);
  return response.data.timeline;
};

/**
 * MEERWERK AANVRAGEN
 */
export const fetchExtraWorkRequests = async (projectId, filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
    }
  });
  
  const queryString = params.toString();
  const url = queryString 
    ? `/extra-work/project/${projectId}?${queryString}` 
    : `/extra-work/project/${projectId}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const fetchExtraWorkRequestDetails = async (requestId) => {
  const response = await apiClient.get(`/extra-work/${requestId}`);
  return response.data.request;
};

export const createExtraWorkRequest = async (projectId, requestData) => {
  // Maak FormData voor file uploads
  const formData = new FormData();
  
  // Voeg basisdata toe
  Object.entries(requestData).forEach(([key, value]) => {
    if (key === 'drawings' || key === 'attachments') {
      // Voeg files toe
      if (Array.isArray(value)) {
        value.forEach(file => {
          formData.append('attachments', file);
        });
      }
    } else if (key === 'materials') {
      // Voeg materials als JSON toe
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  
  // Voeg project ID toe
  formData.append('project_id', projectId);
  
  const response = await apiClient.post(`/extra-work`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const requestQuoteForWork = async (requestId) => {
  const response = await apiClient.post(`/extra-work/${requestId}/request-quote`);
  return response.data;
};

export const updateExtraWorkStatus = async (requestId, status, notes = '') => {
  const response = await apiClient.post(`/extra-work/${requestId}/status`, {
    status,
    notes
  });
  return response.data;
};

export const cancelExtraWorkRequest = async (requestId, reason = '') => {
  const response = await apiClient.post(`/extra-work/${requestId}/cancel`, { reason });
  return response.data;
};

export const getExtraWorkStats = async (projectId) => {
  const response = await apiClient.get(`/extra-work/stats/project/${projectId}`);
  return response.data.stats;
};

/**
 * OFFERTES
 */
export const fetchQuotesForProject = async (projectId, filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  const url = queryString 
    ? `/quotes/project/${projectId}?${queryString}` 
    : `/quotes/project/${projectId}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const fetchQuoteDetails = async (quoteId) => {
  const response = await apiClient.get(`/quotes/${quoteId}`);
  return response.data.quote;
};

export const generateQuote = async (requestId, options = {}) => {
  const response = await apiClient.post(`/extra-work/${requestId}/generate-quote`, options);
  return response.data;
};

export const approveQuote = async (quoteId, approvalData) => {
  const response = await apiClient.post(`/quotes/${quoteId}/approve`, approvalData);
  return response.data;
};

export const declineQuote = async (quoteId, declineData) => {
  const response = await apiClient.post(`/quotes/${quoteId}/decline`, declineData);
  return response.data;
};

export const requestQuoteChanges = async (quoteId, changesData) => {
  const response = await apiClient.post(`/quotes/${quoteId}/request-changes`, changesData);
  return response.data;
};

export const downloadQuotePDF = async (quoteId) => {
  const response = await apiClient.get(`/quotes/${quoteId}/download`, {
    responseType: 'blob'
  });
  
  // Extract filename from headers
  const contentDisposition = response.headers['content-disposition'];
  let filename = `offerte-${quoteId}.pdf`;
  
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) {
      filename = match[1];
    }
  }
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return filename;
};

export const getQuoteStatus = async (quoteId) => {
  const response = await apiClient.get(`/quotes/${quoteId}/status`);
  return response.data;
};

export const generateQuotesZip = async (quoteIds) => {
  const response = await apiClient.post('/quotes/generate-batch', { quoteIds });
  return response.data;
};

/**
 * DOCUMENTEN
 */
export const fetchProjectDocuments = async (projectId, filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  const url = queryString 
    ? `/documents/project/${projectId}?${queryString}` 
    : `/documents/project/${projectId}`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const uploadDocument = async (projectId, documentData) => {
  const formData = new FormData();
  
  // Voeg files toe
  if (documentData.files && Array.isArray(documentData.files)) {
    documentData.files.forEach(file => {
      formData.append('files', file);
    });
  }
  
  // Voeg metadata toe
  Object.entries(documentData).forEach(([key, value]) => {
    if (key !== 'files') {
      formData.append(key, value);
    }
  });
  
  // Voeg project ID toe
  formData.append('projectId', projectId);
  
  const response = await apiClient.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

export const fetchDocumentDetails = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}`);
  return response.data.document;
};

export const downloadDocument = async (documentId) => {
  const response = await apiClient.get(`/documents/${documentId}/download`, {
    responseType: 'blob'
  });
  
  // Extract filename from headers
  const contentDisposition = response.headers['content-disposition'];
  let filename = `document-${documentId}`;
  
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="(.+)"/);
    if (match) {
      filename = match[1];
    }
  }
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return filename;
};

export const updateDocument = async (documentId, updates) => {
  const response = await apiClient.put(`/documents/${documentId}`, updates);
  return response.data;
};

export const deleteDocument = async (documentId) => {
  const response = await apiClient.delete(`/documents/${documentId}`);
  return response.data;
};

export const approveDocument = async (documentId, approvalData) => {
  const response = await apiClient.post(`/documents/${documentId}/approve`, approvalData);
  return response.data;
};

export const shareDocumentWithClients = async (documentId, shareData) => {
  const response = await apiClient.post(`/documents/${documentId}/share`, shareData);
  return response.data;
};

export const searchDocuments = async (query, projectId = null) => {
  const params = new URLSearchParams({ q: query });
  if (projectId) params.append('projectId', projectId);
  
  const response = await apiClient.get(`/documents/search?${params.toString()}`);
  return response.data;
};

/**
 * COMMUNICATIE
 */
export const fetchProjectCommunications = async (projectId, filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  const url = queryString 
    ? `/projects/${projectId}/communications?${queryString}` 
    : `/projects/${projectId}/communications`;
  
  const response = await apiClient.get(url);
  return response.data;
};

export const sendCommunication = async (projectId, messageData) => {
  const response = await apiClient.post(`/projects/${projectId}/communication`, messageData);
  return response.data;
};

export const addDocumentComment = async (documentId, commentData) => {
  const response = await apiClient.post(`/documents/${documentId}/comment`, commentData);
  return response.data;
};

/**
 * CLIENT ACTIES
 */
export const postClientAction = async (projectId, actionType, payload = {}) => {
  const response = await apiClient.post(`/projects/${projectId}/client-action`, {
    actionType,
    payload
  });
  return response.data;
};

// Helper functies voor specifieke acties
export const askQuestion = async (projectId, questionData) => {
  return postClientAction(projectId, 'ASK_QUESTION', questionData);
};

export const confirmContract = async (projectId, documentId, signatureData) => {
  return postClientAction(projectId, 'CONFIRM_CONTRACT', {
    documentId,
    signature: signatureData,
    ip: await getClientIP()
  });
};

export const confirmDeliveryPoint = async (projectId, deliveryPointId) => {
  return postClientAction(projectId, 'CONFIRM_DELIVERY_POINT', {
    deliveryPointId
  });
};

export const requestExtraWorkAction = async (projectId, requestData) => {
  return postClientAction(projectId, 'REQUEST_EXTRA_WORK', requestData);
};

export const approveExtraWorkQuote = async (projectId, quoteId, clientData) => {
  return postClientAction(projectId, 'APPROVE_EXTRA_WORK_QUOTE', {
    quoteId,
    ...clientData
  });
};

export const sendMessage = async (projectId, message) => {
  return postClientAction(projectId, 'SEND_MESSAGE', { message });
};

/**
 * NOTIFICATIES
 */
export const fetchNotifications = async (filters = {}) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, value);
    }
  });
  
  const queryString = params.toString();
  const url = queryString ? `/notifications?${queryString}` : '/notifications';
  
  const response = await apiClient.get(url);
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await apiClient.put(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await apiClient.post('/notifications/mark-all-read');
  return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await apiClient.put('/notifications/preferences', preferences);
  return response.data;
};

/**
 * RAPPORTAGES & EXPORT
 */
export const generateProjectReport = async (projectId, options = {}) => {
  const response = await apiClient.post(`/projects/${projectId}/report`, options, {
    responseType: 'blob'
  });
  
  // Create download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `project-report-${projectId}-${Date.now()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return true;
};

export const exportProjectData = async (projectId, format = 'json') => {
  const response = await apiClient.get(`/projects/${projectId}/export?format=${format}`, {
    responseType: format === 'json' ? 'json' : 'blob'
  });
  
  if (format === 'json') {
    return response.data;
  } else {
    // Create download link for binary formats
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `project-export-${projectId}-${Date.now()}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return true;
  }
};

export const exportAuditLogs = async (projectId, startDate, endDate, format = 'csv') => {
  const params = new URLSearchParams({
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    format
  });
  
  const response = await apiClient.get(`/projects/${projectId}/audit-logs?${params.toString()}`, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `audit-logs-${projectId}-${Date.now()}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return true;
};

/**
 * REAL-TIME UPDATES
 */
let realtimeConnection = null;

export const subscribeToProjectUpdates = (projectId, callback) => {
  // Check of browser WebSocket ondersteunt
  if (!window.WebSocket) {
    console.warn('WebSocket not supported');
    return null;
  }
  
  // Maak WebSocket verbinding
  const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${wsProtocol}//${API_BASE_URL.replace(/^https?:\/\//, '')}/ws/project/${projectId}`;
  
  realtimeConnection = new WebSocket(wsUrl);
  
  realtimeConnection.onopen = () => {
    console.log('WebSocket connected for project updates');
    
    // Authenticatie sturen
    const token = localStorage.getItem('portal_token');
    if (token) {
      realtimeConnection.send(JSON.stringify({
        type: 'auth',
        token
      }));
    }
  };
  
  realtimeConnection.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      callback(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  realtimeConnection.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  realtimeConnection.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return () => {
    if (realtimeConnection) {
      realtimeConnection.close();
      realtimeConnection = null;
    }
  };
};

export const unsubscribeFromProjectUpdates = () => {
  if (realtimeConnection) {
    realtimeConnection.close();
    realtimeConnection = null;
  }
};

/**
 * HELPER FUNCTIES
 */
export const getClientIP = async () => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.warn('Could not get client IP:', error);
    return 'unknown';
  }
};

export const uploadFile = async (file, progressCallback = null) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    onUploadProgress: progressCallback ? (progressEvent) => {
      const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      progressCallback(percentCompleted);
    } : undefined
  });
  
  return response.data;
};

export const deleteFile = async (fileUrl) => {
  const response = await apiClient.delete('/files/delete', {
    data: { url: fileUrl }
  });
  return response.data;
};

/**
 * CACHE MANAGEMENT
 */
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minuten

export const fetchWithCache = async (key, fetchFunction, forceRefresh = false) => {
  const now = Date.now();
  
  // Check cache
  if (!forceRefresh && cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  // Fetch nieuwe data
  try {
    const data = await fetchFunction();
    cache.set(key, { data, timestamp: now });
    return data;
  } catch (error) {
    // Als fetch faalt, probeer cache
    if (cache.has(key)) {
      console.warn('Using cached data due to fetch error:', error.message);
      return cache.get(key).data;
    }
    throw error;
  }
};

export const clearCache = (key = null) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};

export const getCachedData = (key) => {
  return cache.get(key)?.data;
};

/**
 * BATCH OPERATIONS
 */
export const batchApproveQuotes = async (quoteIds, approvalData) => {
  const response = await apiClient.post('/quotes/batch-approve', {
    quoteIds,
    approvalData
  });
  return response.data;
};

export const batchDownloadQuotes = async (quoteIds) => {
  const response = await apiClient.post('/quotes/batch-download', { quoteIds }, {
    responseType: 'blob'
  });
  
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `quotes-batch-${Date.now()}.zip`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
  
  return true;
};

/**
 * ERROR HANDLING UTILITIES
 */
export const handleApiError = (error, defaultMessage = 'Er is een fout opgetreden') => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.error || 'Ongeldige aanvraag';
      case 401:
        return 'Niet geautoriseerd. Log opnieuw in.';
      case 403:
        return data.error || 'Geen toegang';
      case 404:
        return data.error || 'Niet gevonden';
      case 409:
        return data.error || 'Conflict (bijv. al goedgekeurd)';
      case 422:
        return data.error || 'Validatiefouten';
      case 429:
        return 'Te veel aanvragen. Probeer het later opnieuw.';
      case 500:
        return 'Server fout. Probeer het later opnieuw.';
      default:
        return data.error || defaultMessage;
    }
  } else if (error.request) {
    // Request gemaakt maar geen response
    return 'Geen verbinding met de server. Controleer uw internetverbinding.';
  } else {
    // Andere fouten
    return error.message || defaultMessage;
  }
};

export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wacht voor volgende poging
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
};

// Export alle functies
export default {
  // Config
  API_BASE_URL,
  apiClient,
  
  // Health & Status
  checkApiHealth,
  pingApi,
  
  // Auth
  login,
  logout,
  getCurrentUser,
  validatePortalToken,
  
  // Projects
  fetchProjects,
  fetchProjectDetails,
  fetchPortalData,
  updateProject,
  inviteClientToProject,
  getProjectStats,
  getProjectTimeline,
  
  // Extra Work
  fetchExtraWorkRequests,
  fetchExtraWorkRequestDetails,
  createExtraWorkRequest,
  requestQuoteForWork,
  updateExtraWorkStatus,
  cancelExtraWorkRequest,
  getExtraWorkStats,
  
  // Quotes
  fetchQuotesForProject,
  fetchQuoteDetails,
  generateQuote,
  approveQuote,
  declineQuote,
  requestQuoteChanges,
  downloadQuotePDF,
  getQuoteStatus,
  generateQuotesZip,
  
  // Documents
  fetchProjectDocuments,
  uploadDocument,
  fetchDocumentDetails,
  downloadDocument,
  updateDocument,
  deleteDocument,
  approveDocument,
  shareDocumentWithClients,
  searchDocuments,
  
  // Communication
  fetchProjectCommunications,
  sendCommunication,
  addDocumentComment,
  
  // Client Actions
  postClientAction,
  askQuestion,
  confirmContract,
  confirmDeliveryPoint,
  requestExtraWorkAction,
  approveExtraWorkQuote,
  sendMessage,
  
  // Notifications
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  updateNotificationPreferences,
  
  // Reports & Export
  generateProjectReport,
  exportProjectData,
  exportAuditLogs,
  
  // Real-time
  subscribeToProjectUpdates,
  unsubscribeFromProjectUpdates,
  
  // Helpers
  getClientIP,
  uploadFile,
  deleteFile,
  
  // Cache
  fetchWithCache,
  clearCache,
  getCachedData,
  
  // Batch operations
  batchApproveQuotes,
  batchDownloadQuotes,
  
  // Error handling
  handleApiError,
  retryRequest
};
