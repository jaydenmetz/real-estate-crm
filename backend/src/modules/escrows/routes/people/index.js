// backend/src/modules/escrows/routes/people/index.js
// People management routes for escrows

const express = require('express');
const { param } = require('express-validator');

const router = express.Router();
const escrowsController = require('../../controllers');
const { validate } = require('../../../../middleware/validation.middleware');

// GET /v1/escrows/:id/people
router.get(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.getEscrowPeople,
);

// PUT /v1/escrows/:id/people
router.put(
  '/:id/people',
  [
    param('id').notEmpty().withMessage('Escrow ID is required'),
  ],
  validate,
  escrowsController.updateEscrowPeople,
);

module.exports = router;
