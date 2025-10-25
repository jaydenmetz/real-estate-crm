const express = require('express');
const router = express.Router();
const escrowsController = require('../controllers/escrows.controller');
const { authenticateToken } = require('../../../middleware/auth');

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
router.delete('/batch', escrowsController.batchDeleteEscrows);

/**
 * Main CRUD operations
 */
router.get('/', escrowsController.getAllEscrows);
router.get('/:id', escrowsController.getEscrowById);
router.post('/', escrowsController.createEscrow);
router.put('/:id', escrowsController.updateEscrow);
router.delete('/:id', escrowsController.deleteEscrow);

/**
 * Archive operations
 */
router.patch('/:id/archive', escrowsController.archiveEscrow);
router.patch('/:id/restore', escrowsController.restoreEscrow);

module.exports = router;
