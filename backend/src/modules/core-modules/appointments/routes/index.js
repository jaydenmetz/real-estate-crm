// backend/src/routes/appointments.routes.js

const express = require('express');

const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers');
const { authenticate } = require('../../../../middleware/auth/apiKey.middleware');
const { validate } = require('../../../../middleware/security/validation.middleware');
const { validateAppointmentRules } = require('../../../../middleware/business/businessRules.middleware');
const {
  canAccessScope,
  requireOwnership,
  requireModifyPermission,
  requireDeletePermission
} = require('../../../../middleware/auth/authorization.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('appointmentType').optional().isIn(['Listing Presentation', 'Buyer Consultation', 'Property Showing', 'Open House', 'Closing', 'Inspection', 'Other', 'meeting']),
  body('startDate').optional().isISO8601().withMessage('Invalid start date'),
  body('endDate').optional().isISO8601().withMessage('Invalid end date'),
  body('duration').optional().isInt({ min: 15, max: 480 }),
];

const updateValidation = [
  body('title').optional().notEmpty(),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
  body('status').optional().isString(),
];

// Routes with Phase 2 authorization + INHERITED PRIVACY
router.get('/', canAccessScope, appointmentsController.getAppointments); // Filters out appointments linked to private leads
router.get('/:id', requireOwnership('appointment'), appointmentsController.getAppointment); // Checks inherited privacy
router.post('/', createValidation, validate, validateAppointmentRules, appointmentsController.createAppointment);
router.put('/:id', updateValidation, validate, requireModifyPermission('appointment'), validateAppointmentRules, appointmentsController.updateAppointment);
router.post('/:id/cancel', requireModifyPermission('appointment'), appointmentsController.cancelAppointment);
router.post('/:id/complete', requireModifyPermission('appointment'), appointmentsController.markComplete);

// Archive and Delete endpoints
router.put('/:id/archive', requireModifyPermission('appointment'), appointmentsController.archiveAppointment);
router.delete('/:id', requireDeletePermission('appointment'), appointmentsController.deleteAppointment);
// Batch delete endpoint: Delete multiple archived appointments
router.post(
  '/batch-delete',
  body('ids').isArray({ min: 1 }).withMessage('IDs must be a non-empty array'),
  body('ids.*').isString().withMessage('Each ID must be a string'),
  validate,
  appointmentsController.batchDeleteAppointments,
);

// ============================================================================
// STOPS MANAGEMENT
// ============================================================================

// Update all stops for an appointment (replace all)
router.put('/:id/stops', requireModifyPermission('appointment'), appointmentsController.updateStops);

// Add a single stop to an appointment
router.post('/:id/stops', requireModifyPermission('appointment'), appointmentsController.addStop);

// Delete a specific stop
router.delete('/stops/:stopId', appointmentsController.deleteStop);

// ============================================================================
// ATTENDEES MANAGEMENT
// ============================================================================

// Update all attendees for an appointment (replace all)
router.put('/:id/attendees', requireModifyPermission('appointment'), appointmentsController.updateAttendees);

// Add a single attendee to an appointment
router.post('/:id/attendees', requireModifyPermission('appointment'), appointmentsController.addAttendee);

// Remove a specific attendee
router.delete('/attendees/:attendeeId', appointmentsController.removeAttendee);

// ============================================================================
// SHOWINGS MANAGEMENT (for 'showing' type appointments)
// ============================================================================

// Get all showings for an appointment with listing details
router.get('/:id/showings', requireOwnership('appointment'), appointmentsController.getShowings);

// Update all showings for an appointment (replace all)
router.put('/:id/showings', requireModifyPermission('appointment'), appointmentsController.updateShowings);

// Add a single showing to an appointment
router.post('/:id/showings', requireModifyPermission('appointment'), appointmentsController.addShowing);

// Update a specific showing (for feedback, status, etc.)
router.put('/showings/:showingId', appointmentsController.updateShowing);

// Delete a specific showing
router.delete('/showings/:showingId', appointmentsController.deleteShowing);

module.exports = router;
