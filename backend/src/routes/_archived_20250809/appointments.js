const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./auth');
const databaseService = require('../services/database.service');

// Apply authentication to all routes
router.use(authenticateToken);

// Transform appointment for list view
const transformAppointmentForList = (appointment) => ({
  id: appointment.id,
  title: appointment.title,
  type: appointment.type,
  status: appointment.status,
  startDate: appointment.startDate,
  endDate: appointment.endDate,
  duration: appointment.duration,
  location: appointment.location,
  clientName: appointment.clientName,
  clientPhone: appointment.clientPhone,
  propertyId: appointment.propertyId,
  outcome: appointment.outcome,
  followUpRequired: appointment.followUpRequired
});

// GET /v1/appointments - List all appointments with pagination and filters
router.get('/', (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      type,
      status,
      startDate,
      endDate,
      clientId,
      sort = 'startDate',
      order = 'asc',
      search
    } = req.query;

    let appointments = databaseService.getAll('appointments');

    // Apply filters
    if (type) {
      appointments = appointments.filter(a => a.type === type);
    }
    if (status) {
      appointments = appointments.filter(a => a.status === status);
    }
    if (clientId) {
      appointments = appointments.filter(a => a.clientId === clientId);
    }
    if (startDate) {
      appointments = appointments.filter(a => 
        new Date(a.startDate) >= new Date(startDate)
      );
    }
    if (endDate) {
      appointments = appointments.filter(a => 
        new Date(a.startDate) <= new Date(endDate)
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      appointments = appointments.filter(a => 
        a.title?.toLowerCase().includes(searchLower) ||
        a.location?.toLowerCase().includes(searchLower) ||
        a.notes?.toLowerCase().includes(searchLower) ||
        a.clientName?.toLowerCase().includes(searchLower)
      );
    }

    // Sort appointments
    appointments.sort((a, b) => {
      let aVal = a[sort];
      let bVal = b[sort];
      
      // Handle date sorting
      if (sort.includes('Date')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }
      
      // Handle numeric sorting
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      // Handle string sorting
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return order === 'asc' 
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedAppointments = appointments.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        appointments: paginatedAppointments.map(transformAppointmentForList),
        pagination: {
          total: appointments.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(appointments.length / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch appointments'
      }
    });
  }
});

// GET /v1/appointments/stats - Get appointment statistics
router.get('/stats', (req, res) => {
  try {
    const appointments = databaseService.getAll('appointments');
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Calculate stats
    const stats = {
      total: appointments.length,
      scheduled: appointments.filter(a => a.status === 'Scheduled').length,
      confirmed: appointments.filter(a => a.status === 'Confirmed').length,
      completed: appointments.filter(a => a.status === 'Completed').length,
      cancelled: appointments.filter(a => a.status === 'Cancelled').length,
      
      todayCount: appointments.filter(a => {
        const aptDate = new Date(a.startDate);
        return aptDate >= today && aptDate < new Date(today.getTime() + 24 * 60 * 60 * 1000);
      }).length,
      
      thisWeekCount: appointments.filter(a => {
        const aptDate = new Date(a.startDate);
        return aptDate >= today && aptDate <= weekFromNow;
      }).length,
      
      upcomingCount: appointments.filter(a => 
        new Date(a.startDate) > now && 
        ['Scheduled', 'Confirmed'].includes(a.status)
      ).length
    };

    // By type breakdown
    const byType = {};
    appointments.forEach(a => {
      byType[a.type] = (byType[a.type] || 0) + 1;
    });

    // Conversion rates
    const showings = appointments.filter(a => a.type === 'Showing');
    const showingsWithOffers = showings.filter(a => a.outcome === 'Made Offer');
    const conversionRate = showings.length > 0 
      ? Math.round((showingsWithOffers.length / showings.length) * 100) 
      : 0;

    res.json({
      success: true,
      data: {
        overview: stats,
        byType,
        conversion: {
          showingToOffer: conversionRate,
          totalShowings: showings.length,
          resultedInOffers: showingsWithOffers.length
        },
        activity: {
          completedThisWeek: appointments.filter(a => {
            const completed = new Date(a.endDate);
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return a.status === 'Completed' && completed >= weekAgo && completed <= now;
          }).length,
          
          scheduledNext7Days: appointments.filter(a => {
            const start = new Date(a.startDate);
            return start >= now && start <= weekFromNow && 
              ['Scheduled', 'Confirmed'].includes(a.status);
          }).length
        }
      }
    });
  } catch (error) {
    console.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch appointment statistics'
      }
    });
  }
});

// GET /v1/appointments/calendar - Get appointments in calendar format
router.get('/calendar', (req, res) => {
  try {
    const { start, end } = req.query;
    
    let appointments = databaseService.getAll('appointments');
    
    if (start) {
      appointments = appointments.filter(a => 
        new Date(a.endDate) >= new Date(start)
      );
    }
    if (end) {
      appointments = appointments.filter(a => 
        new Date(a.startDate) <= new Date(end)
      );
    }

    // Transform for calendar display
    const calendarEvents = appointments.map(a => ({
      id: a.id,
      title: a.title,
      start: a.startDate,
      end: a.endDate,
      type: a.type,
      status: a.status,
      location: a.location,
      client: a.clientName,
      color: {
        'Showing': '#4caf50',
        'Listing Presentation': '#2196f3',
        'Open House': '#ff9800',
        'Inspection': '#f44336',
        'Closing': '#9c27b0',
        'Consultation': '#607d8b'
      }[a.type] || '#757575'
    }));

    res.json({
      success: true,
      data: calendarEvents
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch calendar events'
      }
    });
  }
});

// GET /v1/appointments/:id - Get single appointment details
router.get('/:id', (req, res) => {
  try {
    const appointment = databaseService.getById('appointments', req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    // Get related data
    if (appointment.clientId) {
      appointment.client = databaseService.getById('clients', appointment.clientId);
    }
    
    if (appointment.propertyId) {
      appointment.property = databaseService.getById('listings', appointment.propertyId);
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to fetch appointment details'
      }
    });
  }
});

// POST /v1/appointments - Create new appointment
router.post('/', (req, res) => {
  try {
    const newAppointment = databaseService.create('appointments', {
      ...req.body,
      status: req.body.status || 'Scheduled',
      createdBy: req.user.username
    });

    res.status(201).json({
      success: true,
      data: newAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to create appointment'
      }
    });
  }
});

// PUT /v1/appointments/:id - Update appointment
router.put('/:id', (req, res) => {
  try {
    const updated = databaseService.update('appointments', req.params.id, req.body);
    
    if (!updated) {
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
      data: updated
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to update appointment'
      }
    });
  }
});

// POST /v1/appointments/:id/complete - Complete appointment with outcome
router.post('/:id/complete', (req, res) => {
  try {
    const appointment = databaseService.getById('appointments', req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    const { outcome, notes, followUpDate } = req.body;
    
    const updates = {
      status: 'Completed',
      outcome,
      followUpRequired: !!followUpDate
    };
    
    if (notes) {
      updates.notes = (appointment.notes || '') + `\n[OUTCOME] ${notes}`;
    }
    
    const updated = databaseService.update('appointments', req.params.id, updates);

    // Create follow-up appointment if needed
    if (followUpDate) {
      const followUp = databaseService.create('appointments', {
        title: `Follow-up: ${appointment.title}`,
        type: 'Consultation',
        status: 'Scheduled',
        startDate: followUpDate,
        endDate: new Date(new Date(followUpDate).getTime() + 60 * 60 * 1000).toISOString(),
        duration: 60,
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        clientPhone: appointment.clientPhone,
        notes: `Follow-up from appointment ${appointment.id}`,
        createdBy: req.user.username
      });
      
      updated.followUpAppointment = followUp.id;
    }

    res.json({
      success: true,
      data: {
        appointment: updated,
        message: 'Appointment completed successfully'
      }
    });
  } catch (error) {
    console.error('Error completing appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to complete appointment'
      }
    });
  }
});

// DELETE /v1/appointments/:id - Delete appointment
router.delete('/:id', (req, res) => {
  try {
    const deleted = databaseService.delete('appointments', req.params.id);
    
    if (!deleted) {
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
      data: {
        message: 'Appointment deleted successfully'
      }
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SERVER_ERROR',
        message: 'Failed to delete appointment'
      }
    });
  }
});

module.exports = router;