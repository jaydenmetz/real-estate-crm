/**
 * Status Configuration - Barrel Export
 *
 * This file provides a single import point for all status-related configuration.
 *
 * Usage:
 * import {
 *   LISTING_STATUSES,
 *   LISTING_CATEGORIES,
 *   getEntityTabs,
 *   getCategoryDropdown,
 * } from '@/config/statuses';
 */

// Status Definitions
export {
  ESCROW_STATUSES,
  LISTING_STATUSES,
  CLIENT_STATUSES,
  LEAD_STATUSES,
  APPOINTMENT_STATUSES,
  getEntityStatuses,
  getStatusById,
  getStatusIds,
  getStatusOptions,
} from './statusDefinitions';

// Status Categories
export {
  ESCROW_CATEGORIES,
  LISTING_CATEGORIES,
  CLIENT_CATEGORIES,
  LEAD_CATEGORIES,
  APPOINTMENT_CATEGORIES,
  getEntityCategories,
  getCategoryById,
  getCategoryByStatus,
  getEntityTabs,
  getCategoryDropdown,
  isStatusInCategory,
} from './statusCategories';

// ============================================================================
// UNIFIED API - Recommended for use in components
// ============================================================================

/**
 * Get complete status configuration for an entity
 * Returns both statuses and categories in one call
 *
 * @param {string} entity - Entity name (escrows, listings, etc.)
 * @returns {object} { statuses, categories, tabs, getDropdown }
 */
export const getStatusConfig = (entity) => {
  const { getEntityStatuses } = require('./statusDefinitions');
  const { getEntityCategories, getEntityTabs, getCategoryDropdown } = require('./statusCategories');

  return {
    statuses: getEntityStatuses(entity),
    categories: getEntityCategories(entity),
    tabs: getEntityTabs(entity),
    getDropdown: (categoryId) => getCategoryDropdown(entity, categoryId),
  };
};
