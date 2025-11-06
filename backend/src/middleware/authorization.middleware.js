/**
 * Authorization Middleware
 * Enforces multi-tenant access control based on user role, scope, and permissions
 *
 * Middleware functions:
 * - canAccessScope: Check if user can access requested scope (user/team/brokerage/all)
 * - requireOwnership: Check if user owns/can access specific resource
 * - requirePermission: Check if user has specific permission (can_delete, can_edit_team_data, etc.)
 */

const OwnershipService = require('../services/ownership.service');

/**
 * Middleware: Check if user can access requested scope
 * Usage: router.get('/escrows', canAccessScope, escrowsController.getAll)
 */
const canAccessScope = async (req, res, next) => {
  try {
    const { scope = 'user' } = req.query;
    const { role, broker_id, team_id } = req.user;

    // Validate scope parameter (accept 'my' as alias for 'user')
    const scopeMap = {
      'my': 'user',
      'user': 'user',
      'team': 'team',
      'brokerage': 'brokerage',
      'all': 'all'
    };

    const normalizedScope = scopeMap[scope];
    const validScopes = ['user', 'team', 'brokerage', 'all'];

    if (!normalizedScope) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SCOPE',
          message: `Invalid scope. Must be one of: my, user, team, brokerage, all`
        }
      });
    }

    // Use normalized scope for the rest of the logic
    const effectiveScope = normalizedScope;

    // Handle role as array (e.g., ['system_admin', 'agent'])
    const roles = Array.isArray(role) ? role : [role];
    const hasRole = (roleName) => roles.includes(roleName);

    // system_admin can access any scope
    if (hasRole('system_admin')) {
      return next();
    }

    // broker can access: user, team, brokerage
    if (hasRole('broker')) {
      if (effectiveScope === 'all') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'Only system_admin can access "all" scope'
          }
        });
      }

      if (effectiveScope === 'brokerage' && !broker_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'User is not associated with a broker'
          }
        });
      }

      return next();
    }

    // team_owner can access: user, team
    if (hasRole('team_owner')) {
      if (effectiveScope === 'brokerage' || scope === 'all') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `Only brokers and system_admin can access "${scope}" scope`
          }
        });
      }

      if (effectiveScope === 'team' && !team_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'User is not associated with a team'
          }
        });
      }

      return next();
    }

    // agent can access: user, team
    if (hasRole('agent')) {
      if (effectiveScope === 'brokerage' || scope === 'all') {
        // Check if agent has broker_admin permission
        const permissions = await OwnershipService.getUserPermissions(req.user.id, team_id);

        if (!permissions || !permissions.is_broker_admin) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'FORBIDDEN',
              message: `Only brokers and system_admin can access "${scope}" scope. Agents need broker_admin permission.`
            }
          });
        }

        // Agent with broker_admin can access brokerage scope
        if (effectiveScope === 'brokerage') {
          return next();
        }
      }

      if (effectiveScope === 'team' && !team_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'User is not associated with a team'
          }
        });
      }

      return next();
    }

    // Unknown role
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'Invalid user role'
      }
    });
  } catch (error) {
    console.error('canAccessScope middleware error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error checking scope access'
      }
    });
  }
};

/**
 * Middleware: Check if user owns or can access specific resource
 * Usage: router.get('/escrows/:id', requireOwnership('escrow'), escrowsController.getById)
 */
const requireOwnership = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const { id: userId, role, broker_id, team_id } = req.user;

      const canAccess = await OwnershipService.canAccessResource(
        userId,
        role,
        broker_id,
        team_id,
        resourceType,
        resourceId
      );

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `You do not have permission to access this ${resourceType}`
          }
        });
      }

      next();
    } catch (error) {
      console.error('requireOwnership middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error checking resource ownership'
        }
      });
    }
  };
};

/**
 * Middleware: Check if user can modify specific resource
 * Usage: router.put('/escrows/:id', requireModifyPermission('escrow'), escrowsController.update)
 */
const requireModifyPermission = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const { id: userId, role, broker_id, team_id } = req.user;

      const canModify = await OwnershipService.canModifyResource(
        userId,
        role,
        broker_id,
        team_id,
        resourceType,
        resourceId
      );

      if (!canModify) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `You do not have permission to modify this ${resourceType}`
          }
        });
      }

      next();
    } catch (error) {
      console.error('requireModifyPermission middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error checking modify permission'
        }
      });
    }
  };
};

/**
 * Middleware: Check if user can delete specific resource
 * Usage: router.delete('/escrows/:id', requireDeletePermission('escrow'), escrowsController.delete)
 */
const requireDeletePermission = (resourceType) => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params.id;
      const { id: userId, role, team_id } = req.user;

      const canDelete = await OwnershipService.canDeleteResource(
        userId,
        role,
        team_id,
        resourceType,
        resourceId
      );

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `You do not have permission to delete this ${resourceType}`
          }
        });
      }

      next();
    } catch (error) {
      console.error('requireDeletePermission middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error checking delete permission'
        }
      });
    }
  };
};

/**
 * Middleware: Check if user has specific permission
 * Usage: router.post('/team/settings', requirePermission('can_manage_team'), teamController.updateSettings)
 */
const requirePermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const { id: userId, role, team_id } = req.user;

      // system_admin has all permissions
      if (role === 'system_admin') {
        return next();
      }

      const permissions = await OwnershipService.getUserPermissions(userId, team_id);

      if (!permissions || !permissions[permissionName]) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `You do not have the required permission: ${permissionName}`
          }
        });
      }

      next();
    } catch (error) {
      console.error('requirePermission middleware error:', error);
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Error checking permission'
        }
      });
    }
  };
};

/**
 * Middleware: Require system_admin role
 * Usage: router.get('/admin/users', requireSystemAdmin, adminController.getUsers)
 */
const requireSystemAdmin = (req, res, next) => {
  if (req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This endpoint requires system_admin role'
      }
    });
  }
  next();
};

/**
 * Middleware: Require broker role (or system_admin)
 * Usage: router.get('/broker/kpis', requireBroker, brokerController.getKPIs)
 */
const requireBroker = (req, res, next) => {
  if (req.user.role !== 'broker' && req.user.role !== 'system_admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This endpoint requires broker role'
      }
    });
  }
  next();
};

/**
 * Middleware: Require team_owner role (or broker/system_admin)
 * Usage: router.post('/team/permissions', requireTeamOwner, teamController.grantPermissions)
 */
const requireTeamOwner = (req, res, next) => {
  const allowedRoles = ['team_owner', 'broker', 'system_admin'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'This endpoint requires team_owner, broker, or system_admin role'
      }
    });
  }
  next();
};

module.exports = {
  canAccessScope,
  requireOwnership,
  requireModifyPermission,
  requireDeletePermission,
  requirePermission,
  requireSystemAdmin,
  requireBroker,
  requireTeamOwner
};
