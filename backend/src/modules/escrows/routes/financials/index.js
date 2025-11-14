// backend/src/modules/escrows/routes/financials/index.js
// Financial data routes for escrows

const express = require('express');
const { param } = require('express-validator');

const router = express.Router();
const escrowsController = require('../../controllers');
const { validate } = require('../../../../middleware/validation.middleware');

// GET /v1/escrows/:id/financials
router.get(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowFinancials,
);

// PUT /v1/escrows/:id/financials
router.put(
  '/:id/financials',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowFinancials,
);

module.exports = router;
