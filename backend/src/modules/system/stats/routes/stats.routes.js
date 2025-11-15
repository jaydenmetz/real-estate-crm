/**
 * Stats Routes
 * Hierarchical statistics endpoints for multi-tenant dashboards
 *
 * PHASE 3: Multi-Tenant Admin System
 * Single endpoint that returns all stats based on user role
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');
const { authenticate } = require('../../../../middleware/auth/auth.middleware');

/**
 * GET /v1/stats/home
 * Get all dashboard statistics based on user role
 *
 * Access: All authenticated users
 * Query Params:
 *   - teamId: UUID (optional, for broker to select specific team)
 *
 * Returns:
 *   - Broker/System Admin: broker + team (if teamId) + user stats
 *   - Team Owner: team + user stats
 *   - Agent: user stats only
 */
router.get('/home', authenticate, statsController.getHomeStats);

module.exports = router;
