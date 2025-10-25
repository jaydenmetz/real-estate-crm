const express = require('express');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticateToken } = require('../../../middleware/auth');
const { validate } = require('../../../middleware/validation.middleware');
const {
  createEscrowRules,
  updateEscrowRules,
  escrowIdRules,
  batchDeleteRules,
} = require('../validators/escrows.validators');

/**
 * Escrows Domain Routes
 * Consolidated routing for all escrow operations
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Statistics endpoint (must be before /:id to avoid route collision)
 * GET /v1/escrows/stats
 */
router.get('/stats', escrowsController.getStats);

/**
 * Batch operations (must be before /:id)
 * DELETE /v1/escrows/batch
 */
router.delete('/batch', batchDeleteRules(), validate, escrowsController.batchDeleteEscrows);

/**
 * Main CRUD operations
 */
router.get('/', escrowsController.getAllEscrows);
router.get('/:id', escrowIdRules(), validate, escrowsController.getEscrowById);
router.post('/', createEscrowRules(), validate, escrowsController.createEscrow);
router.put('/:id', [...escrowIdRules(), ...updateEscrowRules()], validate, escrowsController.updateEscrow);
router.delete('/:id', escrowIdRules(), validate, escrowsController.deleteEscrow);

/**
 * Archive operations
 */
router.patch('/:id/archive', escrowIdRules(), validate, escrowsController.archiveEscrow);
router.patch('/:id/restore', escrowIdRules(), validate, escrowsController.restoreEscrow);

module.exports = router;
