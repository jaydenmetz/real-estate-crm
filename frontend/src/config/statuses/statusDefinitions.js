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
// Uses lowercase status IDs to match database status_key values
// ============================================================================

export const ESCROW_STATUSES = {
  ACTIVE: {
    id: 'active',  // Matches database status_key
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'trending_up',
    description: 'Currently active escrow in progress',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'check_circle',
    description: 'Successfully closed escrow',
    sortOrder: 2,
  },
  CANCELLED: {
    id: 'cancelled',
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
// Uses lowercase status IDs to match database status_key values
// ============================================================================

export const LISTING_STATUSES = {
  ACTIVE: {
    id: 'active',  // Matches database status_key
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'trending_up',
    description: 'Actively listed property',
    sortOrder: 1,
  },
  ACTIVE_UNDER_CONTRACT: {
    id: 'active_under_contract',
    label: 'Active Under Contract',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    icon: 'handshake',
    description: 'Active listing with accepted offer',
    sortOrder: 2,
  },
  PENDING: {
    id: 'pending',
    label: 'Pending',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: 'schedule',
    description: 'Pending sale',
    sortOrder: 3,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'check_circle',
    description: 'Successfully closed listing',
    sortOrder: 4,
  },
  EXPIRED: {
    id: 'expired',
    label: 'Expired',
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.1)',
    icon: 'schedule',
    description: 'Expired listing',
    sortOrder: 5,
  },
  WITHDRAWN: {
    id: 'withdrawn',
    label: 'Withdrawn',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.1)',
    icon: 'remove_circle',
    description: 'Withdrawn from market',
    sortOrder: 6,
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Cancelled listing',
    sortOrder: 7,
  },
};

// ============================================================================
// CLIENT STATUSES
// Uses lowercase status IDs to match database status_key values
// Database statuses: active (active), closed (won), expired, cancelled (lost)
// ============================================================================

export const CLIENT_STATUSES = {
  ACTIVE: {
    id: 'active',  // Matches database status_key
    label: 'Active',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'person',
    description: 'Active client',
    sortOrder: 1,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'check_circle',
    description: 'Closed client (transaction completed)',
    sortOrder: 2,
  },
  EXPIRED: {
    id: 'expired',
    label: 'Expired',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    icon: 'schedule',
    description: 'Expired client',
    sortOrder: 3,
  },
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Cancelled client',
    sortOrder: 4,
  },
};

// ============================================================================
// LEAD STATUSES
// Uses lowercase status IDs to match database status_key values
// Active: new, contacted, met | Won: under_contract, closed | Lost: competing, rejected, unresponsive, deferred, unqualified
// ============================================================================

export const LEAD_STATUSES = {
  // Active category (3 statuses)
  NEW: {
    id: 'new',  // Matches database status_key
    label: 'New',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'fiber_new',
    description: 'New lead',
    sortOrder: 1,
  },
  CONTACTED: {
    id: 'contacted',
    label: 'Contacted',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    icon: 'phone',
    description: 'Contacted lead',
    sortOrder: 2,
  },
  MET: {
    id: 'met',
    label: 'Met',
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    icon: 'handshake',
    description: 'Met with lead',
    sortOrder: 3,
  },
  // Won category (2 statuses)
  UNDER_CONTRACT: {
    id: 'under_contract',
    label: 'Under Contract',
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    icon: 'description',
    description: 'Lead under contract',
    sortOrder: 4,
  },
  CLOSED: {
    id: 'closed',
    label: 'Closed',
    color: '#06b6d4',
    bg: 'rgba(6, 182, 212, 0.1)',
    icon: 'check_circle',
    description: 'Closed lead (won)',
    sortOrder: 5,
  },
  // Lost category (5 statuses)
  COMPETING: {
    id: 'competing',
    label: 'Competing',
    color: '#f97316',
    bg: 'rgba(249, 115, 22, 0.1)',
    icon: 'groups',
    description: 'Competing with other agents',
    sortOrder: 6,
  },
  REJECTED: {
    id: 'rejected',
    label: 'Rejected',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Lead rejected',
    sortOrder: 7,
  },
  UNRESPONSIVE: {
    id: 'unresponsive',
    label: 'Unresponsive',
    color: '#94a3b8',
    bg: 'rgba(148, 163, 184, 0.1)',
    icon: 'phone_disabled',
    description: 'Lead not responding',
    sortOrder: 8,
  },
  DEFERRED: {
    id: 'deferred',
    label: 'Deferred',
    color: '#a855f7',
    bg: 'rgba(168, 85, 247, 0.1)',
    icon: 'schedule',
    description: 'Lead deferred for later',
    sortOrder: 9,
  },
  UNQUALIFIED: {
    id: 'unqualified',
    label: 'Unqualified',
    color: '#6b7280',
    bg: 'rgba(107, 114, 128, 0.1)',
    icon: 'block',
    description: 'Lead not qualified',
    sortOrder: 10,
  },
};

// ============================================================================
// APPOINTMENT STATUSES
// Uses lowercase status IDs to match database status_key values
// Active: scheduled, confirmed, rescheduled | Won: completed | Lost: cancelled, no_show
// ============================================================================

export const APPOINTMENT_STATUSES = {
  // Active category (3 statuses)
  SCHEDULED: {
    id: 'scheduled',  // Matches database status_key
    label: 'Scheduled',
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    icon: 'schedule',
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
  RESCHEDULED: {
    id: 'rescheduled',
    label: 'Rescheduled',
    color: '#8b5cf6',
    bg: 'rgba(139, 92, 246, 0.1)',
    icon: 'event_repeat',
    description: 'Rescheduled appointment',
    sortOrder: 3,
  },
  // Won category (1 status)
  COMPLETED: {
    id: 'completed',
    label: 'Completed',
    color: '#6366f1',
    bg: 'rgba(99, 102, 241, 0.1)',
    icon: 'task_alt',
    description: 'Completed appointment',
    sortOrder: 4,
  },
  // Lost category (2 statuses)
  CANCELLED: {
    id: 'cancelled',
    label: 'Cancelled',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    icon: 'cancel',
    description: 'Cancelled appointment',
    sortOrder: 5,
  },
  NO_SHOW: {
    id: 'no_show',
    label: 'No-Show',
    color: '#dc2626',
    bg: 'rgba(220, 38, 38, 0.1)',
    icon: 'person_off',
    description: 'No-show appointment',
    sortOrder: 6,
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
