/**
 * User Object Normalizer
 *
 * Handles inconsistencies in req.user object across different authentication flows:
 * - Array vs string roles: ['agent'] → 'agent'
 * - Field naming: teamId vs team_id, brokerId vs broker_id
 * - Missing properties: firstName vs first_name
 *
 * Usage:
 * const user = normalizeUser(req.user);
 * const { userId, role, teamId, brokerId } = user;
 */

/**
 * Normalize user object from req.user
 * @param {Object} reqUser - The req.user object from authentication middleware
 * @returns {Object} - Normalized user object with consistent field names
 */
function normalizeUser(reqUser) {
  if (!reqUser) {
    return {
      id: null,
      role: null,
      teamId: null,
      brokerId: null,
      firstName: null,
      lastName: null,
      email: null
    };
  }

  // Extract role - handle both array and string formats
  let role = reqUser.role;
  if (Array.isArray(role)) {
    // If role is array like ['agent'], extract first element
    role = role[0];
  }

  return {
    // User ID (always 'id')
    id: reqUser.id,

    // Role (normalize array to string)
    role: role,

    // Team ID (handle both naming conventions)
    teamId: reqUser.teamId || reqUser.team_id,

    // Broker ID (handle both naming conventions)
    brokerId: reqUser.brokerId || reqUser.broker_id,

    // Name fields (handle both naming conventions)
    firstName: reqUser.firstName || reqUser.first_name,
    lastName: reqUser.lastName || reqUser.last_name,

    // Email (always 'email')
    email: reqUser.email,

    // Additional fields that might be needed
    phone: reqUser.phone,
    avatar: reqUser.avatar,

    // Keep original object for any edge cases
    _original: reqUser
  };
}

/**
 * Get user context for ownership filtering
 * Returns all properties needed for buildOwnershipWhereClauseWithAlias
 * @param {Object} reqUser - The req.user object
 * @returns {Object} - User context object
 */
function getUserContext(reqUser) {
  const normalized = normalizeUser(reqUser);

  return {
    id: normalized.id,
    role: normalized.role,
    teamId: normalized.teamId,
    brokerId: normalized.brokerId,
    team_id: normalized.teamId,  // Include both for compatibility
    broker_id: normalized.brokerId
  };
}

/**
 * Validate that user has minimum required properties
 * @param {Object} reqUser - The req.user object
 * @throws {Error} - If user is missing required properties
 */
function validateUser(reqUser) {
  if (!reqUser) {
    throw new Error('User authentication required');
  }

  if (!reqUser.id) {
    throw new Error('User ID missing from authentication context');
  }

  if (!reqUser.role && !Array.isArray(reqUser.role)) {
    throw new Error('User role missing from authentication context');
  }

  return true;
}

module.exports = {
  normalizeUser,
  getUserContext,
  validateUser
};
