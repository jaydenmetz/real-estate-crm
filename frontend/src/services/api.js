// File: frontend/src/services/api.js

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api/v1';

// Log the API URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Environment:', process.env.NODE_ENV);

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
    
    // Log initialization
    console.log('API Service initialized:', {
      baseURL: this.baseURL,
      hasToken: !!this.token,
      environment: process.env.NODE_ENV
    });
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for CORS with credentials
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);

      // Log response details for debugging
      console.log(`API Response: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error.message || errorMessage;
          }
        } catch (e) {
          // Response wasn't JSON
        }
        
        const error = new Error(errorMessage);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : null;
    } catch (error) {
      console.error('API Request Error:', {
        url,
        method: config.method || 'GET',
        error: error.message,
        status: error.status
      });
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  // POST request
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // File upload
  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('file', file);
    
    Object.keys(additionalData).forEach(key => {
      formData.append(key, additionalData[key]);
    });

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData - let browser set it
      }
    });
  }
}

// Create the API instance
const apiInstance = new ApiService();

// Export specific API methods for better organization
export const escrowsAPI = {
  getAll: (params) => apiInstance.get('/escrows', params),
  getById: (id) => apiInstance.get(`/escrows/${id}`),
  create: (data) => apiInstance.post('/escrows', data),
  update: (id, data) => apiInstance.put(`/escrows/${id}`, data),
  delete: (id) => apiInstance.delete(`/escrows/${id}`),
  updateChecklist: (id, checklist) => apiInstance.put(`/escrows/${id}/checklist`, { checklist }),
  getAnalytics: (id) => apiInstance.get(`/analytics/escrow/${id}`)
};

export const listingsAPI = {
  getAll: (params) => apiInstance.get('/listings', { params }),
  getOne: (id) => apiInstance.get(`/listings/${id}`),
  create: (data) => apiInstance.post('/listings', data),
  update: (id, data) => apiInstance.put(`/listings/${id}`, data),
  delete: (id) => apiInstance.delete(`/listings/${id}`),
  updateStatus: (id, status) => apiInstance.patch(`/listings/${id}/status`, { status }),
  updateChecklist: (id, checklist) => apiInstance.put(`/listings/${id}/checklist`, { checklist }),
  getPriceHistory: (id) => apiInstance.get(`/listings/${id}/price-history`),
  getAnalytics: (id) => apiInstance.get(`/analytics/listing/${id}`),
  recordPriceReduction: (id, data) => apiInstance.post(`/listings/${id}/price-reduction`, data),
  logShowing: (id, data) => apiInstance.post(`/listings/${id}/showings`, data),
  updatePrice: (id, price) => apiInstance.post(`/listings/${id}/price-reduction`, { 
    newPrice: price, 
    reason: 'Market adjustment',
    effectiveDate: new Date()
  }),
};

export const clientsAPI = {
  getAll: (params) => apiInstance.get('/clients', params),
  getById: (id) => apiInstance.get(`/clients/${id}`),
  create: (data) => apiInstance.post('/clients', data),
  update: (id, data) => apiInstance.put(`/clients/${id}`, data),
  delete: (id) => apiInstance.delete(`/clients/${id}`),
  updateChecklist: (id, checklist) => apiInstance.put(`/clients/${id}/checklist`, { checklist }),
  getTransactions: (id) => apiInstance.get(`/clients/${id}/transactions`),
  getCommunications: (id) => apiInstance.get(`/clients/${id}/communications`),
  getNotes: (id) => apiInstance.get(`/clients/${id}/notes`),
  addNote: (id, note) => apiInstance.post(`/clients/${id}/notes`, note),
  updateTags: (id, operation, tags) => apiInstance.patch(`/clients/${id}/tags`, { operation, tags })
};

export const appointmentsAPI = {
  getAll: (params) => apiInstance.get('/appointments', params),
  getById: (id) => apiInstance.get(`/appointments/${id}`),
  create: (data) => apiInstance.post('/appointments', data),
  update: (id, data) => apiInstance.put(`/appointments/${id}`, data),
  delete: (id) => apiInstance.delete(`/appointments/${id}`),
  updateChecklist: (id, checklist) => apiInstance.put(`/appointments/${id}/checklist`, { checklist }),
  getAnalytics: (id) => apiInstance.get(`/analytics/appointments/${id}`)
};

export const leadsAPI = {
  getAll: (params) => apiInstance.get('/leads', params),
  getById: (id) => apiInstance.get(`/leads/${id}`),
  create: (data) => apiInstance.post('/leads', data),
  update: (id, data) => apiInstance.put(`/leads/${id}`, data),
  delete: (id) => apiInstance.delete(`/leads/${id}`),
  updateChecklist: (id, checklist) => apiInstance.put(`/leads/${id}/checklist`, { checklist }),
  getActivities: (id) => apiInstance.get(`/leads/${id}/activities`),
  getCommunications: (id) => apiInstance.get(`/leads/${id}/communications`),
  getAnalytics: (id) => apiInstance.get(`/analytics/lead/${id}`),
  convertToClient: (id) => apiInstance.post(`/leads/${id}/convert`)
};

export const propertiesAPI = {
  search: (query) => apiInstance.get('/properties/search', { address: query })
};

export const aiAgentsAPI = {
  getAll: () => apiInstance.get('/ai/agents'),
  getById: (id) => apiInstance.get(`/ai/agents/${id}`),
  updateStatus: (id, enabled) => apiInstance.patch(`/ai/agents/${id}`, { enabled }),
  getActivities: (agentId) => apiInstance.get(`/ai/activities`, { agentId }),
  triggerAgent: (agentId, task) => apiInstance.post(`/ai/agents/${agentId}/trigger`, { task })
};

export const analyticsAPI = {
  getDashboard: () => apiInstance.get('/analytics/dashboard'),
  getMetrics: (type, period) => apiInstance.get('/analytics/metrics', { type, period }),
  getReport: (type, params) => apiInstance.get(`/analytics/reports/${type}`, params),
  getAITeamStats: () => apiInstance.get('/analytics/ai-team'),
  getOfficeStats: () => apiInstance.get('/analytics/office'),
};

export const documentsAPI = {
  upload: (entityType, entityId, file) => 
    apiInstance.uploadFile('/documents/upload', file, { entityType, entityId }),
  getByEntity: (entityType, entityId) => 
    apiInstance.get('/documents', { entityType, entityId }),
  download: (id) => apiInstance.get(`/documents/${id}/download`),
  delete: (id) => apiInstance.delete(`/documents/${id}`)
};

export const communicationsAPI = {
  create: (data) => apiInstance.post('/communications', data),
  getByEntity: (entityType, entityId) => 
    apiInstance.get('/communications', { entityType, entityId }),
  sendEmail: (data) => apiInstance.post('/communications/email', data),
  sendSMS: (data) => apiInstance.post('/communications/sms', data)
};

export const webhooksAPI = {
  getAll: () => apiInstance.get('/webhooks'),
  create: (data) => apiInstance.post('/webhooks', data),
  update: (id, data) => apiInstance.put(`/webhooks/${id}`, data),
  delete: (id) => apiInstance.delete(`/webhooks/${id}`),
  test: (id) => apiInstance.post(`/webhooks/${id}/test`)
};

// Additional Alex-specific API endpoints
export const aiAPI = {
  getAgents: () => apiInstance.get('/ai/agents'),
  toggleAgent: (id, enabled) => apiInstance.patch(`/ai/agents/${id}/toggle`, { enabled }),
  getTokenUsage: () => apiInstance.get('/ai/token-usage'),
  getDailyBrief: () => apiInstance.get('/ai/alex/daily-briefing'),
  getUrgentTasks: () => apiInstance.get('/ai/alex/urgent-tasks'),
};

// Export the main API instance as default
export default apiInstance;

// Also export a named api object containing all the modules
export const api = {
  escrowsAPI,
  listingsAPI,
  clientsAPI,
  appointmentsAPI,
  leadsAPI,
  propertiesAPI,
  aiAgentsAPI,
  aiAPI,
  analyticsAPI,
  documentsAPI,
  communicationsAPI,
  webhooksAPI,
  // Include the raw instance methods for flexibility
  get: (...args) => apiInstance.get(...args),
  post: (...args) => apiInstance.post(...args),
  put: (...args) => apiInstance.put(...args),
  delete: (...args) => apiInstance.delete(...args),
  patch: (...args) => apiInstance.patch(...args),
  setToken: (token) => apiInstance.setToken(token),
  uploadFile: (...args) => apiInstance.uploadFile(...args),
};