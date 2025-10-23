/**
 * Teams Controller
 * Manages team operations for multi-tenant system
 *
 * PHASE 3: Multi-Tenant Admin System - Team Management
 */

const { pool } = require('../config/database');

/**
 * GET /v1/teams
 * List all teams (with optional broker filtering)
 *
 * Access: All authenticated users
 * Query Params:
 *   - brokerId: UUID (optional, filter teams by broker)
 *
 * Authorization:
 *   - system_admin: Can see all teams
 *   - broker: Can see teams under their brokerage (auto-filtered by broker_id)
 *   - team_owner/agent: Can see only their own team
 */
const getTeams = async (req, res) => {
  try {
    const { id: userId, role, broker_id, team_id } = req.user;
    const { brokerId: requestedBrokerId } = req.query;

    let query = 'SELECT team_id, name, subdomain, created_at FROM teams';
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Authorization logic
    if (role === 'system_admin') {
      // system_admin can see all teams (no filter)
      // If brokerId provided, filter by that broker
      if (requestedBrokerId) {
        whereConditions.push(`primary_broker_id = $${paramIndex}`);
        params.push(requestedBrokerId);
        paramIndex++;
      }
    } else if (role === 'broker') {
      // Brokers can only see teams under their brokerage
      // Ignore requestedBrokerId and use their broker_id
      if (!broker_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_BROKER_ID',
            message: 'Broker ID is required',
          },
        });
      }
      whereConditions.push(`primary_broker_id = $${paramIndex}`);
      params.push(broker_id);
      paramIndex++;
    } else if (role === 'team_owner' || role === 'agent') {
      // team_owner/agent can only see their own team
      if (!team_id) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MISSING_TEAM_ID',
            message: 'Team ID is required',
          },
        });
      }
      whereConditions.push(`team_id = $${paramIndex}`);
      params.push(team_id);
      paramIndex++;
    }

    // Build final query
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' ORDER BY name ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAMS_ERROR',
        message: 'Failed to fetch teams',
      },
    });
  }
};

/**
 * GET /v1/teams/:id
 * Get single team by ID
 *
 * Access: All authenticated users
 * Authorization: User must have access to the team
 */
const getTeamById = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { role, broker_id, team_id: userTeamId } = req.user;

    const query = `
      SELECT
        team_id,
        name,
        subdomain,
        settings,
        created_at,
        updated_at,
        primary_broker_id,
        (SELECT COUNT(*) FROM users WHERE team_id = teams.team_id AND is_active = TRUE) as member_count
      FROM teams
      WHERE team_id = $1
    `;

    const result = await pool.query(query, [teamId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'TEAM_NOT_FOUND',
          message: 'Team not found',
        },
      });
    }

    const team = result.rows[0];

    // Authorization: Check if user can access this team
    if (role === 'system_admin') {
      // system_admin can access any team
    } else if (role === 'broker') {
      // Broker can only access teams under their brokerage
      if (team.primary_broker_id !== broker_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this team',
          },
        });
      }
    } else if (role === 'team_owner' || role === 'agent') {
      // team_owner/agent can only access their own team
      if (team.team_id !== userTeamId) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have access to this team',
          },
        });
      }
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAM_ERROR',
        message: 'Failed to fetch team',
      },
    });
  }
};

/**
 * GET /v1/teams/:id/members
 * Get all members of a team with their permissions
 *
 * Access: team_owner, broker, system_admin
 */
const getTeamMembers = async (req, res) => {
  try {
    const { id: teamId } = req.params;
    const { role, broker_id, team_id: userTeamId } = req.user;

    // Authorization check
    if (role === 'agent') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only team owners and brokers can view team members',
        },
      });
    }

    // Verify access to this team
    if (role === 'team_owner' && teamId !== userTeamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only view members of your own team',
        },
      });
    }

    if (role === 'broker') {
      // Verify team belongs to broker's brokerage
      const teamCheck = await pool.query(
        'SELECT primary_broker_id FROM teams WHERE team_id = $1',
        [teamId]
      );
      if (teamCheck.rows.length === 0 || teamCheck.rows[0].primary_broker_id !== broker_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only view teams in your brokerage',
          },
        });
      }
    }

    // Fetch team members with their permissions
    const query = `
      SELECT
        u.id,
        u.email,
        u.username,
        u.first_name,
        u.last_name,
        u.role,
        u.is_active,
        u.created_at,
        json_build_object(
          'can_delete', COALESCE(up.can_delete, false),
          'can_edit_team_data', COALESCE(up.can_edit_team_data, false),
          'can_view_financials', COALESCE(up.can_view_financials, true),
          'can_manage_team', COALESCE(up.can_manage_team, false),
          'is_team_admin', COALESCE(up.is_team_admin, false),
          'is_broker_admin', COALESCE(up.is_broker_admin, false)
        ) as permissions
      FROM users u
      LEFT JOIN user_permissions up ON u.id = up.user_id AND up.team_id = $1
      WHERE u.team_id = $1 AND u.is_active = TRUE
      ORDER BY u.role DESC, u.last_name ASC, u.first_name ASC
    `;

    const result = await pool.query(query, [teamId]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TEAM_MEMBERS_ERROR',
        message: 'Failed to fetch team members',
      },
    });
  }
};

/**
 * PUT /v1/teams/:teamId/members/:userId/permissions
 * Update permissions for a team member
 *
 * Access: team_owner, broker, system_admin
 */
const updateMemberPermissions = async (req, res) => {
  try {
    const { teamId, userId } = req.params;
    const { permissions } = req.body;
    const { id: requesterId, role, broker_id, team_id: userTeamId } = req.user;

    // Authorization check
    if (role === 'agent') {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Only team owners and brokers can modify permissions',
        },
      });
    }

    // Prevent self-modification
    if (userId === requesterId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'You cannot modify your own permissions',
        },
      });
    }

    // Verify access to this team
    if (role === 'team_owner' && teamId !== userTeamId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You can only modify permissions in your own team',
        },
      });
    }

    if (role === 'broker') {
      // Verify team belongs to broker's brokerage
      const teamCheck = await pool.query(
        'SELECT primary_broker_id FROM teams WHERE team_id = $1',
        [teamId]
      );
      if (teamCheck.rows.length === 0 || teamCheck.rows[0].primary_broker_id !== broker_id) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You can only modify teams in your brokerage',
          },
        });
      }
    }

    // Verify target user is in the team
    const userCheck = await pool.query(
      'SELECT role FROM users WHERE id = $1 AND team_id = $2',
      [userId, teamId]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found in this team',
        },
      });
    }

    // Prevent modifying broker or system_admin permissions
    const targetUserRole = userCheck.rows[0].role;
    if (targetUserRole === 'broker' || targetUserRole === 'system_admin') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Cannot modify permissions for brokers or system admins',
        },
      });
    }

    // Upsert permissions
    const query = `
      INSERT INTO user_permissions (
        user_id,
        team_id,
        can_delete,
        can_edit_team_data,
        can_view_financials,
        can_manage_team,
        is_team_admin,
        is_broker_admin,
        granted_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (user_id, team_id)
      DO UPDATE SET
        can_delete = EXCLUDED.can_delete,
        can_edit_team_data = EXCLUDED.can_edit_team_data,
        can_view_financials = EXCLUDED.can_view_financials,
        can_manage_team = EXCLUDED.can_manage_team,
        is_team_admin = EXCLUDED.is_team_admin,
        is_broker_admin = EXCLUDED.is_broker_admin,
        granted_by = EXCLUDED.granted_by,
        updated_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [
      userId,
      teamId,
      permissions.can_delete || false,
      permissions.can_edit_team_data || false,
      permissions.can_view_financials !== undefined ? permissions.can_view_financials : true,
      permissions.can_manage_team || false,
      permissions.is_team_admin || false,
      permissions.is_broker_admin || false,
      requesterId,
    ]);

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Permissions updated successfully',
    });
  } catch (error) {
    console.error('Error updating permissions:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'PERMISSIONS_UPDATE_ERROR',
        message: 'Failed to update permissions',
      },
    });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  getTeamMembers,
  updateMemberPermissions,
};
