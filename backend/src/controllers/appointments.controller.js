
const logger = require('../utils/logger');

exports.getAppointments = async (req, res) => {
  try {
    // MOCK DATA - Replace database query
    const mockAppointments = [
      {
        id: '1',
        title: 'Listing Presentation - Smith Property',
        date: '2025-07-06',
        startTime: '10:00',
        duration: 60,
        appointmentType: 'Listing Presentation',
        status: 'Scheduled',
        client: 'Smith Family',
        location: '123 Main St',
        notes: 'Bring comps and market analysis'
      },
      {
        id: '2', 
        title: 'Buyer Consultation - Johnson Family',
        date: '2025-07-06',
        startTime: '14:00',
        duration: 90,
        appointmentType: 'Buyer Consultation',
        status: 'Confirmed',
        client: 'Johnson Family',
        location: 'Office',
        notes: 'First-time homebuyers, budget $400k'
      },
      {
        id: '3',
        title: 'Property Showing - Downtown Condo',
        date: '2025-07-06', 
        startTime: '16:30',
        duration: 30,
        appointmentType: 'Property Showing',
        status: 'Scheduled',
        client: 'Wilson LLC',
        location: '456 Oak Ave #12',
        notes: 'Investment property showing'
      }
    ];

    res.json({
      success: true,
      data: {
        appointments: mockAppointments,
        total: mockAppointments.length,
        page: 1,
        pages: 1
      },
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
    const { id } = req.params;
    
    const mockAppointment = {
      id: id,
      title: 'Listing Presentation - Smith Property',
      date: '2025-07-06',
      startTime: '10:00',
      duration: 60,
      appointmentType: 'Listing Presentation',
      status: 'Scheduled',
      client: 'Smith Family',
      location: '123 Main St',
      notes: 'Bring comps and market analysis'
    };

    res.json({
      success: true,
      data: mockAppointment,
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
    const appointmentData = req.body;
    
    const newAppointment = {
      id: Date.now().toString(),
      ...appointmentData,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: newAppointment,
      message: 'Appointment created successfully',
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
    const { id } = req.params;
    const updateData = req.body;
    
    const updatedAppointment = {
      id: id,
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: updatedAppointment,
      message: 'Appointment updated successfully',
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
    const { id } = req.params;

    res.json({
      success: true,
      message: 'Appointment deleted successfully',
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

exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: {
        id: id,
        status: 'Cancelled',
        cancelReason: reason,
        cancelledAt: new Date().toISOString()
      },
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
    const { id } = req.params;
    const { notes, outcome } = req.body;

    res.json({
      success: true,
      message: 'Appointment completed successfully',
      data: {
        id: id,
        status: 'Completed',
        completionNotes: notes,
        outcome: outcome,
        completedAt: new Date().toISOString()
      },
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
