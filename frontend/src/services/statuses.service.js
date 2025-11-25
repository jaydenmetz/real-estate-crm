/**
 * Status System Service
 *
 * Fetches database-driven status configurations from backend API
 * Replaces hardcoded status values with flexible, team-specific configurations
 */

import apiInstance from './api.service';

/**
 * Get all statuses for an entity type
 * @param {string} entityType - escrows, listings, clients, leads, appointments
 * @returns {Promise<Array>} Array of status objects with id, status_key, label, color, icon, etc.
 */
export const getStatuses = async (entityType) => {
  const response = await apiInstance.get(`/statuses/${entityType}`);
  return response.data.data || response.data;
};

/**
 * Get status categories (tabs) for an entity type
 * Each category includes its statuses in hierarchical structure
 *
 * @param {string} entityType - escrows, listings, clients, leads, appointments
 * @returns {Promise<Array>} Array of category objects with statuses
 *
 * Example response:
 * [
 *   {
 *     category_id: "uuid",
 *     category_key: "Active",
 *     category_label: "Active",
 *     preferred_view_mode: "card",
 *     statuses: [
 *       { id: "uuid", status_key: "Active", label: "Active", color: "#10b981", ... }
 *     ]
 *   },
 *   ...
 * ]
 */
export const getStatusCategories = async (entityType) => {
  const response = await apiInstance.get(`/statuses/${entityType}/categories`);
  return response.data.data || response.data;
};

/**
 * Get status change history for an entity
 * @param {string} entityType - escrows, listings, etc.
 * @param {string} entityId - Entity UUID
 * @returns {Promise<Array>} Array of status change log entries
 */
export const getStatusHistory = async (entityType, entityId) => {
  const response = await apiInstance.get(`/statuses/${entityType}/${entityId}/history`);
  return response.data.data || response.data;
};

/**
 * Create a custom status for your team
 * @param {string} entityType - escrows, listings, etc.
 * @param {Object} statusData - { statusKey, label, color, icon, isDefault, isFinal }
 * @returns {Promise<Object>} Created status object
 */
export const createCustomStatus = async (entityType, statusData) => {
  const response = await apiInstance.post(`/statuses/${entityType}`, statusData);
  return response.data.data || response.data;
};

/**
 * Validate if a status transition is allowed
 * @param {string} fromStatusId - Current status UUID
 * @param {string} toStatusId - Desired status UUID
 * @returns {Promise<Object>} { allowed: boolean, requiresReason: boolean, message?: string }
 */
export const validateTransition = async (fromStatusId, toStatusId) => {
  const response = await apiInstance.post('/statuses/validate-transition', {
    fromStatusId,
    toStatusId,
  });
  return response.data.data || response.data;
};

export default {
  getStatuses,
  getStatusCategories,
  getStatusHistory,
  createCustomStatus,
  validateTransition,
};
