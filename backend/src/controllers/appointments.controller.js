
const Appointment = require('../models/Appointment');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');

exports.getAppointments = async (req, res) => {
  try {
    const filters = {
      date: req.query.date,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      type: req.query.type,
      status: req.query.status,
      agent: req.query.agent,
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort
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
    
    // Send notifications to attendees
    await Appointment.sendNotifications(appointment.id, 'created');
    
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

exports.cancelAppointment = async (req, res) => {
  try {
    const { reason, notifyAttendees } = req.body;
    
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
    
    if (notifyAttendees) {
      await Appointment.sendNotifications(req.params.id, 'cancelled', reason);
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

exports.completeAppointment = async (req, res) => {
  try {
    const { outcome, followUpActions, notes } = req.body;
    
    const appointment = await Appointment.complete(req.params.id, {
      outcome,
      followUpActions,
      notes
    });
    
    res.json({
      success: true,
      data: appointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_ERROR',
        message: 'Failed to complete appointment'
      }
    });
  }
};