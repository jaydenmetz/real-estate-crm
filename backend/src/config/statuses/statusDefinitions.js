/**
 * Status Definitions - Backend Version
 *
 * This mirrors the frontend status definitions but is optimized for backend use.
 * Used for validation, database queries, and business logic.
 *
 * IMPORTANT: Keep this in sync with frontend version:
 * /frontend/src/config/statuses/statusDefinitions.js
 *
 * FUTURE: Load from database for user-defined statuses
 */

// ============================================================================
// ESCROW STATUSES
// ============================================================================

const ESCROW_STATUSES = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
};

// Valid status transitions
const ESCROW_STATUS_TRANSITIONS = {
  Active: ['Closed', 'Cancelled'],
  Closed: [], // Terminal state
  Cancelled: [], // Terminal state
};

// ============================================================================
// LISTING STATUSES
// ============================================================================

const LISTING_STATUSES = {
  COMING_SOON: 'Coming Soon',
  ACTIVE: 'Active',
  ACTIVE_UNDER_CONTRACT: 'ActiveUnderContract',
  PENDING: 'Pending',
  CLOSED: 'Closed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
  WITHDRAWN: 'Withdrawn',
};

// Valid status transitions
const LISTING_STATUS_TRANSITIONS = {
  'Coming Soon': ['Active', 'Cancelled'],
  Active: ['ActiveUnderContract', 'Pending', 'Closed', 'Cancelled', 'Expired', 'Withdrawn'],
  ActiveUnderContract: ['Pending', 'Active', 'Cancelled'],
  Pending: ['Closed', 'Active', 'Cancelled'],
  Closed: [], // Terminal state
  Cancelled: ['Active'], // Can reactivate
  Expired: ['Active', 'Withdrawn'],
  Withdrawn: ['Active'],
};

// ============================================================================
// CLIENT STATUSES
// ============================================================================

const CLIENT_STATUSES = {
  ACTIVE: 'active',
  PROSPECTING: 'prospecting',
  UNDER_CONTRACT: 'under_contract',
  CLOSED: 'closed',
  INACTIVE: 'inactive',
  LOST: 'lost',
};

// Valid status transitions
const CLIENT_STATUS_TRANSITIONS = {
  active: ['prospecting', 'under_contract', 'closed', 'inactive', 'lost'],
  prospecting: ['active', 'under_contract', 'lost'],
  under_contract: ['closed', 'active', 'lost'],
  closed: ['active'], // Can become active again for repeat business
  inactive: ['active', 'lost'],
  lost: ['active'], // Can re-engage
};

// ============================================================================
// LEAD STATUSES
// ============================================================================

const LEAD_STATUSES = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  NURTURING: 'Nurturing',
  CONVERTED: 'Converted',
  UNQUALIFIED: 'Unqualified',
  LOST: 'Lost',
  DEAD: 'Dead',
};

// Valid status transitions
const LEAD_STATUS_TRANSITIONS = {
  New: ['Contacted', 'Unqualified', 'Dead'],
  Contacted: ['Qualified', 'Nurturing', 'Unqualified', 'Dead'],
  Qualified: ['Nurturing', 'Converted', 'Lost'],
  Nurturing: ['Converted', 'Qualified', 'Lost', 'Dead'],
  Converted: [], // Terminal state
  Unqualified: ['New'], // Can re-engage
  Lost: ['New'], // Can re-engage
  Dead: [], // Terminal state
};

// ============================================================================
// APPOINTMENT STATUSES
// ============================================================================

const APPOINTMENT_STATUSES = {
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
};

// Valid status transitions
const APPOINTMENT_STATUS_TRANSITIONS = {
  scheduled: ['confirmed', 'cancelled', 'completed', 'no_show'],
  confirmed: ['completed', 'cancelled', 'no_show'],
  completed: [], // Terminal state
  cancelled: ['scheduled'], // Can reschedule
  no_show: ['scheduled'], // Can reschedule
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all valid statuses for an entity
 * @param {string} entity - Entity name
 * @returns {array} Array of valid status strings
 */
const getValidStatuses = (entity) => {
  const statusMaps = {
    escrows: Object.values(ESCROW_STATUSES),
    listings: Object.values(LISTING_STATUSES),
    clients: Object.values(CLIENT_STATUSES),
    leads: Object.values(LEAD_STATUSES),
    appointments: Object.values(APPOINTMENT_STATUSES),
  };

  return statusMaps[entity] || [];
};

/**
 * Validate if a status is valid for an entity
 * @param {string} entity - Entity name
 * @param {string} status - Status to validate
 * @returns {boolean} True if valid
 */
const isValidStatus = (entity, status) => {
  const validStatuses = getValidStatuses(entity);
  return validStatuses.includes(status);
};

/**
 * Get valid status transitions for a current status
 * @param {string} entity - Entity name
 * @param {string} currentStatus - Current status
 * @returns {array} Array of valid next statuses
 */
const getValidTransitions = (entity, currentStatus) => {
  const transitionMaps = {
    escrows: ESCROW_STATUS_TRANSITIONS,
    listings: LISTING_STATUS_TRANSITIONS,
    clients: CLIENT_STATUS_TRANSITIONS,
    leads: LEAD_STATUS_TRANSITIONS,
    appointments: APPOINTMENT_STATUS_TRANSITIONS,
  };

  const transitions = transitionMaps[entity];
  return transitions?.[currentStatus] || [];
};

/**
 * Validate if a status transition is allowed
 * @param {string} entity - Entity name
 * @param {string} currentStatus - Current status
 * @param {string} newStatus - New status to transition to
 * @returns {boolean} True if transition is valid
 */
const isValidTransition = (entity, currentStatus, newStatus) => {
  const validTransitions = getValidTransitions(entity, currentStatus);
  return validTransitions.includes(newStatus);
};

/**
 * Check if a status is a terminal state (no transitions allowed)
 * @param {string} entity - Entity name
 * @param {string} status - Status to check
 * @returns {boolean} True if terminal state
 */
const isTerminalStatus = (entity, status) => {
  const validTransitions = getValidTransitions(entity, status);
  return validTransitions.length === 0;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Status constants
  ESCROW_STATUSES,
  LISTING_STATUSES,
  CLIENT_STATUSES,
  LEAD_STATUSES,
  APPOINTMENT_STATUSES,

  // Transition rules
  ESCROW_STATUS_TRANSITIONS,
  LISTING_STATUS_TRANSITIONS,
  CLIENT_STATUS_TRANSITIONS,
  LEAD_STATUS_TRANSITIONS,
  APPOINTMENT_STATUS_TRANSITIONS,

  // Helper functions
  getValidStatuses,
  isValidStatus,
  getValidTransitions,
  isValidTransition,
  isTerminalStatus,
};
