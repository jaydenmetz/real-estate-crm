/**
 * Status Categories - Backend Version
 *
 * This mirrors the frontend category definitions for backend filtering and validation.
 * Used for API query parameters, filtering, and analytics.
 *
 * IMPORTANT: Keep this in sync with frontend version:
 * /frontend/src/config/statuses/statusCategories.js
 */

// ============================================================================
// ESCROW CATEGORIES
// ============================================================================

const ESCROW_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    statuses: ['Active'],
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    statuses: ['Closed'],
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    statuses: ['Cancelled'],
  },
  ALL: {
    id: 'all',
    label: 'All',
    statuses: ['Active', 'Closed', 'Cancelled'],
  },
};

// ============================================================================
// LISTING CATEGORIES
// ============================================================================

const LISTING_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    statuses: ['Active', 'ActiveUnderContract', 'Pending'],
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    statuses: ['Closed'],
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    statuses: ['Cancelled', 'Expired', 'Withdrawn'],
  },
  ALL: {
    id: 'all',
    label: 'All',
    statuses: ['Active', 'ActiveUnderContract', 'Pending', 'Closed', 'Cancelled', 'Expired', 'Withdrawn'],
  },
};

// ============================================================================
// CLIENT CATEGORIES
// ============================================================================

const CLIENT_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    statuses: ['active', 'prospecting', 'under_contract'],
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    statuses: ['closed'],
  },
  INACTIVE: {
    id: 'inactive',
    label: 'Inactive',
    statuses: ['inactive', 'lost'],
  },
  ALL: {
    id: 'all',
    label: 'All',
    statuses: ['active', 'prospecting', 'under_contract', 'closed', 'inactive', 'lost'],
  },
};

// ============================================================================
// LEAD CATEGORIES
// ============================================================================

const LEAD_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    statuses: ['New', 'Contacted', 'Qualified', 'Nurturing'],
  },
  CONVERTED: {
    id: 'converted',
    label: 'Converted',
    statuses: ['Converted'],
  },
  LOST: {
    id: 'lost',
    label: 'Lost',
    statuses: ['Unqualified', 'Lost', 'Dead'],
  },
  ALL: {
    id: 'all',
    label: 'All',
    statuses: ['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Unqualified', 'Lost', 'Dead'],
  },
};

// ============================================================================
// APPOINTMENT CATEGORIES
// ============================================================================

const APPOINTMENT_CATEGORIES = {
  SCHEDULED: {
    id: 'scheduled',
    label: 'Scheduled',
    statuses: ['scheduled', 'confirmed'],
  },
  COMPLETED: {
    id: 'completed',
    label: 'Completed',
    statuses: ['completed'],
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    statuses: ['cancelled', 'no_show'],
  },
  ALL: {
    id: 'all',
    label: 'All',
    statuses: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all categories for an entity
 * @param {string} entity - Entity name
 * @returns {object} Categories object
 */
const getEntityCategories = (entity) => {
  const categoryMaps = {
    escrows: ESCROW_CATEGORIES,
    listings: LISTING_CATEGORIES,
    clients: CLIENT_CATEGORIES,
    leads: LEAD_CATEGORIES,
    appointments: APPOINTMENT_CATEGORIES,
  };

  return categoryMaps[entity] || {};
};

/**
 * Get statuses for a category (used in API filtering)
 * @param {string} entity - Entity name
 * @param {string} categoryId - Category ID
 * @returns {array} Array of status strings
 */
const getCategoryStatuses = (entity, categoryId) => {
  const categories = getEntityCategories(entity);

  for (const category of Object.values(categories)) {
    if (category.id === categoryId || category.label === categoryId) {
      return category.statuses;
    }
  }

  return [];
};

/**
 * Build SQL WHERE clause for category filtering
 * @param {string} entity - Entity name
 * @param {string} categoryId - Category ID
 * @param {string} statusColumn - Name of status column (default: entity_status)
 * @returns {string} SQL WHERE clause fragment
 */
const buildCategoryWhereClause = (entity, categoryId, statusColumn = null) => {
  const column = statusColumn || `${entity.slice(0, -1)}_status`;
  const statuses = getCategoryStatuses(entity, categoryId);

  if (statuses.length === 0) {
    return '1=1'; // Return all if category not found
  }

  if (statuses.length === 1) {
    return `${column} = '${statuses[0]}'`;
  }

  const statusList = statuses.map(s => `'${s}'`).join(', ');
  return `${column} IN (${statusList})`;
};

/**
 * Check if a status belongs to a category
 * @param {string} entity - Entity name
 * @param {string} status - Status to check
 * @param {string} categoryId - Category ID
 * @returns {boolean} True if status is in category
 */
const isStatusInCategory = (entity, status, categoryId) => {
  const statuses = getCategoryStatuses(entity, categoryId);
  return statuses.includes(status);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Category constants
  ESCROW_CATEGORIES,
  LISTING_CATEGORIES,
  CLIENT_CATEGORIES,
  LEAD_CATEGORIES,
  APPOINTMENT_CATEGORIES,

  // Helper functions
  getEntityCategories,
  getCategoryStatuses,
  buildCategoryWhereClause,
  isStatusInCategory,
};
