/**
 * Preferences Service
 *
 * Manages user preferences that sync across devices
 * Uses database storage via API (not localStorage)
 */

import apiInstance from './api.service';

/**
 * Get all preferences for current user
 * @returns {Promise<Object>} All preferences { "escrows.viewMode": {...}, ... }
 */
export const getAllPreferences = async () => {
  const response = await apiInstance.get('/preferences');
  return response.data.data || response.data;
};

/**
 * Get a specific preference
 * @param {string} key - Preference key (e.g., "escrows.viewMode")
 * @returns {Promise<any>} Preference value or null
 */
export const getPreference = async (key) => {
  try {
    const response = await apiInstance.get(`/preferences/${key}`);
    return response.data.data || response.data;
  } catch (error) {
    // 404 means preference doesn't exist yet - return null
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Set a preference
 * @param {string} key - Preference key
 * @param {any} value - Preference value (will be stored as JSONB)
 * @returns {Promise<Object>} Updated preference
 */
export const setPreference = async (key, value) => {
  const response = await apiInstance.put(`/preferences/${key}`, { value });
  return response.data.data || response.data;
};

/**
 * Set multiple preferences at once
 * @param {Object} preferences - Object with key-value pairs
 * @returns {Promise<Array>} Array of updated preferences
 */
export const setPreferences = async (preferences) => {
  const response = await apiInstance.post('/preferences/bulk', { preferences });
  return response.data.data || response.data;
};

/**
 * Delete a preference
 * @param {string} key - Preference key
 * @returns {Promise<boolean>} True if deleted
 */
export const deletePreference = async (key) => {
  const response = await apiInstance.delete(`/preferences/${key}`);
  return response.data.success;
};

export default {
  getAllPreferences,
  getPreference,
  setPreference,
  setPreferences,
  deletePreference,
};
