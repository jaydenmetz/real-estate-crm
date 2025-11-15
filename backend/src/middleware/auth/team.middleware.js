const { query } = require('../../config/infrastructure/database');
const logger = require('../../utils/logger');

/**
 * Team context middleware for multi-tenancy
 */
async function teamContext(req, res, next) {
  try {
    // Get team ID from various sources
    const teamId = req.params.teamId
                   || req.headers['x-team-id']
                   || req.user?.team_id
                   || 'team_jm_default'; // Default team for now

    // Validate team exists and user has access
    if (teamId) {
      const result = await query(
        'SELECT * FROM teams WHERE team_id = $1',
        [teamId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'TEAM_NOT_FOUND',
            message: 'Team not found',
          },
        });
      }

      // Set team context
      req.team = result.rows[0];
      req.teamId = teamId;

      // Set PostgreSQL session variable for RLS
      await query(`SET LOCAL app.current_team_id = '${teamId}'`);
    }

    next();
  } catch (error) {
    logger.error('Team context middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAM_CONTEXT_ERROR',
        message: 'Failed to establish team context',
      },
    });
  }
}

/**
 * Require team membership
 */
function requireTeamMembership(role = null) {
  return async (req, res, next) => {
    try {
      const { teamId } = req;
      const userId = req.user?.id;

      if (!teamId || !userId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'ACCESS_DENIED',
            message: 'Team membership required',
          },
        });
      }

      // Check team membership
      const result = await query(
        `
        SELECT tm.*, tr.permissions
        FROM team_members tm
        JOIN team_roles tr ON tr.id = tm.role_id
        WHERE tm.team_id = $1 AND tm.user_id = $2 AND tm.is_active = true
        `,
        [teamId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'NOT_TEAM_MEMBER',
            message: 'You are not a member of this team',
          },
        });
      }

      req.teamMember = result.rows[0];

      // Check specific role if required
      if (role && req.teamMember.role !== role) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'INSUFFICIENT_ROLE',
            message: `Role '${role}' required`,
          },
        });
      }

      next();
    } catch (error) {
      logger.error('Team membership check error:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'MEMBERSHIP_CHECK_ERROR',
          message: 'Failed to verify team membership',
        },
      });
    }
  };
}

module.exports = {
  teamContext,
  requireTeamMembership,
};
