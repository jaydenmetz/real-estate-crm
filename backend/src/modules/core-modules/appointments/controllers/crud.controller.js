/**
 * Appointments CRUD Controller
 *
 * Thin HTTP layer that delegates to AppointmentsService.
 * Handles request/response formatting and error handling.
 *
 * @module modules/appointments/controllers/crud
 */

const logger = require('../../../../utils/logger');
const appointmentsService = require('../services/appointments.service');

// GET /api/v1/appointments
exports.getAppointments = async (req, res) => {
  try {
    const result = await appointmentsService.getAllAppointments(req.query, req.user);

    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointments',
        details: error.message,
      },
    });
  }
};

// GET /api/v1/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await appointmentsService.getAppointmentById(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointment',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments
exports.createAppointment = async (req, res) => {
  try {
    const newAppt = await appointmentsService.createAppointment(req.body, req.user);

    res.status(201).json({
      success: true,
      data: newAppt,
      message: 'Appointment created successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.message.includes('required')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: error.message,
        },
      });
    }

    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create appointment',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAppt = await appointmentsService.updateAppointment(id, req.body, req.user);

    if (!updatedAppt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: updatedAppt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.message === 'VERSION_CONFLICT') {
      const { id } = req.params;
      const { pool } = require('../../../../config/infrastructure/database');
      const checkQuery = 'SELECT version FROM appointments WHERE id = $1 AND deleted_at IS NULL';
      const checkResult = await pool.query(checkQuery, [id]);

      return res.status(409).json({
        success: false,
        error: {
          code: 'VERSION_CONFLICT',
          message: 'This appointment was modified by another user. Please refresh and try again.',
          currentVersion: checkResult.rows[0]?.version,
          attemptedVersion: req.body.version,
        },
      });
    }

    if (error.message === 'No valid fields to update') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_UPDATES',
          message: error.message,
        },
      });
    }

    logger.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update appointment',
        details: error.message,
      },
    });
  }
};

// PUT /api/v1/appointments/:id/archive
exports.archiveAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const archivedAppt = await appointmentsService.archiveAppointment(id);

    if (!archivedAppt) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      data: archivedAppt,
      message: 'Appointment archived successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Error archiving appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'ARCHIVE_ERROR',
        message: 'Failed to archive appointment',
        details: error.message,
      },
    });
  }
};

// DELETE /api/v1/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await appointmentsService.deleteAppointment(id, req.user);

    if (result === null) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found',
        },
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    if (error.message.includes('must be archived')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: error.message,
        },
      });
    }

    logger.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete appointment',
        details: error.message,
      },
    });
  }
};

// POST /api/v1/appointments/batch-delete
exports.batchDeleteAppointments = async (req, res) => {
  try {
    const { ids } = req.body;
    const result = await appointmentsService.batchDeleteAppointments(ids, req.user);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error.message.includes('not archived')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: error.message,
        },
      });
    }

    logger.error('Error batch deleting appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to batch delete appointments',
        details: error.message,
      },
    });
  }
};
