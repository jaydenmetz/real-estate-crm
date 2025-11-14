// backend/src/modules/escrows/routes/checklists/index.js
// Checklist operations for escrows

const express = require('express');
const { body, param } = require('express-validator');

const router = express.Router();
const escrowsController = require('../../controllers');
const { validate } = require('../../../../middleware/validation.middleware');

// PATCH /v1/escrows/:id/checklist
router.patch(
  '/:id/checklist',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
    body('item').notEmpty().withMessage('Checklist item is required'),
    body('value').isBoolean().withMessage('Value must be boolean'),
    body('note').optional().isString().withMessage('Note must be a string'),
  ],
  validate,
  escrowsController.updateChecklist,
);

// GET /v1/escrows/:id/checklists
router.get(
  '/:id/checklists',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklists,
);

// GET /v1/escrows/:id/checklist-loan
router.get(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklistLoan,
);

// PUT /v1/escrows/:id/checklist-loan
router.put(
  '/:id/checklist-loan',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowChecklistLoan,
);

// GET /v1/escrows/:id/checklist-house
router.get(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklistHouse,
);

// PUT /v1/escrows/:id/checklist-house
router.put(
  '/:id/checklist-house',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowChecklistHouse,
);

// GET /v1/escrows/:id/checklist-admin
router.get(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowChecklistAdmin,
);

// PUT /v1/escrows/:id/checklist-admin
router.put(
  '/:id/checklist-admin',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowChecklistAdmin,
);

module.exports = router;
