/**
 * Status System Routes
 *
 * API endpoints for database-driven status configuration
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../../middleware/auth/auth.middleware');
const statusesService = require('../services/statuses.service');

/**
 * GET /api/v1/statuses/:entityType
 * Get all statuses for an entity type
 */
router.get('/:entityType', authenticate, async (req, res) => {
  try {
    const { entityType } = req.params;
    const teamId = req.user.team_id;

    const statuses = await statusesService.getStatuses(teamId, entityType);

    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error('Error fetching statuses:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch statuses',
      },
    });
  }
});

/**
 * GET /api/v1/statuses/:entityType/categories
 * Get status categories (tabs) with their statuses
 */
router.get('/:entityType/categories', authenticate, async (req, res) => {
  try {
    const { entityType } = req.params;
    const teamId = req.user.team_id;

    const categories = await statusesService.getStatusCategories(teamId, entityType);

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching status categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch status categories',
      },
    });
  }
});

/**
 * GET /api/v1/statuses/:entityType/:entityId/history
 * Get status change history for an entity
 */
router.get('/:entityType/:entityId/history', authenticate, async (req, res) => {
  try {
    const { entityType, entityId } = req.params;

    const history = await statusesService.getStatusHistory(entityType, entityId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Error fetching status history:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch status history',
      },
    });
  }
});

/**
 * POST /api/v1/statuses/:entityType
 * Create custom status for team
 */
router.post('/:entityType', authenticate, async (req, res) => {
  try {
    const { entityType } = req.params;
    const teamId = req.user.team_id;
    const { statusKey, label, color, icon, isDefault, isFinal, sortOrder } = req.body;

    // Validate required fields
    if (!statusKey || !label) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'statusKey and label are required',
        },
      });
    }

    const status = await statusesService.createCustomStatus({
      teamId,
      entityType,
      statusKey,
      label,
      color,
      icon,
      isDefault,
      isFinal,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      data: status,
      message: 'Custom status created successfully',
    });
  } catch (error) {
    console.error('Error creating custom status:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_STATUS',
          message: 'A status with this key already exists',
        },
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create custom status',
      },
    });
  }
});

/**
 * POST /api/v1/statuses/validate-transition
 * Validate if a status transition is allowed
 */
router.post('/validate-transition', authenticate, async (req, res) => {
  try {
    const { fromStatusId, toStatusId } = req.body;
    const userRole = req.user.role;

    const validation = await statusesService.validateTransition(
      fromStatusId,
      toStatusId,
      userRole,
    );

    res.json({
      success: true,
      data: validation,
    });
  } catch (error) {
    console.error('Error validating transition:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Failed to validate status transition',
      },
    });
  }
});

module.exports = router;
