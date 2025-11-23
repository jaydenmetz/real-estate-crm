/**
 * Status Definitions - Single Source of Truth
 *
 * This file defines ALL statuses across all entities in one place.
 * Each status has:
 * - id: Unique identifier (database value)
 * - label: Display name in UI
 * - color: Primary color for chips/badges
 * - icon: MUI icon name
 * - description: Human-readable explanation
 *
 * FUTURE: When user-defined statuses are added, this will be dynamically
 * loaded from the database instead of being hardcoded.
 */

// ============================================================================
// ESCROW STATUSES
// ============================================================================

export const ESCROW_STATUSES = {
  ACTIVE: {
    id: 'Active',
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'trending_up',
    description: 'Currently active escrow in progress',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'Closed',
    label: 'Closed',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    icon: 'check_circle',
    description: 'Successfully closed escrow',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'Cancelled',
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Cancelled escrow',
    sortOrder: 3,
  },
};

// ============================================================================
// LISTING STATUSES
// ============================================================================

export const LISTING_STATUSES = {
  ACTIVE: {
    id: 'Active',
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'trending_up',
    description: 'Actively listed property',
    sortOrder: 1,
  },
  ACTIVE_UNDER_CONTRACT: {
    id: 'ActiveUnderContract',
    label: 'Active Under Contract',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'description',
    description: 'Active listing with accepted offer',
    sortOrder: 2,
  },
  PENDING: {
    id: 'Pending',
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: 'schedule',
    description: 'Pending sale',
    sortOrder: 3,
  },
  CLOSED: {
    id: 'Closed',
    label: 'Closed',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    icon: 'check_circle',
    description: 'Successfully closed listing',
    sortOrder: 4,
  },
  CANCELLED: {
    id: 'Cancelled',
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Cancelled listing',
    sortOrder: 5,
  },
  EXPIRED: {
    id: 'Expired',
    label: 'Expired',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    icon: 'schedule',
    description: 'Expired listing',
    sortOrder: 6,
  },
  WITHDRAWN: {
    id: 'Withdrawn',
    label: 'Withdrawn',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.1)',
    icon: 'remove_circle',
    description: 'Withdrawn from market',
    sortOrder: 7,
  },
  COMING_SOON: {
    id: 'Coming Soon',
    label: 'Coming Soon',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    icon: 'schedule',
    description: 'Coming soon to market',
    sortOrder: 0,
  },
};

// ============================================================================
// CLIENT STATUSES (Future Implementation)
// ============================================================================

export const CLIENT_STATUSES = {
  ACTIVE: {
    id: 'active',
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'person',
    description: 'Active client',
    sortOrder: 1,
  },
  PROSPECTING: {
    id: 'prospecting',
    label: 'Prospecting',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'person_search',
    description: 'Prospecting client',
    sortOrder: 2,
  },
  UNDER_CONTRACT: {
    id: 'under_contract',
    label: 'Under Contract',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: 'description',
    description: 'Client under contract',
    sortOrder: 3,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    icon: 'check_circle',
    description: 'Closed client',
    sortOrder: 4,
  },
  INACTIVE: {
    id: 'inactive',
    label: 'Inactive',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    icon: 'person_off',
    description: 'Inactive client',
    sortOrder: 5,
  },
  LOST: {
    id: 'lost',
    label: 'Lost',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Lost client',
    sortOrder: 6,
  },
};

// ============================================================================
// LEAD STATUSES (Future Implementation)
// ============================================================================

export const LEAD_STATUSES = {
  NEW: {
    id: 'New',
    label: 'New',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'fiber_new',
    description: 'New lead',
    sortOrder: 1,
  },
  CONTACTED: {
    id: 'Contacted',
    label: 'Contacted',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'phone',
    description: 'Contacted lead',
    sortOrder: 2,
  },
  QUALIFIED: {
    id: 'Qualified',
    label: 'Qualified',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    icon: 'verified',
    description: 'Qualified lead',
    sortOrder: 3,
  },
  NURTURING: {
    id: 'Nurturing',
    label: 'Nurturing',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: 'emoji_people',
    description: 'Nurturing lead',
    sortOrder: 4,
  },
  CONVERTED: {
    id: 'Converted',
    label: 'Converted',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    icon: 'check_circle',
    description: 'Converted to client',
    sortOrder: 5,
  },
  UNQUALIFIED: {
    id: 'Unqualified',
    label: 'Unqualified',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    icon: 'block',
    description: 'Unqualified lead',
    sortOrder: 6,
  },
  LOST: {
    id: 'Lost',
    label: 'Lost',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Lost lead',
    sortOrder: 7,
  },
  DEAD: {
    id: 'Dead',
    label: 'Dead',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.1)',
    icon: 'close',
    description: 'Dead lead',
    sortOrder: 8,
  },
};

// ============================================================================
// APPOINTMENT STATUSES (Future Implementation)
// ============================================================================

export const APPOINTMENT_STATUSES = {
  SCHEDULED: {
    id: 'scheduled',
    label: 'Scheduled',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'event',
    description: 'Scheduled appointment',
    sortOrder: 1,
  },
  CONFIRMED: {
    id: 'confirmed',
    label: 'Confirmed',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'check_circle',
    description: 'Confirmed appointment',
    sortOrder: 2,
  },
  COMPLETED: {
    id: 'completed',
    label: 'Completed',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    icon: 'done_all',
    description: 'Completed appointment',
    sortOrder: 3,
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Cancelled appointment',
    sortOrder: 4,
  },
  NO_SHOW: {
    id: 'no_show',
    label: 'No Show',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    icon: 'person_off',
    description: 'No show appointment',
    sortOrder: 5,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all statuses for an entity
 * @param {string} entity - Entity name (escrows, listings, clients, leads, appointments)
 * @returns {object} Object of all statuses
 */
export const getEntityStatuses = (entity) => {
  const statusMaps = {
    escrows: ESCROW_STATUSES,
    listings: LISTING_STATUSES,
    clients: CLIENT_STATUSES,
    leads: LEAD_STATUSES,
    appointments: APPOINTMENT_STATUSES,
  };

  return statusMaps[entity] || {};
};

/**
 * Get status definition by ID
 * @param {string} entity - Entity name
 * @param {string} statusId - Status ID
 * @returns {object|null} Status definition or null if not found
 */
export const getStatusById = (entity, statusId) => {
  const statuses = getEntityStatuses(entity);

  for (const status of Object.values(statuses)) {
    if (status.id === statusId) {
      return status;
    }
  }

  return null;
};

/**
 * Get all status IDs for an entity (sorted by sortOrder)
 * @param {string} entity - Entity name
 * @returns {array} Array of status IDs
 */
export const getStatusIds = (entity) => {
  const statuses = getEntityStatuses(entity);

  return Object.values(statuses)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(status => status.id);
};

/**
 * Get status options for dropdowns (sorted by sortOrder)
 * @param {string} entity - Entity name
 * @returns {array} Array of { value, label, color, icon }
 */
export const getStatusOptions = (entity) => {
  const statuses = getEntityStatuses(entity);

  return Object.values(statuses)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(status => ({
      value: status.id,
      label: status.label,
      color: status.color,
      bg: status.bg,
      icon: status.icon,
      description: status.description,
    }));
};
