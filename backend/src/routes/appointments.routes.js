// backend/src/routes/appointments.routes.js

const express = require('express');
const { body, param, query } = require('express-validator');
const router = express.Router();
const appointmentsController = require('../controllers/appointments.controller');
const { authenticate, requirePermission } = require('../middleware/auth.middleware');
const validationMiddleware = require('../middleware/validation.middleware');

// All routes require authentication and appointment permissions
router.use(authenticate);
router.use(requirePermission('appointments'));

// GET /v1/appointments?date=YYYY-MM-DD&page&limit
router.get(
  '/',
  [
    query('date').optional().isISO8601().withMessage('Invalid date format'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1 }).toInt()
  ],
  validationMiddleware,
  appointmentsController.getAppointments
);

// GET /v1/appointments/:id
router.get(
  '/:id',
  [
    param('id').notEmpty().withMessage('Appointment ID is required')
  ],
  validationMiddleware,
  appointmentsController.getAppointment
);

// POST /v1/appointments
router.post(
  '/',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('appointmentDate').isISO8601().withMessage('Invalid appointment date'),
    body('startTime').notEmpty().withMessage('Start time is required'),
    body('endTime').notEmpty().withMessage('End time is required'),
    body('clientId').notEmpty().withMessage('Client ID is required'),
  ],
  validationMiddleware,
  appointmentsController.createAppointment
);

// PUT /v1/appointments/:id
router.put(
  '/:id',
  [
    param('id').notEmpty().withMessage('Appointment ID is required'),
    body('appointmentDate').optional().isISO8601().withMessage('Invalid appointment date'),
    body('startTime').optional().notEmpty().withMessage('Start time is required'),
    body('endTime').optional().notEmpty().withMessage('End time is required'),
    body('clientId').optional().notEmpty().withMessage('Client ID is required'),
    body('status').optional().isString().withMessage('Status must be a string'),
  ],
  validationMiddleware,
  appointmentsController.updateAppointment
);

// POST /v1/appointments/:id/cancel
router.post(
  '/:id/cancel',
  [
    param('id').notEmpty().withMessage('Appointment ID is required'),
  ],
  validationMiddleware,
  appointmentsController.cancelAppointment
);

// POST /v1/appointments/:id/complete
router.post(
  '/:id/complete',
  [
    param('id').notEmpty().withMessage('Appointment ID is required'),
  ],
  validationMiddleware,
  appointmentsController.completeAppointment
);

module.exports = router;
