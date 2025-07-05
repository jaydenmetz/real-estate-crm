import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('api_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('api_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Specific API methods
export const escrowsAPI = {
  getAll: (params) => api.get('/escrows', { params }),
  getOne: (id) => api.get(`/escrows/${id}`),
  create: (data) => api.post('/escrows', data),
  update: (id, data) => api.put(`/escrows/${id}`, data),
  delete: (id) => api.delete(`/escrows/${id}`),
  updateChecklist: (id, item, value, note) => 
    api.patch(`/escrows/${id}/checklist`, { item, value, note }),
};

export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getOne: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  priceReduction: (id, data) => api.post(`/listings/${id}/price-reduction`, data),
  logShowing: (id, data) => api.post(`/listings/${id}/showings`, data),
};

export const clientsAPI = {
  getAll: (params) => api.get('/clients', { params }),
  getOne: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
  addNote: (id, note) => api.post(`/clients/${id}/notes`, note),
  updateTags: (id, operation, tags) => 
    api.patch(`/clients/${id}/tags`, { operation, tags }),
};

export const leadsAPI = {
  getAll: (params) => api.get('/leads', { params }),
  getOne: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  convert: (id, data) => api.post(`/leads/${id}/convert`, data),
  logActivity: (id, activity) => api.post(`/leads/${id}/activities`, activity),
};

export const appointmentsAPI = {
  getAll: (params) => api.get('/appointments', { params }),
  getOne: (id) => api.get(`/appointments/${id}`),
  create: (data) => api.post('/appointments', data),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  cancel: (id, data) => api.post(`/appointments/${id}/cancel`, data),
  complete: (id, data) => api.post(`/appointments/${id}/complete`, data),
};

export const aiAPI = {
  getAgents: () => api.get('/ai/agents'),
  toggleAgent: (id, enabled) => api.patch(`/ai/agents/${id}/toggle`, { enabled }),
  getTokenUsage: () => api.get('/ai/token-usage'),
  getDailyBrief: () => api.get('/ai/alex/daily-briefing'),
  getUrgentTasks: () => api.get('/ai/alex/urgent-tasks'),
};

export default api;