import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.constructiq.com/v1';

const apiClient = axios.create({
baseURL: API_BASE_URL,
headers: {
'Content-Type': 'application/json',
},
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
(config) => {
const token = localStorage.getItem('auth_token');
if (token) {
config.headers.Authorization = Bearer ${token};
}
return config;
},
(error) => {
return Promise.reject(error);
}
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
(response) => response,
(error) => {
if (error.response?.status === 401) {
localStorage.removeItem('auth_token');
window.location.href = '/login';
}
return Promise.reject(error);
}
);

export const projectsAPI = {
getAll: (filters) => apiClient.get('/projects', { params: filters }),
getById: (id) => apiClient.get(/projects/${id}),
create: (projectData) => apiClient.post('/projects', projectData),
update: (id, updates) => apiClient.patch(/projects/${id}, updates),
delete: (id) => apiClient.delete(/projects/${id}),
uploadPlan: (projectId, formData) => apiClient.post(/projects/${projectId}/plans, formData, {
headers: { 'Content-Type': 'multipart/form-data' }
})
};

export const inspectionsAPI = {
getByProject: (projectId) => apiClient.get(/inspections?project_id=${projectId}),
submit: (inspectionData) => apiClient.post('/inspections', inspectionData),
addPhoto: (inspectionId, formData) => apiClient.post(/inspections/${inspectionId}/photos, formData, {
headers: { 'Content-Type': 'multipart/form-data' }
})
};

export const syncAPI = {
getPending: () => apiClient.get('/sync/pending'),
submitBatch: (batchData) => apiClient.post('/sync/batch', batchData),
checkConflicts: (timestamps) => apiClient.post('/sync/check-conflicts', timestamps)
};

export default apiClient;
