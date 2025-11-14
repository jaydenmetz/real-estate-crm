// backend/src/modules/escrows/routes/timeline/index.js
// Timeline event routes for escrows

const express = require('express');
const { param } = require('express-validator');

const router = express.Router();
const escrowsController = require('../../controllers');
const { validate } = require('../../../../middleware/validation.middleware');

// GET /v1/escrows/:id/timeline
router.get(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowTimeline,
);

// PUT /v1/escrows/:id/timeline
router.put(
  '/:id/timeline',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowTimeline || escrowsController.updateEscrow,
);

module.exports = router;
