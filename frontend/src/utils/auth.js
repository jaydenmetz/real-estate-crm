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

// Default export with all utilities
export default {
  STORAGE_KEYS,
  getAuthToken,
  getUser,
  getApiKey,
  isAuthenticated,
  getTokenExpiry,
  isTokenExpiringSoon,
  getTimeUntilExpiry
};
