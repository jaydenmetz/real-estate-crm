/**
 * Centralized Sort Utilities
 *
 * Provides consistent sorting behavior across all entity dashboards.
 * Handles status fields, date fields, currency fields, and string fields uniformly.
 *
 * Usage: Import and use createSortFunction() in entity configs
 */

import { ESCROW_CATEGORIES, LISTING_CATEGORIES, CLIENT_CATEGORIES, LEAD_CATEGORIES, APPOINTMENT_CATEGORIES } from '../config/statuses/statusCategories';

/**
 * Get status priority mapping for an entity
 * Uses the sortOrder from category configuration
 *
 * @param {string} entity - Entity name (escrows, listings, clients, leads, appointments)
 * @returns {object} Status to priority mapping
 */
const getStatusPriority = (entity) => {
  const categoryMaps = {
    escrows: ESCROW_CATEGORIES,
    listings: LISTING_CATEGORIES,
    clients: CLIENT_CATEGORIES,
    leads: LEAD_CATEGORIES,
    appointments: APPOINTMENT_CATEGORIES,
  };

  const categories = categoryMaps[entity];
  if (!categories) return {};

  // Build priority map from category sortOrder
  const priorityMap = {};
  Object.values(categories).forEach(category => {
    // For each status in the category, assign the category's sortOrder as priority
    category.statuses?.forEach(status => {
      if (!priorityMap[status]) {
        priorityMap[status] = category.sortOrder;
      }
    });
  });

  return priorityMap;
};

/**
 * Get the status field name for an entity
 *
 * @param {string} entity - Entity name
 * @returns {string} Status field name (e.g., 'escrow_status', 'listing_status')
 */
const getStatusFieldName = (entity) => {
  const fieldNames = {
    escrows: 'escrow_status',
    listings: 'listing_status',
    clients: 'client_status',
    leads: 'lead_status',
    appointments: 'appointment_status',
  };

  return fieldNames[entity] || 'status';
};

/**
 * Create a sort function for an entity
 *
 * @param {string} entity - Entity name (escrows, listings, clients, leads, appointments)
 * @returns {function} Sort function (data, field, order) => sortedData
 */
export const createSortFunction = (entity) => {
  const statusField = getStatusFieldName(entity);
  const statusPriority = getStatusPriority(entity);

  return (data, field, order = 'asc') => {
    return [...data].sort((a, b) => {
      let aVal = a[field];
      let bVal = b[field];

      // Handle null/undefined values (push to end)
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      // Handle status fields with priority order from categories
      if (field === statusField || field === 'status') {
        aVal = statusPriority[aVal] || 999;
        bVal = statusPriority[bVal] || 999;
      }
      // Handle date fields
      else if (field.includes('date') || field.includes('_at')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      // Handle currency/price fields
      else if (field.includes('price') || field.includes('amount') || field.includes('budget')) {
        aVal = parseFloat(aVal || 0);
        bVal = parseFloat(bVal || 0);
      }
      // Handle numeric fields
      else if (typeof aVal === 'number' && typeof bVal === 'number') {
        // Already numbers, no conversion needed
      }
      // Handle string fields (case-insensitive)
      else if (typeof aVal === 'string' && typeof bVal === 'string') {
        return order === 'asc'
          ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
          : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
      }

      // Numeric comparison
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });
  };
};

/**
 * Create sort options for an entity including status field
 *
 * @param {string} entity - Entity name
 * @param {array} customOptions - Additional sort options specific to entity
 * @returns {array} Complete sort options array
 */
export const createSortOptions = (entity, customOptions = []) => {
  const statusField = getStatusFieldName(entity);

  // Always include status as an option
  const statusOption = {
    value: statusField,
    label: 'Status'
  };

  // Check if status already exists in custom options
  const hasStatus = customOptions.some(opt => opt.value === statusField || opt.value === 'status');

  if (hasStatus) {
    return customOptions;
  }

  return [...customOptions, statusOption];
};

/**
 * Get status field name for an entity (exported for external use)
 */
export { getStatusFieldName };

/**
 * Get status priority for an entity (exported for external use)
 */
export { getStatusPriority };
