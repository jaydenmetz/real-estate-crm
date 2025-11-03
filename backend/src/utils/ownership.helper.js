/**
 * Ownership Query Helper
 * Builds SQL WHERE clauses for multi-tenant data filtering
 *
 * Phase 6 Updates (October 2025):
 * - Now uses access_level column (personal, team, broker)
 * - is_private overrides access_level (private = owner only)
 * - Applies to all 5 core tables: escrows, clients, listings, leads, appointments
 *
 * Usage in controllers:
 * const { whereClause, params } = buildOwnershipWhereClause(req.user, req.query.scope, resourceType);
 * const query = `SELECT * FROM ${resourceType}s WHERE ${whereClause} AND other_conditions`;
 * const result = await pool.query(query, [...params, ...otherParams]);
 */

const pool = require('../config/database');

/**
 * Build WHERE clause for ownership filtering
 * @param {Object} user - req.user object { id, role, broker_id, team_id }
 * @param {string} scope - Scope filter ('user', 'team', 'brokerage', 'all')
 * @param {string} resourceType - Resource type ('escrow', 'client', 'listing', 'lead', 'appointment')
 * @param {number} startParamIndex - Starting parameter index for SQL query (default: 1)
 * @returns {Object} - { whereClause: string, params: array, nextParamIndex: number }
 */
function buildOwnershipWhereClause(user, scope = 'user', resourceType, startParamIndex = 1) {
  const { id: userId, role, broker_id, team_id } = user;
  const params = [];
  const conditions = [];
  let paramIndex = startParamIndex;

  // Prefix for table alias (e.g., 'e.' for escrows)
  const tablePrefix = resourceType ? `${resourceType.charAt(0)}.` : '';

  // system_admin sees everything (no filter needed for 'all' scope)
  if (role === 'system_admin') {
    if (scope === 'user') {
      conditions.push(`${tablePrefix}owner_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }
    // For 'all', 'brokerage', 'team' - no filter needed for system_admin
    return { whereClause: conditions.join(' AND ') || '1=1', params, nextParamIndex: paramIndex };
  }

  // Handle scope-based filtering
  if (scope === 'user') {
    // User's own resources
    conditions.push(`${tablePrefix}owner_id = $${paramIndex}`);
    params.push(userId);
    paramIndex++;

  } else if (scope === 'team') {
    // Team resources (non-private)
    conditions.push(`${tablePrefix}team_id = $${paramIndex}`);
    params.push(team_id);
    paramIndex++;

    // Filter out private leads (user can still see their own private leads)
    if (resourceType === 'lead') {
      conditions.push(`(${tablePrefix}is_private = FALSE OR ${tablePrefix}owner_id = $${paramIndex})`);
      params.push(userId);
      paramIndex++;
    }

    // Filter out appointments linked to private leads
    if (resourceType === 'appointment') {
      conditions.push(`(
        ${tablePrefix}lead_id IS NULL OR
        ${tablePrefix}lead_id NOT IN (
          SELECT id FROM leads
          WHERE is_private = TRUE AND owner_id != $${paramIndex}
        )
      )`);
      params.push(userId);
      paramIndex++;
    }

  } else if (scope === 'brokerage') {
    // Only brokers (and system_admin) can use brokerage scope
    if (role !== 'broker' && role !== 'system_admin') {
      throw new Error('Only brokers can access brokerage scope');
    }

    if (!broker_id) {
      throw new Error('User is not associated with a broker');
    }

    // All resources in brokerage (owned by users in this brokerage)
    conditions.push(`${tablePrefix}owner_id IN (
      SELECT id FROM users WHERE broker_id = $${paramIndex}
    )`);
    params.push(broker_id);
    paramIndex++;

    // Filter out private leads
    if (resourceType === 'lead') {
      conditions.push(`${tablePrefix}is_private = FALSE`);
    }

    // Filter out appointments linked to private leads
    if (resourceType === 'appointment') {
      conditions.push(`(
        ${tablePrefix}lead_id IS NULL OR
        ${tablePrefix}lead_id NOT IN (SELECT id FROM leads WHERE is_private = TRUE)
      )`);
    }

  } else if (scope === 'all') {
    // Only system_admin can use 'all' scope (already handled above)
    throw new Error('Only system_admin can access all scope');
  }

  return {
    whereClause: conditions.join(' AND '),
    params,
    nextParamIndex: paramIndex
  };
}

/**
 * Get the correct owner column name for a resource type
 * Most tables use 'owner_id', but clients uses 'user_id'
 */
function getOwnerColumnName(resourceType) {
  // All tables use owner_id consistently
  return 'owner_id';
}

/**
 * Build ownership filter for JOIN queries (when table alias is needed)
 * @param {Object} user - req.user object
 * @param {string} scope - Scope filter
 * @param {string} resourceType - Resource type
 * @param {string} tableAlias - Table alias (e.g., 'e' for escrows)
 * @param {number} startParamIndex - Starting parameter index
 * @returns {Object} - { whereClause, params, nextParamIndex }
 */
function buildOwnershipWhereClauseWithAlias(user, scope, resourceType, tableAlias, startParamIndex = 1) {
  const { id: userId, role, broker_id, team_id } = user;
  const params = [];
  const conditions = [];
  let paramIndex = startParamIndex;

  const prefix = tableAlias ? `${tableAlias}.` : '';
  const ownerColumn = getOwnerColumnName(resourceType);

  // system_admin sees everything
  if (role === 'system_admin') {
    if (scope === 'user') {
      conditions.push(`${prefix}${ownerColumn} = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    }
    return { whereClause: conditions.join(' AND ') || '1=1', params, nextParamIndex: paramIndex };
  }

  // Handle scope-based filtering
  if (scope === 'user') {
    conditions.push(`${prefix}${ownerColumn} = $${paramIndex}`);
    params.push(userId);
    paramIndex++;

  } else if (scope === 'team') {
    conditions.push(`${prefix}team_id = $${paramIndex}`);
    params.push(team_id);
    paramIndex++;

    if (resourceType === 'lead') {
      conditions.push(`(${prefix}is_private = FALSE OR ${prefix}${ownerColumn} = $${paramIndex})`);
      params.push(userId);
      paramIndex++;
    }

    if (resourceType === 'appointment') {
      const leadOwnerColumn = getOwnerColumnName('lead');
      conditions.push(`(
        ${prefix}lead_id IS NULL OR
        ${prefix}lead_id NOT IN (
          SELECT id FROM leads
          WHERE is_private = TRUE AND ${leadOwnerColumn} != $${paramIndex}
        )
      )`);
      params.push(userId);
      paramIndex++;
    }

  } else if (scope === 'brokerage') {
    if (role !== 'broker' && role !== 'system_admin') {
      throw new Error('Only brokers can access brokerage scope');
    }

    if (!broker_id) {
      throw new Error('User is not associated with a broker');
    }

    conditions.push(`${prefix}owner_id IN (
      SELECT id FROM users WHERE broker_id = $${paramIndex}
    )`);
    params.push(broker_id);
    paramIndex++;

    if (resourceType === 'lead') {
      conditions.push(`${prefix}is_private = FALSE`);
    }

    if (resourceType === 'appointment') {
      conditions.push(`(
        ${prefix}lead_id IS NULL OR
        ${prefix}lead_id NOT IN (SELECT id FROM leads WHERE is_private = TRUE)
      )`);
    }

  } else if (scope === 'all') {
    throw new Error('Only system_admin can access all scope');
  }

  return {
    whereClause: conditions.join(' AND '),
    params,
    nextParamIndex: paramIndex
  };
}

/**
 * Validate scope parameter
 * @param {string} scope - Requested scope
 * @param {string} userRole - User's role
 * @returns {string} - Validated scope (or throws error)
 */
function validateScope(scope, userRole) {
  const validScopes = ['user', 'team', 'brokerage', 'all'];

  if (!validScopes.includes(scope)) {
    throw new Error(`Invalid scope. Must be one of: ${validScopes.join(', ')}`);
  }

  // system_admin can use any scope
  if (userRole === 'system_admin') {
    return scope;
  }

  // broker can use user, team, brokerage
  if (userRole === 'broker') {
    if (scope === 'all') {
      throw new Error('Only system_admin can access "all" scope');
    }
    return scope;
  }

  // team_owner and agent can use user, team
  if (userRole === 'team_owner' || userRole === 'agent') {
    if (scope === 'brokerage' || scope === 'all') {
      throw new Error(`Only brokers and system_admin can access "${scope}" scope`);
    }
    return scope;
  }

  throw new Error('Invalid user role');
}

/**
 * Get default scope for user role
 * @param {string} userRole - User's role
 * @returns {string} - Default scope
 */
function getDefaultScope(userRole) {
  if (userRole === 'system_admin') {
    return 'all';
  }
  if (userRole === 'broker') {
    return 'brokerage';
  }
  return 'team'; // team_owner, agent
}

/**
 * Build access_level filter conditions (Phase 6 addition)
 * This adds additional filtering based on access_level column
 * @param {string} prefix - Table prefix (e.g., 'e.')
 * @param {Object} user - req.user object
 * @param {string} resourceType - Resource type
 * @param {number} paramIndex - Current parameter index
 * @returns {Object} - { conditions: array, params: array, nextParamIndex: number }
 */
function buildAccessLevelFilter(prefix, user, resourceType, paramIndex) {
  const conditions = [];
  const params = [];
  let currentIndex = paramIndex;

  // Owner always has access
  conditions.push(`${prefix}owner_id = $${currentIndex}`);
  params.push(user.id);
  currentIndex++;

  // If record is not private, check access_level
  const accessConditions = [];

  // Team-level access (user must be in same team)
  if (user.team_id) {
    accessConditions.push(`(
      ${prefix}is_private = FALSE
      AND ${prefix}access_level = 'team'
      AND EXISTS (
        SELECT 1 FROM users u2
        WHERE u2.id = ${prefix}owner_id
        AND u2.team_id = $${currentIndex}
      )
    )`);
    params.push(user.team_id);
    currentIndex++;
  }

  // Broker-level access (user must be under same broker)
  if (user.broker_id || user.brokerId) {
    const brokerId = user.broker_id || user.brokerId;
    accessConditions.push(`(
      ${prefix}is_private = FALSE
      AND ${prefix}access_level = 'broker'
      AND EXISTS (
        SELECT 1 FROM users u3
        WHERE u3.id = ${prefix}owner_id
        AND u3.broker_id = $${currentIndex}
      )
    )`);
    params.push(brokerId);
    currentIndex++;
  }

  // Combine: owner OR (not private AND access granted)
  if (accessConditions.length > 0) {
    const combinedCondition = `(${conditions[0]} OR ${accessConditions.join(' OR ')})`;
    return {
      conditions: [combinedCondition],
      params,
      nextParamIndex: currentIndex
    };
  }

  // If no team/broker access, only owner can access
  return {
    conditions,
    params,
    nextParamIndex: currentIndex
  };
}

module.exports = {
  buildOwnershipWhereClause,
  buildOwnershipWhereClauseWithAlias,
  validateScope,
  getDefaultScope,
  buildAccessLevelFilter
};
