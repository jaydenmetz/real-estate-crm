// backend/src/routes/clients.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All client routes require authentication and the 'clients' permission
router.use(authenticate);
router.use(requirePermission('clients'));

// GET /v1/clients?page&limit
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt()
  ],
  validationMiddleware,
  clientsController.getClients
);

// GET /v1/clients/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Client ID is required'),
  ],
  validationMiddleware,
  clientsController.getClient
);

// POST /v1/clients
router.post(
  '/',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isString().withMessage('Invalid phone'),
  ],
  validationMiddleware,
  clientsController.createClient
);

// PUT /v1/clients/:id
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Client ID is required'),
    body('firstName').optional().notEmpty().withMessage('First name must not be empty'),
    body('lastName').optional().notEmpty().withMessage('Last name must not be empty'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('phone').optional().isString().withMessage('Invalid phone'),
  ],
  validationMiddleware,
  clientsController.updateClient
);

// DELETE /v1/clients/:id
router.delete(
  '/:id',
  [
    param('id').notEmpty().withMessage('Client ID is required'),
  ],
  validationMiddleware,
  clientsController.deleteClient
);

// POST /v1/clients/:id/notes
router.post(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Client ID is required'),
    body('note').notEmpty().withMessage('Note content is required'),
  ],
  validationMiddleware,
  clientsController.addNote
);

// PATCH /v1/clients/:id/tags
router.patch(
  '/:id/tags',
  [
    param('id').notEmpty().withMessage('Client ID is required'),
    body('operation').isIn(['add','remove']).withMessage('Operation must be add or remove'),
    body('tags').isArray({ min: 1 }).withMessage('Tags must be an array of strings'),
  ],
  validationMiddleware,
  clientsController.updateTags
);

module.exports = router;