const express = require('express');
const router = express.Router();
const leadsController = require('../controllers/leads.controller');
const { authenticateToken } = require('../../../middleware/auth.middleware');
const { validate } = require('../../../middleware/validation.middleware');
const {
  createLeadRules,
  updateLeadRules,
  updateStatusRules,
  leadIdRules,
  batchDeleteRules,
} = require('../validators/leads.validators');

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
router.delete('/batch', batchDeleteRules(), validate, leadsController.batchDeleteLeads);

/**
 * Main CRUD operations
 */
router.get('/', leadsController.getLeads);
router.get('/:id', leadIdRules(), validate, leadsController.getLead);
router.post('/', createLeadRules(), validate, leadsController.createLead);
router.put('/:id', [...leadIdRules(), ...updateLeadRules()], validate, leadsController.updateLead);
router.delete('/:id', leadIdRules(), validate, leadsController.deleteLead);

/**
 * Status update endpoint (must be before archive/restore/convert to avoid collision)
 * PATCH /v1/leads/:id/status
 */
router.patch('/:id/status', [...leadIdRules(), ...updateStatusRules()], validate, leadsController.updateStatus);

/**
 * Convert lead to client
 * POST /v1/leads/:id/convert
 */
router.post('/:id/convert', leadIdRules(), validate, leadsController.convertToClient);

/**
 * Archive operations
 */
router.patch('/:id/archive', leadIdRules(), validate, leadsController.archiveLead);
router.patch('/:id/restore', leadIdRules(), validate, leadsController.restoreLead);

module.exports = router;
