

// backend/src/routes/leads.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require authentication and 'leads' permission
router.use(authenticate);
router.use(requirePermission('leads'));

// GET /v1/leads?status&page&limit
router.get(
  '/',
  [
    query('status').optional().isString().withMessage('Status must be a string'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer').toInt(),
    query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be an integer').toInt()
  ],
  validationMiddleware,
  leadsController.getLeads
);

// GET /v1/leads/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Lead ID is required')
  ],
  validationMiddleware,
  leadsController.getLead
);

// POST /v1/leads
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isString().withMessage('Invalid phone'),
    body('status').optional().isString().withMessage('Status must be a string')
  ],
  validationMiddleware,
  leadsController.createLead
);

// PUT /v1/leads/:id
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Lead ID is required'),
    body('firstName').optional().notEmpty().withMessage('First name must not be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name must not be empty'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isString().withMessage('Invalid phone'),
    body('status').optional().isString().withMessage('Status must be a string')
  ],
  validationMiddleware,
  leadsController.updateLead
);

// POST /v1/leads/:id/convert
router.post(
  '/:id/convert',
  [
    param('id').notEmpty().withMessage('Lead ID is required')
  ],
  validationMiddleware,
  leadsController.convertLead
);

// POST /v1/leads/:id/activities
router.post(
  '/:id/activities',
  [
    param('id').notEmpty().withMessage('Lead ID is required'),
    body('activity').notEmpty().withMessage('Activity content is required')
  ],
  validationMiddleware,
  leadsController.logActivity
);

module.exports = router;