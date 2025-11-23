/**
 * Status Categories - Tab and Dropdown Configuration
 *
 * This file defines how statuses are grouped into categories (tabs).
 * Each category becomes a tab with a dropdown showing all statuses in that category.
 *
 * Structure:
 * - id: Unique category identifier (used in code)
 * - label: Display name for the tab
 * - statuses: Array of status IDs that belong to this category
 * - description: Human-readable explanation
 * - preferredViewMode: Default view mode when this tab is selected
 *
 * DROPDOWN FORMAT:
 * When a tab is clicked, the dropdown shows:
 * 1. Category Name + " " + Entity Name (e.g., "Active Listings")
 * 2. Divider
 * 3. List of all statuses in that category
 *
 * FUTURE: When users can create custom categories, this will be loaded
 * from the database instead of being hardcoded.
 */

// ============================================================================
// ESCROW CATEGORIES
// ============================================================================

export const ESCROW_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    displayName: 'Active Escrows', // For dropdown header
    statuses: ['Active'],
    description: 'Currently active escrows',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    displayName: 'Closed Escrows',
    statuses: ['Closed'],
    description: 'Successfully closed escrows',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    displayName: 'Cancelled Escrows',
    statuses: ['Cancelled'],
    description: 'Cancelled escrows',
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Escrows',
    displayName: 'All Escrows',
    statuses: ['Active', 'Closed', 'Cancelled'],
    description: 'All escrows regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// LISTING CATEGORIES
// ============================================================================

export const LISTING_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    displayName: 'Active Listings',
    statuses: ['Active', 'ActiveUnderContract', 'Pending'],
    description: 'Active listings and listings under contract',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    displayName: 'Closed Listings',
    statuses: ['Closed'],
    description: 'Successfully closed listings',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    displayName: 'Cancelled Listings',
    statuses: ['Cancelled', 'Expired', 'Withdrawn'],
    description: 'Cancelled, expired, or withdrawn listings',
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Listings',
    displayName: 'All Listings',
    statuses: ['Active', 'ActiveUnderContract', 'Pending', 'Closed', 'Cancelled', 'Expired', 'Withdrawn'],
    description: 'All listings regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// CLIENT CATEGORIES (Future Implementation)
// ============================================================================

export const CLIENT_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    displayName: 'Active Clients',
    statuses: ['active', 'prospecting', 'under_contract'],
    description: 'Currently active clients',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    displayName: 'Closed Clients',
    statuses: ['closed'],
    description: 'Successfully closed clients',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  INACTIVE: {
    id: 'inactive',
    label: 'Inactive',
    displayName: 'Inactive Clients',
    statuses: ['inactive', 'lost'],
    description: 'Inactive or lost clients',
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Clients',
    displayName: 'All Clients',
    statuses: ['active', 'prospecting', 'under_contract', 'closed', 'inactive', 'lost'],
    description: 'All clients regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// LEAD CATEGORIES (Future Implementation)
// ============================================================================

export const LEAD_CATEGORIES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    displayName: 'Active Leads',
    statuses: ['New', 'Contacted', 'Qualified', 'Nurturing'],
    description: 'Currently active leads',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CONVERTED: {
    id: 'converted',
    label: 'Converted',
    displayName: 'Converted Leads',
    statuses: ['Converted'],
    description: 'Leads converted to clients',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  LOST: {
    id: 'lost',
    label: 'Lost',
    displayName: 'Lost Leads',
    statuses: ['Unqualified', 'Lost', 'Dead'],
    description: 'Unqualified, lost, or dead leads',
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Leads',
    displayName: 'All Leads',
    statuses: ['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Unqualified', 'Lost', 'Dead'],
    description: 'All leads regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// APPOINTMENT CATEGORIES (Future Implementation)
// ============================================================================

export const APPOINTMENT_CATEGORIES = {
  SCHEDULED: {
    id: 'scheduled',
    label: 'Scheduled',
    displayName: 'Scheduled Appointments',
    statuses: ['scheduled', 'confirmed'],
    description: 'Upcoming appointments',
    preferredViewMode: 'calendar',
    sortOrder: 1,
  },
  COMPLETED: {
    id: 'completed',
    label: 'Completed',
    displayName: 'Completed Appointments',
    statuses: ['completed'],
    description: 'Completed appointments',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    displayName: 'Cancelled Appointments',
    statuses: ['cancelled', 'no_show'],
    description: 'Cancelled or no-show appointments',
    preferredViewMode: 'list',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Appointments',
    displayName: 'All Appointments',
    statuses: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    description: 'All appointments regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all categories for an entity
 * @param {string} entity - Entity name (escrows, listings, clients, leads, appointments)
 * @returns {object} Object of all categories
 */
export const getEntityCategories = (entity) => {
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
 * Get category by ID
 * @param {string} entity - Entity name
 * @param {string} categoryId - Category ID
 * @returns {object|null} Category definition or null if not found
 */
export const getCategoryById = (entity, categoryId) => {
  const categories = getEntityCategories(entity);

  for (const category of Object.values(categories)) {
    if (category.id === categoryId) {
      return category;
    }
  }

  return null;
};

/**
 * Get category that contains a specific status
 * @param {string} entity - Entity name
 * @param {string} statusId - Status ID
 * @returns {object|null} Category definition or null if not found
 */
export const getCategoryByStatus = (entity, statusId) => {
  const categories = getEntityCategories(entity);

  for (const category of Object.values(categories)) {
    if (category.statuses.includes(statusId)) {
      return category;
    }
  }

  return null;
};

/**
 * Get tabs for dashboard navigation (sorted by sortOrder)
 * Returns array suitable for rendering tabs
 * @param {string} entity - Entity name
 * @returns {array} Array of tab configs
 */
export const getEntityTabs = (entity) => {
  const categories = getEntityCategories(entity);

  return Object.values(categories)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(category => ({
      id: category.id,
      value: category.label,
      label: category.label,
      displayName: category.displayName,
      statuses: category.statuses,
      preferredViewMode: category.preferredViewMode,
      description: category.description,
    }));
};

/**
 * Get dropdown items for a category
 * Used when user clicks a tab to show status filter dropdown
 * @param {string} entity - Entity name
 * @param {string} categoryId - Category ID
 * @returns {object} { header, divider, items }
 */
export const getCategoryDropdown = (entity, categoryId) => {
  const category = getCategoryById(entity, categoryId);

  if (!category) {
    return { header: '', items: [] };
  }

  return {
    header: category.displayName, // "Active Listings"
    items: category.statuses, // ["Active", "ActiveUnderContract", "Pending"]
  };
};

/**
 * Check if a status belongs to a category
 * @param {string} entity - Entity name
 * @param {string} statusId - Status ID
 * @param {string} categoryId - Category ID
 * @returns {boolean} True if status is in category
 */
export const isStatusInCategory = (entity, statusId, categoryId) => {
  const category = getCategoryById(entity, categoryId);
  return category ? category.statuses.includes(statusId) : false;
};
