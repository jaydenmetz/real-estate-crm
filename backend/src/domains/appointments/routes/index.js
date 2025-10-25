const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { authenticateToken } = require('../../../middleware/auth');

/**
 * Appointments Domain Routes
 * Consolidated routing for all appointment operations
 * All routes require authentication
 */

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * Statistics endpoint (must be before /:id to avoid route collision)
 * GET /v1/appointments/stats
 */
router.get('/stats', appointmentsController.getStats);

/**
 * Batch operations (must be before /:id)
 * DELETE /v1/appointments/batch
 */
router.delete('/batch', appointmentsController.batchDeleteAppointments);

/**
 * Main CRUD operations
 */
router.get('/', appointmentsController.getAppointments);
router.get('/:id', appointmentsController.getAppointment);
router.post('/', appointmentsController.createAppointment);
router.put('/:id', appointmentsController.updateAppointment);
router.delete('/:id', appointmentsController.deleteAppointment);

/**
 * Status update endpoint (must be before archive/restore to avoid collision)
 * PATCH /v1/appointments/:id/status
 */
router.patch('/:id/status', appointmentsController.updateStatus);

/**
 * Archive operations
 */
router.patch('/:id/archive', appointmentsController.archiveAppointment);
router.patch('/:id/restore', appointmentsController.restoreAppointment);

module.exports = router;
