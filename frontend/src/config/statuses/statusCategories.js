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
// Uses lowercase category IDs to match database category_key values
// ============================================================================

export const ESCROW_CATEGORIES = {
  ACTIVE: {
    id: 'active',  // Matches database category_key
    label: 'Active',
    displayName: 'Active Escrows', // For dropdown header
    statuses: ['active'],  // Matches database status_key
    description: 'Currently active escrows',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'won',  // Matches database category_key (closed = won category)
    label: 'Closed',
    displayName: 'Closed Escrows',
    statuses: ['closed'],
    description: 'Successfully closed escrows',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'lost',  // Matches database category_key (cancelled = lost category)
    label: 'Cancelled',
    displayName: 'Cancelled Escrows',
    statuses: ['cancelled'],
    description: 'Cancelled escrows',
    preferredViewMode: 'table',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Escrows',
    displayName: 'All Escrows',
    statuses: ['active', 'closed', 'cancelled'],
    description: 'All escrows regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// LISTING CATEGORIES
// Uses lowercase category IDs to match database category_key values
// ============================================================================

export const LISTING_CATEGORIES = {
  ACTIVE: {
    id: 'active',  // Matches database category_key
    label: 'Active',
    displayName: 'Active Listings',
    statuses: ['active', 'active_under_contract', 'pending'],  // Matches database status_key
    description: 'Active listings and listings under contract',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'won',  // Matches database category_key (closed = won category)
    label: 'Closed',
    displayName: 'Closed Listings',
    statuses: ['closed'],
    description: 'Successfully closed listings',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  EXPIRED: {
    id: 'lost',  // Matches database category_key (cancelled/expired/withdrawn = lost category)
    label: 'Expired',
    displayName: 'Expired Listings',
    statuses: ['cancelled', 'expired', 'withdrawn'],
    description: 'Cancelled, expired, or withdrawn listings',
    preferredViewMode: 'table',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Listings',
    displayName: 'All Listings',
    statuses: ['active', 'active_under_contract', 'pending', 'closed', 'cancelled', 'expired', 'withdrawn'],
    description: 'All listings regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// CLIENT CATEGORIES
// Uses lowercase category IDs to match database category_key values
// Database statuses: active, closed, expired, cancelled
// ============================================================================

export const CLIENT_CATEGORIES = {
  ACTIVE: {
    id: 'active',  // Matches database category_key
    label: 'Active',
    displayName: 'Active Clients',
    statuses: ['active'],  // Matches database status_key
    description: 'Active clients',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'won',  // Matches database category_key (closed = won category)
    label: 'Closed',
    displayName: 'Closed Clients',
    statuses: ['closed'],
    description: 'Closed clients (transactions completed)',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  INACTIVE: {
    id: 'lost',  // Matches database category_key (expired/cancelled = lost category)
    label: 'Inactive',
    displayName: 'Inactive Clients',
    statuses: ['expired', 'cancelled'],
    description: 'Expired or cancelled clients',
    preferredViewMode: 'table',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Clients',
    displayName: 'All Clients',
    statuses: ['active', 'closed', 'expired', 'cancelled'],
    description: 'All clients regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// LEAD CATEGORIES
// Uses lowercase category IDs to match database category_key values
// Database statuses: new, contacted, met (active), under_contract, closed (won),
//   competing, rejected, unresponsive, deferred, unqualified (lost)
// ============================================================================

export const LEAD_CATEGORIES = {
  ACTIVE: {
    id: 'active',  // Matches database category_key
    label: 'Active',
    displayName: 'Active Leads',
    statuses: ['new', 'contacted', 'met'],  // Matches database status_key
    description: 'Currently active leads',
    preferredViewMode: 'card',
    sortOrder: 1,
  },
  WON: {
    id: 'won',  // Matches database category_key
    label: 'Won',
    displayName: 'Won Leads',
    statuses: ['under_contract', 'closed'],
    description: 'Leads under contract or closed',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  LOST: {
    id: 'lost',  // Matches database category_key
    label: 'Lost',
    displayName: 'Lost Leads',
    statuses: ['competing', 'rejected', 'unresponsive', 'deferred', 'unqualified'],
    description: 'Lost or unqualified leads',
    preferredViewMode: 'table',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Leads',
    displayName: 'All Leads',
    statuses: ['new', 'contacted', 'met', 'under_contract', 'closed', 'competing', 'rejected', 'unresponsive', 'deferred', 'unqualified'],
    description: 'All leads regardless of status',
    preferredViewMode: 'card',
    sortOrder: 4,
  },
};

// ============================================================================
// APPOINTMENT CATEGORIES
// Uses lowercase category IDs to match database category_key values
// Database statuses: scheduled, confirmed, rescheduled (active), completed (won),
//   cancelled, no_show (lost)
// ============================================================================

export const APPOINTMENT_CATEGORIES = {
  ACTIVE: {
    id: 'active',  // Matches database category_key
    label: 'Active',
    displayName: 'Active Appointments',
    statuses: ['scheduled', 'confirmed', 'rescheduled'],  // Matches database status_key
    description: 'Upcoming appointments',
    preferredViewMode: 'calendar',
    sortOrder: 1,
  },
  WON: {
    id: 'won',  // Matches database category_key (completed = won)
    label: 'Completed',
    displayName: 'Completed Appointments',
    statuses: ['completed'],
    description: 'Completed appointments',
    preferredViewMode: 'list',
    sortOrder: 2,
  },
  LOST: {
    id: 'lost',  // Matches database category_key (cancelled/no_show = lost)
    label: 'Cancelled',
    displayName: 'Cancelled Appointments',
    statuses: ['cancelled', 'no_show'],
    description: 'Cancelled or no-show appointments',
    preferredViewMode: 'table',
    sortOrder: 3,
  },
  ALL: {
    id: 'all',
    label: 'All Appointments',
    displayName: 'All Appointments',
    statuses: ['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show'],
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
      value: category.id, // Use ID for consistency across entities ("all", "active", "closed")
      label: category.label, // Display label can be entity-specific ("All Escrows", "All Listings")
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
