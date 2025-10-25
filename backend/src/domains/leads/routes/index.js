const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Leads Domain Routes
 * Consolidated routing for all lead operations
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Statistics endpoint (must be before /:id to avoid route collision)
 * GET /v1/leads/stats
 */
router.get('/stats', leadsController.getStats);

/**
 * Batch operations (must be before /:id)
 * DELETE /v1/leads/batch
 */
router.delete('/batch', leadsController.batchDeleteLeads);

/**
 * Main CRUD operations
 */
router.get('/', leadsController.getLeads);
router.get('/:id', leadsController.getLead);
router.post('/', leadsController.createLead);
router.put('/:id', leadsController.updateLead);
router.delete('/:id', leadsController.deleteLead);

/**
 * Status update endpoint (must be before archive/restore/convert to avoid collision)
 * PATCH /v1/leads/:id/status
 */
router.patch('/:id/status', leadsController.updateStatus);

/**
 * Convert lead to client
 * POST /v1/leads/:id/convert
 */
router.post('/:id/convert', leadsController.convertToClient);

/**
 * Archive operations
 */
router.patch('/:id/archive', leadsController.archiveLead);
router.patch('/:id/restore', leadsController.restoreLead);

module.exports = router;
