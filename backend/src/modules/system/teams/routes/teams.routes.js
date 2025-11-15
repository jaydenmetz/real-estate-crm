/**
 * Teams Routes
 * Team management endpoints for multi-tenant system
 *
 * PHASE 3: Multi-Tenant Admin System
 */

const express = require('express');
const router = express.Router();
const teamsController = require('../controllers/teams.controller');
const { authenticate } = require('../../../../middleware/auth.middleware');

/**
 * GET /v1/teams
 * List all teams (with optional broker filtering)
 *
 * Access: All authenticated users
 * Query Params:
 *   - brokerId: UUID (optional, for system_admin to filter by broker)
 *
 * Authorization:
 *   - system_admin: Can see all teams
 *   - broker: Can see teams under their brokerage
 *   - team_owner/agent: Can see only their own team
 */
router.get('/', authenticate, teamsController.getTeams);

/**
 * GET /v1/teams/:id
 * Get single team by ID
 *
 * Access: All authenticated users (with authorization check)
 */
router.get('/:id', authenticate, teamsController.getTeamById);

/**
 * GET /v1/teams/:id/members
 * Get all members of a team with their permissions
 *
 * Access: team_owner, broker, system_admin
 */
router.get('/:id/members', authenticate, teamsController.getTeamMembers);

/**
 * GET /v1/teams/:id/users
 * Alias for /teams/:id/members (used by AdminEntitySelector)
 *
 * Access: team_owner, broker, system_admin
 */
router.get('/:id/users', authenticate, teamsController.getTeamMembers);

/**
 * PUT /v1/teams/:teamId/members/:userId/permissions
 * Update permissions for a team member
 *
 * Access: team_owner, broker, system_admin
 */
router.put('/:teamId/members/:userId/permissions', authenticate, teamsController.updateMemberPermissions);

module.exports = router;
