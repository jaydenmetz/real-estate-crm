// backend/src/routes/appointments.routes.js

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['Showing', 'Listing Appointment', 'Open House', 'Inspection', 'Closing', 'Meeting', 'Other']).withMessage('Invalid appointment type'),
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('location').notEmpty().withMessage('Location is required')
];

const updateValidation = [
  body('title').optional().notEmpty(),
  body('type').optional().isIn(['Showing', 'Listing Appointment', 'Open House', 'Inspection', 'Closing', 'Meeting', 'Other']),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('status').optional().isIn(['Scheduled', 'Confirmed', 'Tentative', 'Cancelled', 'Completed', 'Rescheduled'])
];

// Routes
router.get('/stats', requirePermission('appointments'), appointmentsController.getStats);
router.get('/upcoming', requirePermission('appointments'), appointmentsController.getUpcomingAppointments);
router.post('/check-conflicts', requirePermission('appointments'), appointmentsController.checkConflicts);
router.get('/', requirePermission('appointments'), appointmentsController.getAppointments);
router.get('/:id', requirePermission('appointments'), appointmentsController.getAppointment);
router.post('/', requirePermission('appointments'), createValidation, handleValidationErrors, appointmentsController.createAppointment);
router.put('/:id', requirePermission('appointments'), updateValidation, handleValidationErrors, appointmentsController.updateAppointment);
router.delete('/:id', requirePermission('appointments'), appointmentsController.deleteAppointment);

// Status management endpoints
router.patch('/:id/status', requirePermission('appointments'), [
  body('status').isIn(['Scheduled', 'Confirmed', 'Tentative', 'Cancelled', 'Completed', 'Rescheduled']).withMessage('Invalid status')
], handleValidationErrors, appointmentsController.updateStatus);

router.post('/:id/reschedule', requirePermission('appointments'), [
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('reason').notEmpty().withMessage('Reason is required')
], handleValidationErrors, appointmentsController.rescheduleAppointment);

router.post('/:id/cancel', requirePermission('appointments'), [
  body('reason').notEmpty().withMessage('Cancellation reason is required')
], handleValidationErrors, appointmentsController.cancelAppointment);

module.exports = router;