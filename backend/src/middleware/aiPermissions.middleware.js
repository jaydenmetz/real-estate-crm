const logger = require('../utils/logger');
const AIAgent = require('../models/AIAgent');

// Enhanced permissions for AI agents
function requireAIPermission(resource, action = 'read') {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required'
        }
      });
    }

    // Master and executive have all permissions
    if (['master', 'executive'].includes(req.user.role)) {
      return next();
    }

    // Check if agent is enabled
    if (req.user.role === 'agent') {
      try {
        const agents = await AIAgent.findAll();
        const currentAgent = agents.find(a => a.name === req.user.name);
        
        if (!currentAgent || !currentAgent.enabled) {
          return res.status(403).json({
            success: false,
            error: {
              code: 'AGENT_DISABLED',
              message: 'AI agent is currently disabled'
            }
          });
        }
      } catch (error) {
        logger.error('Error checking agent status:', error);
        return res.status(500).json({
          success: false,
          error: {
            code: 'PERMISSION_CHECK_ERROR',
            message: 'Failed to verify agent permissions'
          }
        });
      }
    }

    // Department-specific permissions for managers
    if (req.user.role === 'manager') {
      const departmentPermissions = {
        'buyer': ['leads', 'clients', 'appointments'],
        'listing': ['listings', 'clients'],
        'operations': ['escrows', 'appointments', 'analytics']
      };
      
      const allowedResources = departmentPermissions[req.user.department] || [];
      
      if (!allowedResources.includes(resource)) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'DEPARTMENT_RESTRICTED',
            message: `${req.user.department} manager cannot access ${resource}`
          }
        });
      }
    }

    // Action-based permissions for agents
    if (req.user.role === 'agent') {
      const writeActions = ['create', 'update', 'delete'];
      const isWriteAction = writeActions.includes(action) || ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
      
      // Read-only agents
      if (req.user.permissions.includes('read-only') && isWriteAction) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'READ_ONLY_ACCESS',
            message: 'Agent has read-only access'
          }
        });
      }
      
      // Resource-specific permissions
      if (!req.user.permissions.includes(resource) && !req.user.permissions.includes('read-all')) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'RESOURCE_RESTRICTED',
            message: `Agent does not have permission to access ${resource}`
          }
        });
      }
    }

    // Log AI activity
    if (req.user.role === 'agent') {
      setImmediate(async () => {
        try {
          const agents = await AIAgent.findAll();
          const agent = agents.find(a => a.name === req.user.name);
          
          if (agent) {
            await AIAgent.logActivity(agent.id, {
              type: `${action}_${resource}`,
              entityType: resource,
              entityId: req.params.id,
              description: `${action} ${resource} via API`,
              success: true
            });
          }
        } catch (error) {
          logger.error('Failed to log AI activity:', error);
        }
      });
    }

    next();
  };
}

module.exports = {
  requireAIPermission
};