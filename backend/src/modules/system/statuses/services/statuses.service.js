/**
 * Status System Service
 *
 * Provides database-driven status configuration
 * Replaces hardcoded status values with flexible, team-specific configurations
 *
 * Features:
 * - Team-specific status customization
 * - Status category groupings for tabs
 * - Status transition validation
 * - Fallback to system defaults if team hasn't customized
 */

const { pool } = require('../../../../config/infrastructure/database');

/**
 * Get all statuses for an entity type
 * @param {string} teamId - Team UUID
 * @param {string} entityType - escrows, listings, clients, leads, appointments
 * @returns {Promise<Array>} Array of status objects
 */
const getStatuses = async (teamId, entityType) => {
  const query = `
    SELECT
      id,
      status_key,
      label,
      description,
      color,
      icon,
      is_default,
      is_final,
      sort_order
    FROM statuses
    WHERE team_id = $1 AND entity_type = $2
    ORDER BY sort_order ASC, label ASC
  `;

  const result = await pool.query(query, [teamId, entityType]);

  // If team has no custom statuses, fall back to system defaults
  if (result.rows.length === 0) {
    const systemQuery = `
      SELECT
        id,
        status_key,
        label,
        description,
        color,
        icon,
        is_default,
        is_final,
        sort_order
      FROM statuses
      WHERE team_id = '00000000-0000-0000-0000-000000000000'
        AND entity_type = $1
      ORDER BY sort_order ASC, label ASC
    `;

    const systemResult = await pool.query(systemQuery, [entityType]);
    return systemResult.rows;
  }

  return result.rows;
};

/**
 * Get status categories (tabs) for an entity type
 * @param {string} teamId - Team UUID
 * @param {string} entityType - escrows, listings, clients, leads, appointments
 * @returns {Promise<Array>} Array of category objects with statuses
 */
const getStatusCategories = async (teamId, entityType) => {
  const query = `
    SELECT
      sc.id AS category_id,
      sc.category_key,
      sc.label AS category_label,
      sc.description AS category_description,
      sc.preferred_view_mode,
      sc.sort_order AS category_sort_order,
      json_agg(
        json_build_object(
          'id', s.id,
          'status_key', s.status_key,
          'label', s.label,
          'color', s.color,
          'icon', s.icon,
          'sort_order', scm.sort_order
        ) ORDER BY scm.sort_order ASC, s.label ASC
      ) AS statuses
    FROM status_categories sc
    LEFT JOIN status_category_mappings scm ON sc.id = scm.category_id
    LEFT JOIN statuses s ON scm.status_id = s.id
    WHERE sc.team_id = $1 AND sc.entity_type = $2
    GROUP BY sc.id, sc.category_key, sc.label, sc.description, sc.preferred_view_mode, sc.sort_order
    ORDER BY sc.sort_order ASC
  `;

  const result = await pool.query(query, [teamId, entityType]);

  // If team has no custom categories, fall back to system defaults
  if (result.rows.length === 0) {
    const systemQuery = `
      SELECT
        sc.id AS category_id,
        sc.category_key,
        sc.label AS category_label,
        sc.description AS category_description,
        sc.preferred_view_mode,
        sc.sort_order AS category_sort_order,
        json_agg(
          json_build_object(
            'id', s.id,
            'status_key', s.status_key,
            'label', s.label,
            'color', s.color,
            'icon', s.icon,
            'sort_order', scm.sort_order
          ) ORDER BY scm.sort_order ASC, s.label ASC
        ) AS statuses
      FROM status_categories sc
      LEFT JOIN status_category_mappings scm ON sc.id = scm.category_id
      LEFT JOIN statuses s ON scm.status_id = s.id
      WHERE sc.team_id = '00000000-0000-0000-0000-000000000000'
        AND sc.entity_type = $1
      GROUP BY sc.id, sc.category_key, sc.label, sc.description, sc.preferred_view_mode, sc.sort_order
      ORDER BY sc.sort_order ASC
    `;

    const systemResult = await pool.query(systemQuery, [entityType]);
    return systemResult.rows;
  }

  return result.rows;
};

/**
 * Get valid transitions from a status
 * @param {string} fromStatusId - Status UUID
 * @returns {Promise<Array>} Array of valid destination statuses
 */
const getValidTransitions = async (fromStatusId) => {
  const query = `
    SELECT
      st.id AS transition_id,
      st.requires_reason,
      st.allowed_roles,
      s.id AS to_status_id,
      s.status_key,
      s.label,
      s.color,
      s.icon
    FROM status_transitions st
    JOIN statuses s ON st.to_status_id = s.id
    WHERE st.from_status_id = $1
    ORDER BY s.label ASC
  `;

  const result = await pool.query(query, [fromStatusId]);
  return result.rows;
};

/**
 * Validate if a status transition is allowed
 * @param {string} fromStatusId - Current status UUID
 * @param {string} toStatusId - Desired status UUID
 * @param {string} userRole - User's role
 * @returns {Promise<Object>} { allowed: boolean, requiresReason: boolean, message?: string }
 */
const validateTransition = async (fromStatusId, toStatusId, userRole) => {
  const query = `
    SELECT
      requires_reason,
      allowed_roles
    FROM status_transitions
    WHERE from_status_id = $1 AND to_status_id = $2
  `;

  const result = await pool.query(query, [fromStatusId, toStatusId]);

  if (result.rows.length === 0) {
    return {
      allowed: false,
      message: 'This status transition is not allowed',
    };
  }

  const transition = result.rows[0];

  // Check role restrictions
  if (transition.allowed_roles && transition.allowed_roles.length > 0) {
    if (!transition.allowed_roles.includes(userRole)) {
      return {
        allowed: false,
        message: `Only ${transition.allowed_roles.join(', ')} can make this transition`,
      };
    }
  }

  return {
    allowed: true,
    requiresReason: transition.requires_reason,
  };
};

/**
 * Log a status change
 * @param {Object} params - { entityType, entityId, fromStatusId, toStatusId, changedBy, reason }
 * @returns {Promise<Object>} Created log entry
 */
const logStatusChange = async ({ entityType, entityId, fromStatusId, toStatusId, changedBy, reason }) => {
  const query = `
    INSERT INTO status_change_log (
      entity_type,
      entity_id,
      from_status_id,
      to_status_id,
      changed_by,
      reason
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const result = await pool.query(query, [
    entityType,
    entityId,
    fromStatusId,
    toStatusId,
    changedBy,
    reason,
  ]);

  return result.rows[0];
};

/**
 * Get status change history for an entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity UUID
 * @returns {Promise<Array>} Array of status changes
 */
const getStatusHistory = async (entityType, entityId) => {
  const query = `
    SELECT
      scl.id,
      scl.changed_at,
      scl.reason,
      from_status.label AS from_status_label,
      from_status.color AS from_status_color,
      to_status.label AS to_status_label,
      to_status.color AS to_status_color,
      u.first_name || ' ' || u.last_name AS changed_by_name,
      u.email AS changed_by_email
    FROM status_change_log scl
    LEFT JOIN statuses from_status ON scl.from_status_id = from_status.id
    LEFT JOIN statuses to_status ON scl.to_status_id = to_status.id
    LEFT JOIN users u ON scl.changed_by = u.id
    WHERE scl.entity_type = $1 AND scl.entity_id = $2
    ORDER BY scl.changed_at DESC
  `;

  const result = await pool.query(query, [entityType, entityId]);
  return result.rows;
};

/**
 * Create custom status for a team
 * @param {Object} params - { teamId, entityType, statusKey, label, color, icon, isDefault, isFinal }
 * @returns {Promise<Object>} Created status
 */
const createCustomStatus = async (params) => {
  const {
    teamId,
    entityType,
    statusKey,
    label,
    color = '#gray',
    icon = null,
    isDefault = false,
    isFinal = false,
    sortOrder = 99,
  } = params;

  const query = `
    INSERT INTO statuses (
      team_id,
      entity_type,
      status_key,
      label,
      color,
      icon,
      is_default,
      is_final,
      sort_order
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const result = await pool.query(query, [
    teamId,
    entityType,
    statusKey,
    label,
    color,
    icon,
    isDefault,
    isFinal,
    sortOrder,
  ]);

  return result.rows[0];
};

module.exports = {
  getStatuses,
  getStatusCategories,
  getValidTransitions,
  validateTransition,
  logStatusChange,
  getStatusHistory,
  createCustomStatus,
};
