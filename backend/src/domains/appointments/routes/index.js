const express = require('express');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { authenticateToken } = require('../../../middleware/auth');
const { validate } = require('../../../middleware/validation.middleware');
const {
  createAppointmentRules,
  updateAppointmentRules,
  updateStatusRules,
  appointmentIdRules,
  batchDeleteRules,
} = require('../validators/appointments.validators');

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
router.delete('/batch', batchDeleteRules(), validate, appointmentsController.batchDeleteAppointments);

/**
 * Main CRUD operations
 */
router.get('/', appointmentsController.getAppointments);
router.get('/:id', appointmentIdRules(), validate, appointmentsController.getAppointment);
router.post('/', createAppointmentRules(), validate, appointmentsController.createAppointment);
router.put('/:id', [...appointmentIdRules(), ...updateAppointmentRules()], validate, appointmentsController.updateAppointment);
router.delete('/:id', appointmentIdRules(), validate, appointmentsController.deleteAppointment);

/**
 * Status update endpoint (must be before archive/restore to avoid collision)
 * PATCH /v1/appointments/:id/status
 */
router.patch('/:id/status', [...appointmentIdRules(), ...updateStatusRules()], validate, appointmentsController.updateStatus);

/**
 * Archive operations
 */
router.patch('/:id/archive', appointmentIdRules(), validate, appointmentsController.archiveAppointment);
router.patch('/:id/restore', appointmentIdRules(), validate, appointmentsController.restoreAppointment);

module.exports = router;
