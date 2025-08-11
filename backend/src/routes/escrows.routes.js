// backend/src/routes/escrows.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticate } = require('../middleware/apiKey.middleware');
const { requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require authentication and escrows permission
router.use(authenticate);
router.use(requirePermission('escrows'));

// GET /v1/escrows?status&page&limit&minPrice&maxPrice&closingDateStart&closingDateEnd
router.get(
  '/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be a positive number').toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be a positive number').toFloat(),
    query('closingDateStart').optional().isISO8601().withMessage('Invalid closingDateStart format'),
    query('closingDateEnd').optional().isISO8601().withMessage('Invalid closingDateEnd format'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer').toInt()
  ],
  validationMiddleware,
  escrowsController.getEscrows
);

// GET /v1/escrows/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrow
);

// POST /v1/escrows
router.post(
  '/',
  [
    body('propertyAddress').notEmpty().withMessage('Property address is required'),
    body('purchasePrice').isNumeric().withMessage('Purchase price must be a number'),
    body('buyers').isArray({ min: 1 }).withMessage('Buyers must be a non-empty array'),
    body('sellers').isArray({ min: 1 }).withMessage('Sellers must be a non-empty array'),
    body('acceptanceDate').isISO8601().withMessage('Invalid acceptance date'),
    body('closingDate').isISO8601().withMessage('Invalid closing date')
  ],
  validationMiddleware,
  escrowsController.createEscrow
);

// PUT /v1/escrows/:id
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('purchasePrice').optional().isNumeric().withMessage('Purchase price must be a number'),
    body('closingDate').optional().isISO8601().withMessage('Invalid closing date')
  ],
  validationMiddleware,
  escrowsController.updateEscrow
);

// DELETE /v1/escrows/:id
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.deleteEscrow
);

// PATCH /v1/escrows/:id/checklist
router.patch(
  '/:id/checklist',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('item').notEmpty().withMessage('Checklist item is required'),
    body('value').isBoolean().withMessage('Value must be boolean'),
    body('note').optional().isString().withMessage('Note must be a string')
  ],
  validationMiddleware,
  escrowsController.updateChecklist
);

// GET /v1/escrows/:id/timeline
router.get(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowTimeline
);

// GET /v1/escrows/:id/people
router.get(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowPeople
);

// GET /v1/escrows/:id/financials
router.get(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowFinancials
);

// GET /v1/escrows/:id/checklists
router.get(
  '/:id/checklists',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowChecklists
);

// GET /v1/escrows/:id/notes
router.get(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required')
  ],
  validationMiddleware,
  escrowsController.getEscrowNotes
);

// POST /v1/escrows/:id/notes
router.post(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('note').notEmpty().withMessage('Note content is required'),
    body('type').optional().isString().withMessage('Note type must be a string')
  ],
  validationMiddleware,
  escrowsController.addEscrowNote
);

// Health check endpoints
// GET /v1/escrows/health/auth - Test authentication
router.get('/health/auth', authenticate, async (req, res) => {
  res.json({
    success: true,
    data: {
      authenticated: true,
      user: req.user?.email,
      userId: req.user?.id,
      teamId: req.user?.teamId,
      role: req.user?.role,
      authMethod: req.user?.authMethod,
      permissions: req.user?.permissions
    },
    timestamp: new Date().toISOString()
  });
});

// GET /v1/escrows/health/db - Test database connection
router.get('/health/db', authenticate, async (req, res) => {
  try {
    const { pool } = require('../config/database');
    const result = await pool.query('SELECT NOW() as time, current_database() as database');
    
    res.json({
      success: true,
      data: {
        connected: true,
        database: result.rows[0].database,
        serverTime: result.rows[0].time,
        totalConnections: pool.totalCount,
        idleConnections: pool.idleCount,
        waitingConnections: pool.waitingCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(503).json({
      success: false,
      error: {
        code: 'DB_CONNECTION_ERROR',
        message: 'Database connection failed',
        details: error.message
      }
    });
  }
});

module.exports = router;