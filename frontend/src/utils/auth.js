// Authentication utilities for the CRM application
// Supports both JWT tokens and API keys

import apiInstance from '../services/api.service';

/**
 * Store JWT token after successful login
 * @param {string} token - JWT token from login response
 * @param {object} user - User data from login response
 */
export const setAuthToken = (token, user = null) => {
  if (token) {
    localStorage.setItem('authToken', token);
    apiInstance.setToken(token);
  }
  
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * Store API key for authentication
 * @param {string} apiKey - API key (64-character hex string)
 */
export const setApiKey = (apiKey) => {
  if (apiKey && apiKey.length === 64) {
    localStorage.setItem('apiKey', apiKey);
    apiInstance.setApiKey(apiKey);
  } else {
    console.error('Invalid API key format. Must be 64-character hex string');
  }
};

/**
 * Get current authentication status
 * @returns {object} Authentication status
 */
export const getAuthStatus = () => {
  const token = localStorage.getItem('authToken');
  const apiKey = localStorage.getItem('apiKey');
  const user = localStorage.getItem('user');
  
  return {
    isAuthenticated: !!(token || apiKey),
    hasJWT: !!token,
    hasApiKey: !!apiKey,
    user: user ? JSON.parse(user) : null,
    authMethod: apiKey ? 'api-key' : (token ? 'jwt' : 'none')
  };
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('apiKey');
  localStorage.removeItem('user');
  apiInstance.setToken(null);
  apiInstance.setApiKey(null);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const { isAuthenticated } = getAuthStatus();
  return isAuthenticated;
};

/**
 * Get current user from localStorage
 * @returns {object|null} User object or null
 */
export const getCurrentUser = () => {
  const { user } = getAuthStatus();
  return user;
};

/**
 * Create API key for current user
 * @param {string} name - Name for the API key
 * @param {number} expiresInDays - Days until expiration (default: 365)
 * @returns {Promise<object>} API key response
 */
export const createApiKey = async (name, expiresInDays = 365) => {
  try {
    const response = await apiInstance.post('/api-keys', {
      name,
      expiresInDays
    });
    
    if (response.success && response.data.key) {
      // Store the newly created API key
      setApiKey(response.data.key);
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Failed to create API key');
  } catch (error) {
    console.error('Error creating API key:', error);
    throw error;
  }
};

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<object>} Login response
 */
export const login = async (email, password) => {
  try {
    const response = await apiInstance.post('/auth/login', {
      email,
      password
    });
    
    if (response.success && response.data.token) {
      setAuthToken(response.data.token, response.data.user);
      return response.data;
    }
    
    throw new Error(response.error?.message || 'Login failed');
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout user
 */
export const logout = () => {
  clearAuth();
  window.location.href = '/login';
};

// Export for window debugging in development
if (process.env.NODE_ENV === 'development') {
  window.authUtils = {
    setAuthToken,
    setApiKey,
    getAuthStatus,
    clearAuth,
    isAuthenticated,
    getCurrentUser,
    createApiKey,
    login,
    logout
  };
}