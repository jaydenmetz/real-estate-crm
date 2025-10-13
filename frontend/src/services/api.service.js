// File: frontend/src/services/api.js
import * as Sentry from '@sentry/react';

// Determine API URL based on environment
const getApiUrl = () => {
  // Always use REACT_APP_API_URL if set (from .env files)
  if (process.env.REACT_APP_API_URL) {
    // Remove trailing slash if present
    return process.env.REACT_APP_API_URL.replace(/\/$/, '');
  }
  
  // Fallback logic (shouldn't be needed with proper .env files)
  if (process.env.NODE_ENV === 'production') {
    console.warn('REACT_APP_API_URL not set, falling back to production URL');
    return 'https://api.jaydenmetz.com';
  }
  
  // Development fallback
  console.warn('REACT_APP_API_URL not set, falling back to localhost');
  return 'http://localhost:5050';
};

const API_BASE_URL = getApiUrl();

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
}

class ApiService {
  constructor() {
    // If API_BASE_URL already includes /v1, use it as is, otherwise append /v1
    this.baseURL = API_BASE_URL.includes('/v1') ? API_BASE_URL : `${API_BASE_URL}/v1`;

    // PHASE 1: Load JWT from localStorage for persistence
    this.token = localStorage.getItem('authToken');
    this.apiKey = localStorage.getItem('apiKey'); // API keys are safe to store

    // Log initialization (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Service initialized:', {
        baseURL: this.baseURL,
        hasToken: !!this.token,
        hasApiKey: !!this.apiKey,
        environment: process.env.NODE_ENV
      });
    }
  }
  
  // Method to check if token exists
  hasToken() {
    return !!this.token;
  }

  async request(endpoint, options = {}) {
    // Add breadcrumb for API call
    Sentry.addBreadcrumb({
      category: 'api',
      message: `${options.method || 'GET'} ${endpoint}`,
      level: 'info',
      data: {
        endpoint,
        method: options.method || 'GET',
        hasAuth: !!(this.token || this.apiKey)
      }
    });

    // PHASE 1: Refresh JWT from localStorage if not in memory
    if (!this.token) {
      this.token = localStorage.getItem('authToken');
    }
    // API keys are safe to refresh from localStorage
    this.apiKey = localStorage.getItem('apiKey');
    
    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseURL}${normalizedEndpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for CORS with credentials
    };

    // Add authentication header - support both API key and JWT
    if (this.apiKey) {
      config.headers['X-API-Key'] = this.apiKey;
    } else if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Request: ${config.method || 'GET'} ${url}`);
      }
      
      const response = await fetch(url, config);

      // Log response details for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Response: ${response.status} ${response.statusText}`);
      }

      if (!response.ok) {
        // Handle authentication errors properly
        if (response.status === 401) {
          console.error('Authentication failed:', {
            url,
            hasToken: !!this.token,
            hasApiKey: !!this.apiKey,
            status: response.status
          });

          // Don't redirect if we're already on the login page, calling auth endpoints, or api-keys
          const isAuthEndpoint = url.includes('/auth/');
          const isRefreshEndpoint = url.includes('/auth/refresh');
          const isApiKeysEndpoint = url.includes('/api-keys');
          const isLoginPage = window.location.pathname === '/login';
          const isSettingsPage = window.location.pathname === '/settings';
          // PHASE 4: Removed isHealthPage exclusion - health pages now require authentication

          // Try to refresh token if we have JWT (not API key) and not already refreshing
          if (!isAuthEndpoint && !isApiKeysEndpoint && this.token && !this.apiKey && !options._isRetry) {
            try {
              console.log('🔄 Token expired, attempting automatic refresh...');
              // Import authService dynamically to avoid circular dependency
              const authService = (await import('./auth.service')).default;
              const refreshResult = await authService.refreshAccessToken();

              if (refreshResult.success) {
                console.log('✅ Token refreshed successfully, retrying original request');
                // Update our local token reference
                this.token = refreshResult.token;
                // Retry the original request with new token
                options._isRetry = true;
                return this.request(endpoint, options);
              } else {
                console.warn('❌ Token refresh failed:', refreshResult.error);
                // Fall through to logout below
              }
            } catch (refreshError) {
              console.error('❌ Token refresh error:', refreshError);
              // Fall through to logout below
            }
          }

          // Only redirect to login if refresh failed or wasn't attempted
          // PHASE 4: Health pages now require authentication, removed exclusion
          if (!isAuthEndpoint && !isApiKeysEndpoint && !isLoginPage && !isSettingsPage) {
            console.log('⚠️ Authentication failed, redirecting to login...');
            // Clear invalid authentication (Phase 4: only clear user data, NOT tokens from localStorage)
            localStorage.removeItem('apiKey');
            localStorage.removeItem('user');
            localStorage.removeItem('tokenExpiry');
            // JWT tokens are already NOT stored in localStorage (XSS protection)
            // Redirect to login page after a brief delay
            setTimeout(() => {
              window.location.href = '/login';
            }, 100);
          }

          // Throw auth error
          const authError = new Error('Authentication required');
          authError.status = 401;
          authError.response = response;
          throw authError;
        }
        
        // Handle 404 specifically
        if (response.status === 404) {
          const error = new Error('Endpoint not found');
          error.status = 404;
          error.response = response;
          throw error;
        }
        
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

      // Capture API errors to Sentry with context
      Sentry.captureException(error, {
        tags: {
          api_endpoint: endpoint,
          api_method: config.method || 'GET',
          api_status: error.status || 'unknown'
        },
        extra: {
          url,
          hasAuth: !!(this.token || this.apiKey)
        }
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
  async delete(endpoint, data = {}) {
    const config = {
      method: 'DELETE',
    };

    // Add body if data is provided
    if (Object.keys(data).length > 0) {
      config.body = JSON.stringify(data);
    }

    return this.request(endpoint, config);
  }

  // PATCH request
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Set authentication token (MEMORY ONLY - XSS protection Phase 4)
  setToken(token) {
    this.token = token;
    // DO NOT store in localStorage (XSS vulnerability)
    // Tokens are now stored in memory only
    // Refresh tokens are stored in httpOnly cookies by backend
  }

  // Set API key
  setApiKey(apiKey) {
    this.apiKey = apiKey;
    if (apiKey) {
      localStorage.setItem('apiKey', apiKey);
    } else {
      localStorage.removeItem('apiKey');
    }
  }

  /**
   * Make a request with a specific API key (for testing)
   * Does NOT change the stored apiKey, only uses it for this request
   * @param {string} endpoint - API endpoint
   * @param {string} apiKey - Temporary API key to use
   * @param {object} options - Request options
   * @returns {Promise<any>} Response data
   */
  async requestWithApiKey(endpoint, apiKey, options = {}) {
    if (!apiKey) {
      throw new Error('API key is required for requestWithApiKey()');
    }

    // Store original values
    const originalApiKey = this.apiKey;
    const originalToken = this.token;

    try {
      // Temporarily set API key and clear token
      this.apiKey = apiKey;
      this.token = null;

      // Make request (will use this.apiKey in headers)
      const result = await this.request(endpoint, options);

      return result;
    } finally {
      // Always restore original values
      this.apiKey = originalApiKey;
      this.token = originalToken;
    }
  }

  /**
   * API Key Management Methods
   */

  /**
   * List all API keys for current user
   * @returns {Promise<Array>} Array of API key objects (keys are hashed)
   */
  async listApiKeys() {
    return this.get('/api-keys');
  }

  /**
   * Create new API key
   * @param {string} name - Key name/description
   * @param {number} expiresInDays - Days until expiration (optional)
   * @returns {Promise<{key: string, id: string}>} Created key (key shown only once)
   */
  async createApiKey(name, expiresInDays = null) {
    return this.post('/api-keys', { name, expiresInDays });
  }

  /**
   * Create a temporary API key for testing
   * @param {string} name - API key name
   * @returns {Promise<{key: string, id: string}>} Created API key details
   */
  async createTestApiKey(name = 'Health Test Key') {
    return this.createApiKey(name, 1); // 1-day expiry for test keys
  }

  /**
   * Update API key metadata
   * @param {string} keyId - API key ID
   * @param {object} updates - Fields to update (name, expiresInDays)
   * @returns {Promise<void>}
   */
  async updateApiKey(keyId, updates) {
    return this.put(`/api-keys/${keyId}`, updates);
  }

  /**
   * Delete/revoke API key
   * @param {string} keyId - API key ID to delete
   * @returns {Promise<void>}
   */
  async deleteApiKey(keyId) {
    return this.delete(`/api-keys/${keyId}`);
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

// DO NOT initialize token from localStorage (XSS protection - Phase 4)
// Token will be set by auth.service.js after login
// This ensures tokens are NEVER persisted in localStorage

// Export specific API methods for better organization
export const escrowsAPI = {
  getAll: (params) => apiInstance.get('/escrows', params),
  getById: (id) => apiInstance.get(`/escrows/${id}`),
  getOne: (id) => apiInstance.get(`/escrows/${id}`), // Alias for consistency
  create: (data) => apiInstance.post('/escrows', data),
  update: (id, data) => apiInstance.put(`/escrows/${id}`, data),
  archive: (id) => apiInstance.put(`/escrows/${id}/archive`),
  restore: (id) => apiInstance.put(`/escrows/${id}/restore`),
  delete: (id) => apiInstance.delete(`/escrows/${id}`), // Permanent delete (only for archived)
  batchDelete: (ids) => apiInstance.post('/escrows/batch-delete', { ids }), // Batch delete multiple archived escrows
  updateChecklists: (id, checklists) => apiInstance.put(`/escrows/${id}/checklists`, checklists),
  updatePropertyDetails: (id, details) => apiInstance.put(`/escrows/${id}/property-details`, details),
  updateFinancials: (id, financials) => apiInstance.put(`/escrows/${id}/financials`, financials),
  updateTimeline: (id, timeline) => apiInstance.put(`/escrows/${id}/timeline`, timeline),
  updatePeople: (id, people) => apiInstance.put(`/escrows/${id}/people`, people),
  getAnalytics: (id) => apiInstance.get(`/analytics/escrow/${id}`),
  addNote: (id, note) => apiInstance.post(`/escrows/${id}/notes`, note)
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

// Profiles API
export const profilesAPI = {
  getPublic: (username) => apiInstance.get(`/profiles/public/${username}`),
  getMe: () => apiInstance.get('/profiles/me'),
  updateMe: (data) => apiInstance.put('/profiles/me', data),
  getStatistics: (username, period) => apiInstance.get(`/profiles/statistics/${username}`, { period })
};

// Settings API
export const settingsAPI = {
  get: () => apiInstance.get('/settings'),
  update: (data) => apiInstance.put('/settings', data),
  updateNotifications: (data) => apiInstance.put('/settings/notifications', data),
  getTheme: () => apiInstance.get('/settings/theme'),
  toggleTheme: () => apiInstance.post('/settings/theme/toggle')
};

// API Keys API
export const apiKeysAPI = {
  getAll: () => apiInstance.get('/api-keys'),
  create: (data) => apiInstance.post('/api-keys', data),
  delete: (id) => apiInstance.delete(`/api-keys/${id}`), // Add delete method
  revoke: (id) => apiInstance.delete(`/api-keys/${id}`), // Keep revoke for backward compatibility
  update: (id, data) => apiInstance.put(`/api-keys/${id}`, data)
};


// Export the main API instance as default
// Export the API instance for debugging
window.apiInstance = apiInstance;

export default apiInstance;

// Export API_BASE_URL and apiCall for backward compatibility
export { API_BASE_URL };
export const apiCall = (endpoint, options = {}) => {
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return apiInstance.request(normalizedEndpoint, options);
};

// Export setApiKey method for external use
export const setApiKey = (apiKey) => apiInstance.setApiKey(apiKey);

// Also export a named api object containing all the modules
export const api = {
  escrowsAPI,
  listingsAPI,
  clientsAPI,
  appointmentsAPI,
  leadsAPI,
  propertiesAPI,
  analyticsAPI,
  documentsAPI,
  communicationsAPI,
  webhooksAPI,
  profilesAPI,
  settingsAPI,
  apiKeysAPI,
  // Include the raw instance methods for flexibility
  get: (...args) => apiInstance.get(...args),
  post: (...args) => apiInstance.post(...args),
  put: (...args) => apiInstance.put(...args),
  delete: (...args) => apiInstance.delete(...args),
  patch: (...args) => apiInstance.patch(...args),
  setToken: (token) => apiInstance.setToken(token),
  uploadFile: (...args) => apiInstance.uploadFile(...args),
};