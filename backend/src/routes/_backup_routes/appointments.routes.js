const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const handleValidationErrors = require('../middleware/validation.middleware');

// All routes require authentication
router.use(authenticate);

// Validation rules
const createValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').optional().isIn(['Showing', 'Listing Presentation', 'Buyer Consultation', 'Open House', 'Closing', 'Inspection', 'Appraisal', 'Other']).withMessage('Invalid appointment type'),
  body('date').notEmpty().isISO8601().withMessage('Valid date is required'),
  body('startTime').notEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time (HH:MM) is required'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('location').optional().isString(),
  body('propertyAddress').optional().isString(),
  body('attendees').optional().isArray(),
  body('sendInvites').optional().isBoolean(),
  body('videoMeetingRequired').optional().isBoolean(),
  body('bufferTime').optional().isInt({ min: 0, max: 60 }),
  body('isRecurring').optional().isBoolean(),
  body('recurringPattern').optional().isObject()
];

const updateValidation = [
  body('title').optional().notEmpty(),
  body('type').optional().isIn(['Showing', 'Listing Presentation', 'Buyer Consultation', 'Open House', 'Closing', 'Inspection', 'Appraisal', 'Other']),
  body('date').optional().isISO8601(),
  body('startTime').optional().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration').optional().isInt({ min: 15, max: 480 }),
  body('status').optional().isIn(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'])
];

const reminderValidation = [
  body('reminderType').optional().isIn(['1_week', '1_day', '1_hour', '30_minutes'])
];

const completeValidation = [
  body('outcome').optional().isString(),
  body('notes').optional().isString(),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601()
];

const noShowValidation = [
  body('attendeeId').optional().isMongoId(),
  body('reason').optional().isString()
];

const cancelValidation = [
  body('reason').notEmpty().withMessage('Cancellation reason is required'),
  body('sendNotification').optional().isBoolean()
];

const preparationNoteValidation = [
  body('note').notEmpty().withMessage('Note content is required'),
  body('checklistItemId').optional().isMongoId()
];

const conflictCheckValidation = [
  body('date').notEmpty().isISO8601().withMessage('Date is required'),
  body('start').notEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid start time is required'),
  body('end').notEmpty().matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid end time is required'),
  body('excludeId').optional().isMongoId(),
  body('includeBufferTime').optional().isBoolean()
];

// Main routes
router.get('/stats', requirePermission('appointments'), appointmentsController.getStats);
router.get('/upcoming', requirePermission('appointments'), appointmentsController.getUpcomingAppointments);
router.get('/available-slots', requirePermission('appointments'), [
  query('date').notEmpty().isISO8601(),
  query('duration').optional().isInt({ min: 15, max: 480 }),
  query('startHour').optional().isInt({ min: 0, max: 23 }),
  query('endHour').optional().isInt({ min: 0, max: 23 })
], handleValidationErrors, appointmentsController.getAvailableSlots);

router.get('/', requirePermission('appointments'), [
  query('filter').optional().isIn(['today', 'this_week', 'this_month', 'date_range']),
  query('type').optional().isIn(['Showing', 'Listing Presentation', 'Buyer Consultation', 'Open House', 'Closing', 'Inspection', 'Appraisal', 'Other']),
  query('status').optional().isIn(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sort').optional().isIn(['date', 'title', 'type', 'status', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
  query('view').optional().isIn(['list', 'calendar', 'agenda'])
], handleValidationErrors, appointmentsController.getAppointments);

router.get('/:id', requirePermission('appointments'), appointmentsController.getAppointment);
router.get('/:id/export-ics', requirePermission('appointments'), appointmentsController.exportToICS);

router.post('/', requirePermission('appointments'), createValidation, handleValidationErrors, appointmentsController.createAppointment);
router.post('/check-conflicts', requirePermission('appointments'), conflictCheckValidation, handleValidationErrors, appointmentsController.checkConflicts);

router.put('/:id', requirePermission('appointments'), updateValidation, handleValidationErrors, appointmentsController.updateAppointment);

router.delete('/:id', requirePermission('appointments'), appointmentsController.deleteAppointment);

// Workflow endpoints
router.post('/:id/reminders', requirePermission('appointments'), reminderValidation, handleValidationErrors, appointmentsController.sendReminders);
router.post('/:id/complete', requirePermission('appointments'), completeValidation, handleValidationErrors, appointmentsController.markComplete);
router.post('/:id/no-show', requirePermission('appointments'), noShowValidation, handleValidationErrors, appointmentsController.markNoShow);
router.post('/:id/cancel', requirePermission('appointments'), cancelValidation, handleValidationErrors, appointmentsController.cancelAppointment);
router.post('/:id/preparation-notes', requirePermission('appointments'), preparationNoteValidation, handleValidationErrors, appointmentsController.addPreparationNote);

// Legacy endpoints (kept for backward compatibility)
router.patch('/:id/status', requirePermission('appointments'), [
  body('status').isIn(['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show']).withMessage('Invalid status'),
  body('reason').optional().isString()
], handleValidationErrors, appointmentsController.updateStatus);

router.post('/:id/reschedule', requirePermission('appointments'), [
  body('startTime').isISO8601().withMessage('Invalid start time'),
  body('endTime').isISO8601().withMessage('Invalid end time'),
  body('reason').notEmpty().withMessage('Reason is required')
], handleValidationErrors, appointmentsController.rescheduleAppointment);

module.exports = router;