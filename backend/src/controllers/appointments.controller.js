
const Appointment = require('../models/Appointment.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAppointments = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      clientId: req.query.clientId,
      propertyId: req.query.propertyId,
      search: req.query.search,
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: req.query.sort,
      order: req.query.order
    };
    
    const result = await Appointment.findAll(filters);
    
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointments'
      }
    });
  }
};

exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointment'
      }
    });
  }
};

exports.createAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: errors.array()
        }
      });
    }
    
    const appointment = await Appointment.create(req.body);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:created', appointment);
    
    res.status(201).json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create appointment'
      }
    });
  }
};

exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.update(req.params.id, req.body);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:updated', appointment);
    
    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update appointment'
      }
    });
  }
};

exports.deleteAppointment = async (req, res) => {
  try {
    const deletedAppointment = await Appointment.delete(req.params.id);
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:deleted', { id: req.params.id });
    
    res.json({
      success: true,
      data: deletedAppointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete appointment'
      }
    });
  }
};

// PATCH /appointments/:id/status
exports.updateStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    
    const appointment = await Appointment.updateStatus(req.params.id, status, reason);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }
    
    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:statusChanged', { id: req.params.id, status });
    
    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATUS_ERROR',
        message: 'Failed to update appointment status'
      }
    });
  }
};

// POST /appointments/:id/reschedule
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { startTime, endTime, reason } = req.body;
    
    const appointment = await Appointment.reschedule(
      req.params.id, 
      startTime, 
      endTime, 
      reason
    );
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error rescheduling appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RESCHEDULE_ERROR',
        message: 'Failed to reschedule appointment'
      }
    });
  }
};

// POST /appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    
    const appointment = await Appointment.cancel(req.params.id, reason);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_ERROR',
        message: 'Failed to cancel appointment'
      }
    });
  }
};

// GET /appointments/upcoming
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const appointments = await Appointment.getUpcoming(days);
    
    res.json({
      success: true,
      data: appointments,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch upcoming appointments'
      }
    });
  }
};

// GET /appointments/stats
exports.getStats = async (req, res) => {
  try {
    const stats = await Appointment.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch appointment statistics'
      }
    });
  }
};

// POST /appointments/check-conflicts
exports.checkConflicts = async (req, res) => {
  try {
    const { startTime, endTime, excludeId } = req.body;
    
    const conflicts = await Appointment.checkConflicts(startTime, endTime, excludeId);
    
    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error checking conflicts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFLICT_ERROR',
        message: 'Failed to check appointment conflicts'
      }
    });
  }
};
