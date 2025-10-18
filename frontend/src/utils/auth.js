/**
 * Centralized authentication utilities
 * Single source of truth for localStorage keys and auth operations
 *
 * @module utils/auth
 */

// Storage keys (matches api.service.js)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER: 'user',
  API_KEY: 'apiKey',
  TOKEN_EXPIRY: 'tokenExpiry'
};

/**
 * Get current auth token (JWT)
 * @returns {string|null} JWT token or null
 */
export const getAuthToken = () => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Get current user data
 * @returns {object|null} User object or null
 */
export const getUser = () => {
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
};

/**
 * Get current API key
 * @returns {string|null} API key or null
 */
export const getApiKey = () => {
  return localStorage.getItem(STORAGE_KEYS.API_KEY);
};

/**
 * Check if user is authenticated (has either JWT or API key)
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!(getAuthToken() || getApiKey());
};

/**
 * Get token expiry timestamp
 * @returns {number|null} Expiry timestamp or null
 */
export const getTokenExpiry = () => {
  const expiry = localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY);
  return expiry ? parseInt(expiry, 10) : null;
};

/**
 * Check if token is expiring soon (within 2 minutes)
 * @returns {boolean}
 */
export const isTokenExpiringSoon = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return false;

  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = expiry - now;
  return timeRemaining < 120; // Less than 2 minutes
};

/**
 * Get time remaining until token expires
 * @returns {number|null} Seconds until expiry, or null if no token
 */
export const getTimeUntilExpiry = () => {
  const expiry = getTokenExpiry();
  if (!expiry) return null;

  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiry - now);
};

/**
 * Clean up old/expired tokens from localStorage
 * Removes legacy token keys and expired tokens
 * Called automatically on app initialization
 */
export const cleanupOldTokens = () => {
  try {
    // List of old token keys that should be removed
    const oldTokenKeys = [
      'crm_auth_token',  // Old key from before Phase 4
      'token',           // Generic key from early development
      'api_token',       // Old API token key
    ];

    // Remove old token keys
    oldTokenKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        // console.log(`🧹 Removing old token key: ${key}`);
        localStorage.removeItem(key);
      }
    });

    // Check if current token is expired
    const expiry = getTokenExpiry();
    if (expiry) {
      const now = Math.floor(Date.now() / 1000);
      if (now > expiry) {
        // console.log('🧹 Removing expired token and user data');
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }

    // console.log('✅ Token cleanup complete');
  } catch (error) {
    console.error('Error cleaning up tokens:', error);
  }
};

// Default export with all utilities
export default {
  STORAGE_KEYS,
  getAuthToken,
  getUser,
  getApiKey,
  isAuthenticated,
  getTokenExpiry,
  isTokenExpiringSoon,
  getTimeUntilExpiry,
  cleanupOldTokens
};
