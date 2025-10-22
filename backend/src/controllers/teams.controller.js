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

module.exports = {
  getTeams,
  getTeamById,
};
