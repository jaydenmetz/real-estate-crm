/**
 * Status Group Definitions
 *
 * Defines how database statuses map to dashboard categories/tabs across all entities.
 * This creates a consistent business logic structure:
 *
 * - active: Items currently being worked on (opportunity in progress)
 * - won: Successfully completed items (opportunity won)
 * - lost: Unsuccessful/cancelled items (opportunity lost)
 * - all: All items regardless of status
 *
 * Each group defines:
 * - label: Display name for the tab
 * - statuses: Array of database status values that belong to this group
 * - description: Human-readable explanation
 */

// ============================================================================
// ESCROWS
// ============================================================================

export const ESCROW_STATUS_GROUPS = {
  // Active Database Items Name - Active
  active: {
    label: 'Active',
    statuses: ['Active'],
    description: 'Currently active escrows in progress'
  },

  // Opportunity Won Items Name - Closed
  won: {
    label: 'Closed',
    statuses: ['Closed'],
    description: 'Successfully closed escrows'
  },

  // Opportunity Lost Items Name - Cancelled
  lost: {
    label: 'Cancelled',
    statuses: ['Cancelled'],
    description: 'Cancelled escrows'
  },

  // All Items - All Escrows
  all: {
    label: 'All Escrows',
    statuses: ['Active', 'Closed', 'Cancelled'],
    description: 'All escrows regardless of status'
  }
};

// ============================================================================
// LISTINGS
// ============================================================================

export const LISTING_STATUS_GROUPS = {
  // Active Database Items Name - Active
  // Includes: Active, Pending (under contract)
  active: {
    label: 'Active',
    statuses: ['Active', 'Pending', 'Coming Soon'],
    description: 'Active listings and listings under contract'
  },

  // Opportunity Won Items Name - Closed
  won: {
    label: 'Closed',
    statuses: ['Closed'],
    description: 'Successfully closed listings'
  },

  // Opportunity Lost Items Name - Cancelled
  // Includes: Cancelled, Expired, Withdrawn, Off Market
  lost: {
    label: 'Cancelled',
    statuses: ['Cancelled', 'Expired', 'Withdrawn', 'Off Market'],
    description: 'Cancelled, expired, withdrawn, or off-market listings'
  },

  // All Items - All Listings
  all: {
    label: 'All Listings',
    statuses: ['Active', 'Pending', 'Coming Soon', 'Closed', 'Cancelled', 'Expired', 'Withdrawn', 'Off Market'],
    description: 'All listings regardless of status'
  }
};

// ============================================================================
// CLIENTS
// ============================================================================

export const CLIENT_STATUS_GROUPS = {
  // Active Database Items Name - Active
  active: {
    label: 'Active',
    statuses: ['active', 'prospecting', 'under_contract'],
    description: 'Currently active clients'
  },

  // Opportunity Won Items Name - Closed
  won: {
    label: 'Closed',
    statuses: ['closed'],
    description: 'Successfully closed clients'
  },

  // Opportunity Lost Items Name - Inactive
  lost: {
    label: 'Inactive',
    statuses: ['inactive', 'lost'],
    description: 'Inactive or lost clients'
  },

  // All Items - All Clients
  all: {
    label: 'All Clients',
    statuses: ['active', 'prospecting', 'under_contract', 'closed', 'inactive', 'lost'],
    description: 'All clients regardless of status'
  }
};

// ============================================================================
// LEADS
// ============================================================================

export const LEAD_STATUS_GROUPS = {
  // Active Database Items Name - Active
  active: {
    label: 'Active',
    statuses: ['New', 'Contacted', 'Qualified', 'Nurturing'],
    description: 'Currently active leads being pursued'
  },

  // Opportunity Won Items Name - Converted
  won: {
    label: 'Converted',
    statuses: ['Converted'],
    description: 'Leads converted to clients'
  },

  // Opportunity Lost Items Name - Lost
  lost: {
    label: 'Lost',
    statuses: ['Unqualified', 'Lost', 'Dead'],
    description: 'Unqualified, lost, or dead leads'
  },

  // All Items - All Leads
  all: {
    label: 'All Leads',
    statuses: ['New', 'Contacted', 'Qualified', 'Nurturing', 'Converted', 'Unqualified', 'Lost', 'Dead'],
    description: 'All leads regardless of status'
  }
};

// ============================================================================
// APPOINTMENTS
// ============================================================================

export const APPOINTMENT_STATUS_GROUPS = {
  // Active Database Items Name - Scheduled
  active: {
    label: 'Scheduled',
    statuses: ['scheduled', 'confirmed'],
    description: 'Upcoming scheduled appointments'
  },

  // Opportunity Won Items Name - Completed
  won: {
    label: 'Completed',
    statuses: ['completed'],
    description: 'Successfully completed appointments'
  },

  // Opportunity Lost Items Name - Cancelled
  lost: {
    label: 'Cancelled',
    statuses: ['cancelled', 'no_show'],
    description: 'Cancelled or no-show appointments'
  },

  // All Items - All Appointments
  all: {
    label: 'All Appointments',
    statuses: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'],
    description: 'All appointments regardless of status'
  }
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get status group configuration for an entity
 * @param {string} entity - Entity name (escrows, listings, clients, leads, appointments)
 * @returns {object} Status group configuration
 */
export const getStatusGroups = (entity) => {
  const groups = {
    escrows: ESCROW_STATUS_GROUPS,
    listings: LISTING_STATUS_GROUPS,
    clients: CLIENT_STATUS_GROUPS,
    leads: LEAD_STATUS_GROUPS,
    appointments: APPOINTMENT_STATUS_GROUPS,
  };

  return groups[entity] || {};
};

/**
 * Get statuses for a specific group
 * @param {string} entity - Entity name
 * @param {string} group - Group name (active, won, lost, all)
 * @returns {array} Array of status strings
 */
export const getGroupStatuses = (entity, group) => {
  const groups = getStatusGroups(entity);
  return groups[group]?.statuses || [];
};

/**
 * Check if a status belongs to a group
 * @param {string} entity - Entity name
 * @param {string} status - Status to check
 * @param {string} group - Group name
 * @returns {boolean} True if status is in group
 */
export const isStatusInGroup = (entity, status, group) => {
  const statuses = getGroupStatuses(entity, group);
  return statuses.includes(status);
};

/**
 * Get the group that a status belongs to
 * @param {string} entity - Entity name
 * @param {string} status - Status to find
 * @returns {string|null} Group name (active, won, lost) or null if not found
 */
export const getStatusGroup = (entity, status) => {
  const groups = getStatusGroups(entity);

  for (const [groupName, groupConfig] of Object.entries(groups)) {
    if (groupName === 'all') continue; // Skip 'all' group
    if (groupConfig.statuses.includes(status)) {
      return groupName;
    }
  }

  return null;
};

/**
 * Get all tab configurations for an entity
 * Useful for dashboard navigation
 * @param {string} entity - Entity name
 * @returns {array} Array of tab configs
 */
export const getEntityTabs = (entity) => {
  const groups = getStatusGroups(entity);

  return Object.entries(groups).map(([key, config]) => ({
    value: config.label,
    label: config.label,
    statuses: config.statuses,
    group: key,
  }));
};
