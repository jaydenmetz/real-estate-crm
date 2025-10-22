/**
 * Ownership Service
 * Handles multi-tenant data access control, ownership checks, and privacy filtering
 *
 * Privacy Model:
 * - Escrows/Clients/Listings: Always visible to broker (no privacy)
 * - Leads: Can be marked private (is_private flag)
 * - Appointments: Inherit privacy from linked lead
 *
 * Role Hierarchy:
 * - system_admin: Sees ALL data including private
 * - broker: Sees all non-private data in their brokerage
 * - team_owner: Sees all non-private data in their team
 * - agent: Sees own data + team non-private data
 */

const pool = require('../config/database');

class OwnershipService {
  /**
   * Check if user can access a specific resource
   * @param {string} userId - User's UUID
   * @param {string} userRole - User's role (system_admin, broker, team_owner, agent)
   * @param {string} brokerId - User's broker_id
   * @param {string} teamId - User's team_id
   * @param {string} resourceType - Type of resource (escrow, client, listing, lead, appointment)
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<boolean>} - Can user access this resource?
   */
  static async canAccessResource(userId, userRole, brokerId, teamId, resourceType, resourceId) {
    // system_admin sees everything
    if (userRole === 'system_admin') {
      return true;
    }

    const tableName = `${resourceType}s`; // escrow → escrows

    try {
      // Get resource ownership and privacy info
      const query = `
        SELECT
          owner_id,
          team_id,
          ${resourceType === 'lead' ? 'is_private,' : ''}
          ${resourceType === 'appointment' ? 'lead_id,' : ''}
          1 as exists
        FROM ${tableName}
        WHERE id = $1
      `;
      const result = await pool.query(query, [resourceId]);

      if (result.rows.length === 0) {
        return false; // Resource doesn't exist
      }

      const resource = result.rows[0];

      // User owns the resource (always has access)
      if (resource.owner_id === userId) {
        return true;
      }

      // Handle appointment privacy (inherited from lead)
      if (resourceType === 'appointment' && resource.lead_id) {
        const leadQuery = `SELECT is_private, owner_id FROM leads WHERE id = $1`;
        const leadResult = await pool.query(leadQuery, [resource.lead_id]);

        if (leadResult.rows.length > 0) {
          const lead = leadResult.rows[0];

          // If lead is private, only owner + system_admin can see appointment
          if (lead.is_private && lead.owner_id !== userId) {
            return false;
          }
        }
      }

      // Handle lead privacy
      if (resourceType === 'lead' && resource.is_private) {
        // Private lead only visible to owner + system_admin
        return false;
      }

      // Broker can see all non-private resources in their brokerage
      if (userRole === 'broker') {
        // Check if resource belongs to broker's brokerage
        const ownerQuery = `SELECT broker_id FROM users WHERE id = $1`;
        const ownerResult = await pool.query(ownerQuery, [resource.owner_id]);

        if (ownerResult.rows.length > 0 && ownerResult.rows[0].broker_id === brokerId) {
          return true;
        }
      }

      // Team owner can see team's non-private resources
      if (userRole === 'team_owner' && resource.team_id === teamId) {
        return true;
      }

      // Agent can see team's non-private resources
      if (userRole === 'agent' && resource.team_id === teamId) {
        return true;
      }

      // Check for explicit collaborator access
      const collaboratorQuery = `
        SELECT can_view FROM data_access_control
        WHERE resource_type = $1 AND resource_id = $2 AND user_id = $3
      `;
      const collaboratorResult = await pool.query(collaboratorQuery, [resourceType, resourceId, userId]);

      if (collaboratorResult.rows.length > 0 && collaboratorResult.rows[0].can_view) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('OwnershipService.canAccessResource error:', error);
      return false;
    }
  }

  /**
   * Check if user can modify a resource
   * @param {string} userId - User's UUID
   * @param {string} userRole - User's role
   * @param {string} brokerId - User's broker_id
   * @param {string} teamId - User's team_id
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<boolean>} - Can user edit this resource?
   */
  static async canModifyResource(userId, userRole, brokerId, teamId, resourceType, resourceId) {
    // system_admin can modify everything
    if (userRole === 'system_admin') {
      return true;
    }

    const tableName = `${resourceType}s`;

    try {
      const query = `SELECT owner_id, team_id FROM ${tableName} WHERE id = $1`;
      const result = await pool.query(query, [resourceId]);

      if (result.rows.length === 0) {
        return false;
      }

      const resource = result.rows[0];

      // Owner can always modify
      if (resource.owner_id === userId) {
        return true;
      }

      // Check for can_edit_team_data permission
      const permissionQuery = `
        SELECT can_edit_team_data FROM user_permissions
        WHERE user_id = $1 AND team_id = $2
      `;
      const permissionResult = await pool.query(permissionQuery, [userId, teamId]);

      if (permissionResult.rows.length > 0 && permissionResult.rows[0].can_edit_team_data) {
        // User has team edit permission, check if resource is in their team
        if (resource.team_id === teamId) {
          return true;
        }
      }

      // Check for per-resource collaborator edit access
      const collaboratorQuery = `
        SELECT can_edit FROM data_access_control
        WHERE resource_type = $1 AND resource_id = $2 AND user_id = $3
      `;
      const collaboratorResult = await pool.query(collaboratorQuery, [resourceType, resourceId, userId]);

      if (collaboratorResult.rows.length > 0 && collaboratorResult.rows[0].can_edit) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('OwnershipService.canModifyResource error:', error);
      return false;
    }
  }

  /**
   * Check if user can delete a resource
   * @param {string} userId - User's UUID
   * @param {string} userRole - User's role
   * @param {string} teamId - User's team_id
   * @param {string} resourceType - Type of resource
   * @param {string} resourceId - Resource UUID
   * @returns {Promise<boolean>} - Can user delete this resource?
   */
  static async canDeleteResource(userId, userRole, teamId, resourceType, resourceId) {
    // system_admin can delete everything
    if (userRole === 'system_admin') {
      return true;
    }

    const tableName = `${resourceType}s`;

    try {
      const query = `SELECT owner_id, team_id FROM ${tableName} WHERE id = $1`;
      const result = await pool.query(query, [resourceId]);

      if (result.rows.length === 0) {
        return false;
      }

      const resource = result.rows[0];

      // Owner can always delete their own resources
      if (resource.owner_id === userId) {
        return true;
      }

      // Check for can_delete permission
      const permissionQuery = `
        SELECT can_delete FROM user_permissions
        WHERE user_id = $1 AND team_id = $2
      `;
      const permissionResult = await pool.query(permissionQuery, [userId, teamId]);

      if (permissionResult.rows.length > 0 && permissionResult.rows[0].can_delete) {
        // User has delete permission, check if resource is in their team
        if (resource.team_id === teamId) {
          return true;
        }
      }

      // Check for per-resource collaborator delete access
      const collaboratorQuery = `
        SELECT can_delete FROM data_access_control
        WHERE resource_type = $1 AND resource_id = $2 AND user_id = $3
      `;
      const collaboratorResult = await pool.query(collaboratorQuery, [resourceType, resourceId, userId]);

      if (collaboratorResult.rows.length > 0 && collaboratorResult.rows[0].can_delete) {
        return true;
      }

      return false;
    } catch (error) {
      console.error('OwnershipService.canDeleteResource error:', error);
      return false;
    }
  }

  /**
   * Build WHERE clause for filtering resources by ownership and privacy
   * @param {string} userId - User's UUID
   * @param {string} userRole - User's role
   * @param {string} brokerId - User's broker_id
   * @param {string} teamId - User's team_id
   * @param {string} resourceType - Type of resource
   * @param {string} scope - Scope filter ('user', 'team', 'brokerage', 'all')
   * @returns {Object} - { whereClause: string, params: array }
   */
  static buildOwnershipFilter(userId, userRole, brokerId, teamId, resourceType, scope = 'user') {
    const params = [];
    const conditions = [];

    // system_admin sees everything (no filter)
    if (userRole === 'system_admin') {
      if (scope === 'user') {
        conditions.push(`owner_id = $${params.length + 1}`);
        params.push(userId);
      }
      // For 'all', 'brokerage', 'team' - no filter needed
      return { whereClause: conditions.join(' AND '), params };
    }

    // Handle scope-based filtering
    if (scope === 'user') {
      // User's own resources
      conditions.push(`owner_id = $${params.length + 1}`);
      params.push(userId);
    } else if (scope === 'team') {
      // Team resources (non-private)
      conditions.push(`team_id = $${params.length + 1}`);
      params.push(teamId);

      // Filter out private leads
      if (resourceType === 'lead') {
        conditions.push(`(is_private = FALSE OR owner_id = $${params.length + 1})`);
        params.push(userId);
      }

      // Filter out appointments linked to private leads
      if (resourceType === 'appointment') {
        conditions.push(`(
          lead_id IS NULL OR
          lead_id NOT IN (
            SELECT id FROM leads WHERE is_private = TRUE AND owner_id != $${params.length + 1}
          )
        )`);
        params.push(userId);
      }
    } else if (scope === 'brokerage') {
      // Broker can only use this scope
      if (userRole !== 'broker') {
        throw new Error('Only brokers can access brokerage scope');
      }

      // All resources in brokerage (non-private)
      conditions.push(`owner_id IN (
        SELECT id FROM users WHERE broker_id = $${params.length + 1}
      )`);
      params.push(brokerId);

      // Filter out private leads
      if (resourceType === 'lead') {
        conditions.push('is_private = FALSE');
      }

      // Filter out appointments linked to private leads
      if (resourceType === 'appointment') {
        conditions.push(`(
          lead_id IS NULL OR
          lead_id NOT IN (SELECT id FROM leads WHERE is_private = TRUE)
        )`);
      }
    } else if (scope === 'all') {
      // system_admin only (already handled above)
      if (userRole !== 'system_admin') {
        throw new Error('Only system_admin can access all scope');
      }
    }

    return {
      whereClause: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
      params
    };
  }

  /**
   * Get user's permissions for their team
   * @param {string} userId - User's UUID
   * @param {string} teamId - User's team_id
   * @returns {Promise<Object>} - { can_delete, can_edit_team_data, can_view_financials, is_broker_admin, is_team_admin }
   */
  static async getUserPermissions(userId, teamId) {
    try {
      const query = `
        SELECT
          can_delete,
          can_edit_team_data,
          can_view_financials,
          can_manage_team,
          is_broker_admin,
          is_team_admin
        FROM user_permissions
        WHERE user_id = $1 AND team_id = $2
      `;
      const result = await pool.query(query, [userId, teamId]);

      if (result.rows.length === 0) {
        // No permissions set = default (no special permissions)
        return {
          can_delete: false,
          can_edit_team_data: false,
          can_view_financials: false,
          can_manage_team: false,
          is_broker_admin: false,
          is_team_admin: false
        };
      }

      return result.rows[0];
    } catch (error) {
      console.error('OwnershipService.getUserPermissions error:', error);
      return null;
    }
  }

  /**
   * Grant permissions to a user
   * @param {string} userId - User to grant permissions to
   * @param {string} teamId - Team context
   * @param {Object} permissions - { can_delete, can_edit_team_data, can_view_financials, is_broker_admin, is_team_admin }
   * @param {string} grantedBy - User granting permissions
   * @returns {Promise<boolean>} - Success
   */
  static async grantPermissions(userId, teamId, permissions, grantedBy) {
    try {
      const query = `
        INSERT INTO user_permissions (
          user_id, team_id, can_delete, can_edit_team_data,
          can_view_financials, can_manage_team, is_broker_admin,
          is_team_admin, granted_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id, team_id)
        DO UPDATE SET
          can_delete = $3,
          can_edit_team_data = $4,
          can_view_financials = $5,
          can_manage_team = $6,
          is_broker_admin = $7,
          is_team_admin = $8,
          granted_by = $9,
          updated_at = NOW()
      `;

      await pool.query(query, [
        userId,
        teamId,
        permissions.can_delete || false,
        permissions.can_edit_team_data || false,
        permissions.can_view_financials || false,
        permissions.can_manage_team || false,
        permissions.is_broker_admin || false,
        permissions.is_team_admin || false,
        grantedBy
      ]);

      return true;
    } catch (error) {
      console.error('OwnershipService.grantPermissions error:', error);
      return false;
    }
  }
}

module.exports = OwnershipService;
