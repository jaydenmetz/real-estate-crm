const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Clients Domain Routes
 * Consolidated routing for all client operations
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Statistics endpoint (must be before /:id to avoid route collision)
 * GET /v1/clients/stats
 */
router.get('/stats', clientsController.getStats);

/**
 * Batch operations (must be before /:id)
 * DELETE /v1/clients/batch
 */
router.delete('/batch', clientsController.batchDeleteClients);

/**
 * Main CRUD operations
 */
router.get('/', clientsController.getAllClients);
router.get('/:id', clientsController.getClientById);
router.post('/', clientsController.createClient);
router.put('/:id', clientsController.updateClient);
router.delete('/:id', clientsController.deleteClient);

module.exports = router;
