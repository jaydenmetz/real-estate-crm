const express = require('express');
const router = express.Router();
const clientsController = require('../controllers/clients.controller');
const { authenticateToken } = require('../../../middleware/auth');
const { validate } = require('../../../middleware/validation.middleware');
const {
  createClientRules,
  updateClientRules,
  clientIdRules,
  batchDeleteRules,
} = require('../validators/clients.validators');

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
router.delete('/batch', batchDeleteRules(), validate, clientsController.batchDeleteClients);

/**
 * Main CRUD operations
 */
router.get('/', clientsController.getAllClients);
router.get('/:id', clientIdRules(), validate, clientsController.getClientById);
router.post('/', createClientRules(), validate, clientsController.createClient);
router.put('/:id', [...clientIdRules(), ...updateClientRules()], validate, clientsController.updateClient);
router.delete('/:id', clientIdRules(), validate, clientsController.deleteClient);

module.exports = router;
