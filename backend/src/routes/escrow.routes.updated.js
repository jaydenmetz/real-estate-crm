const express = require('express');
const router = express.Router();
const EscrowController = require('../controllers/escrowController.updated');
const { body } = require('express-validator');

// Validation middleware for creating escrow
const validateCreateEscrow = [
  body('property_address').notEmpty().withMessage('Property address is required'),
  body('purchase_price').isNumeric().withMessage('Purchase price must be a number'),
  body('closing_date').isISO8601().withMessage('Closing date must be a valid date'),
  body('participants').optional().isArray().withMessage('Participants must be an array'),
  body('participants.*.contact_id').optional().isUUID().withMessage('Contact ID must be a valid UUID'),
  body('participants.*.role').optional().isIn(['buyer', 'seller', 'listing_agent', 'buyer_agent', 'escrow_officer', 'lender', 'inspector', 'other'])
    .withMessage('Invalid participant role')
];

// Get all escrows (list view)
router.get('/escrows', EscrowController.getAllEscrows);

// Get single escrow with all details
router.get('/escrows/:id', EscrowController.getEscrowById);

// Create new escrow
router.post('/escrows', validateCreateEscrow, EscrowController.createEscrow);

module.exports = router;