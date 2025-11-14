// backend/src/modules/escrows/routes/details/index.js
// Detail view routes for escrow sections

const express = require('express');
const { body, param } = require('express-validator');

const router = express.Router();
const escrowsController = require('../../controllers');
const { validate } = require('../../../../middleware/validation.middleware');

// GET /v1/escrows/:id/details
router.get(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowDetails,
);

// PUT /v1/escrows/:id/details
router.put(
  '/:id/details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowDetails,
);

// GET /v1/escrows/:id/property-details
router.get(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowPropertyDetails,
);

// PUT /v1/escrows/:id/property-details
router.put(
  '/:id/property-details',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowPropertyDetails,
);

// GET /v1/escrows/:id/documents
router.get(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowDocuments,
);

// PUT /v1/escrows/:id/documents
router.put(
  '/:id/documents',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body().isArray().withMessage('Documents must be an array'),
  ],
  validate,
  escrowsController.updateEscrowDocuments,
);

// GET /v1/escrows/:id/notes
router.get(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowNotes,
);

// POST /v1/escrows/:id/notes
router.post(
  '/:id/notes',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('note').notEmpty().withMessage('Note content is required'),
    body('type').optional().isString().withMessage('Note type must be a string'),
  ],
  validate,
  escrowsController.addEscrowNote,
);

module.exports = router;
