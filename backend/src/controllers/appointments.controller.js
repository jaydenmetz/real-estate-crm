const Appointment = require('../models/Appointment.mock');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');
const calendarService = require('../services/calendar.service');
const weatherService = require('../services/weather.service');

// GET /api/v1/appointments
exports.getAppointments = async (req, res) => {
  try {
    const {
      filter, // today, this_week, this_month, date_range
      type,
      status = 'Scheduled',
      clientId,
      propertyId,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sort = 'date',
      order = 'asc',
      view = 'list' // list, calendar, agenda
    } = req.query;

    // Build filter object
    const filters = {};
    
    // Date range filtering
    const now = new Date();
    let dateStart, dateEnd;
    
    switch (filter) {
      case 'today':
        dateStart = new Date(now.setHours(0, 0, 0, 0));
        dateEnd = new Date(now.setHours(23, 59, 59, 999));
        break;
      case 'this_week':
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        dateStart = startOfWeek;
        dateEnd = endOfWeek;
        break;
      case 'this_month':
        dateStart = new Date(now.getFullYear(), now.getMonth(), 1);
        dateEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'date_range':
        if (startDate) dateStart = new Date(startDate);
        if (endDate) dateEnd = new Date(endDate);
        break;
    }
    
    if (dateStart && dateEnd) {
      filters.date = { $gte: dateStart, $lte: dateEnd };
    }
    
    // Type filter
    if (type) {
      const validTypes = ['Showing', 'Listing Presentation', 'Buyer Consultation', 'Open House', 'Closing', 'Inspection', 'Appraisal', 'Other'];
      if (validTypes.includes(type)) {
        filters.type = type;
      }
    }
    
    // Status filter
    if (status) {
      const validStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];
      if (validStatuses.includes(status)) {
        filters.status = status;
      }
    }
    
    // Client and property filters
    if (clientId) filters.clientId = clientId;
    if (propertyId) filters.propertyId = propertyId;

    // Sorting options
    const sortOptions = {};
    const validSortFields = ['date', 'title', 'type', 'status', 'createdAt'];
    if (validSortFields.includes(sort)) {
      if (sort === 'date') {
        sortOptions.date = order === 'desc' ? -1 : 1;
        sortOptions.startTime = order === 'desc' ? -1 : 1;
      } else {
        sortOptions[sort] = order === 'desc' ? -1 : 1;
      }
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query
    const [appointments, totalCount] = await Promise.all([
      Appointment.find(filters)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('attendees', 'firstName lastName email phone')
        .populate('propertyId', 'address listPrice')
        .select('-__v'),
      Appointment.countDocuments(filters)
    ]);

    // Format based on view type
    let formattedData;
    if (view === 'calendar') {
      formattedData = formatForCalendar(appointments);
    } else if (view === 'agenda') {
      formattedData = formatForAgenda(appointments);
    } else {
      formattedData = appointments;
    }

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        appointments: formattedData,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          limit: parseInt(limit),
          hasNextPage,
          hasPrevPage
        },
        view
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointments',
        details: error.message
      }
    });
  }
};

// GET /api/v1/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    
    const appointment = await Appointment.findById(id)
      .populate('attendees', 'firstName lastName email phone clientType')
      .populate('propertyId', 'address listPrice propertyType bedrooms bathrooms')
      .populate('createdBy', 'firstName lastName')
      .select('-__v');
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    // Get preparation checklist based on type
    const preparationChecklist = getPreparationChecklist(appointment.type);
    
    // Get weather forecast if appointment is within 7 days
    let weatherForecast = null;
    const daysUntilAppointment = Math.ceil((new Date(appointment.date) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilAppointment <= 7 && daysUntilAppointment >= 0 && appointment.location) {
      try {
        weatherForecast = await weatherService.getForecast(appointment.location, appointment.date);
      } catch (weatherError) {
        logger.error('Failed to get weather forecast:', weatherError);
      }
    }

    res.json({
      success: true,
      data: {
        ...appointment.toObject(),
        preparationChecklist,
        weatherForecast,
        daysUntilAppointment
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch appointment',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments
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

    const {
      title,
      type = 'Other',
      date,
      startTime,
      duration = 60,
      location,
      propertyAddress,
      propertyId,
      attendees = [],
      description,
      isRecurring = false,
      recurringPattern,
      bufferTime = 15,
      travelTime = 0,
      sendInvites = true,
      reminders = ['1_day', '1_hour'],
      videoMeetingRequired = false
    } = req.body;

    // Validate required fields
    if (!title || !date || !startTime) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title, date, and start time are required'
        }
      });
    }

    // Calculate end time
    const appointmentDate = new Date(date);
    const [hours, minutes] = startTime.split(':');
    appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    // Check for scheduling conflicts
    const conflicts = await Appointment.checkConflicts(
      appointmentDate,
      endTime,
      null,
      { includeBufferTime: bufferTime }
    );

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'SCHEDULING_CONFLICT',
          message: 'This time slot conflicts with existing appointments',
          conflicts: conflicts.map(c => ({
            title: c.title,
            startTime: c.startTime,
            endTime: c.endTime
          }))
        }
      });
    }

    // Generate video meeting link if required
    let videoMeetingLink = null;
    if (videoMeetingRequired) {
      videoMeetingLink = await calendarService.generateVideoMeetingLink({
        title,
        date: appointmentDate,
        duration
      });
    }

    // Create preparation checklist
    const preparationChecklist = getPreparationChecklist(type).map(item => ({
      ...item,
      completed: false,
      completedAt: null
    }));

    // Create appointment object
    const appointmentData = {
      title,
      type,
      date: appointmentDate,
      startTime: appointmentDate,
      endTime,
      duration,
      location: location || propertyAddress,
      propertyId,
      propertyAddress,
      attendees,
      description,
      status: 'Scheduled',
      preparationChecklist,
      reminders: reminders.map(r => ({
        type: r,
        sent: false,
        scheduledFor: calculateReminderTime(appointmentDate, r)
      })),
      videoMeetingLink,
      bufferTime,
      travelTime,
      isRecurring,
      recurringPattern,
      createdBy: req.user?.id || 'system',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Handle recurring appointments
    const appointments = [];
    if (isRecurring && recurringPattern) {
      const recurringAppointments = generateRecurringAppointments(
        appointmentData,
        recurringPattern
      );
      for (const recurApp of recurringAppointments) {
        const created = await Appointment.create(recurApp);
        appointments.push(created);
      }
    } else {
      const appointment = await Appointment.create(appointmentData);
      appointments.push(appointment);
    }

    // Send calendar invites if requested
    if (sendInvites && attendees.length > 0) {
      try {
        await calendarService.sendInvites({
          appointment: appointments[0],
          attendees,
          includeVideoLink: videoMeetingRequired
        });
      } catch (inviteError) {
        logger.error('Failed to send calendar invites:', inviteError);
      }
    }

    // Schedule reminders
    for (const appointment of appointments) {
      await scheduleReminders(appointment);
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:created', appointments[0]);

    res.status(201).json({
      success: true,
      data: appointments.length === 1 ? appointments[0] : appointments,
      message: isRecurring ? `Created ${appointments.length} recurring appointments` : 'Appointment created successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create appointment',
        details: error.message
      }
    });
  }
};

// PUT /api/v1/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get current appointment
    const currentAppointment = await Appointment.findById(id);
    if (!currentAppointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    // Check for rescheduling
    const isRescheduling = updates.date || updates.startTime || updates.duration;
    
    if (isRescheduling) {
      // Calculate new times
      const newDate = updates.date ? new Date(updates.date) : currentAppointment.date;
      const newStartTime = updates.startTime || currentAppointment.startTime;
      const newDuration = updates.duration || currentAppointment.duration;
      
      if (typeof newStartTime === 'string') {
        const [hours, minutes] = newStartTime.split(':');
        newDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      }
      
      const newEndTime = new Date(newDate.getTime() + newDuration * 60000);

      // Check for conflicts
      const conflicts = await Appointment.checkConflicts(
        newDate,
        newEndTime,
        id,
        { includeBufferTime: currentAppointment.bufferTime }
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'SCHEDULING_CONFLICT',
            message: 'The new time conflicts with existing appointments',
            conflicts: conflicts.map(c => ({
              title: c.title,
              startTime: c.startTime,
              endTime: c.endTime
            }))
          }
        });
      }

      updates.startTime = newDate;
      updates.endTime = newEndTime;
      
      // Reschedule reminders
      if (updates.reminders) {
        updates.reminders = updates.reminders.map(r => ({
          type: r.type || r,
          sent: false,
          scheduledFor: calculateReminderTime(newDate, r.type || r)
        }));
      }
    }

    // Track change history
    const changeHistory = {
      changedAt: new Date(),
      changedBy: req.user?.id || 'system',
      changes: Object.keys(updates).map(key => ({
        field: key,
        oldValue: currentAppointment[key],
        newValue: updates[key]
      }))
    };

    updates.changeHistory = [...(currentAppointment.changeHistory || []), changeHistory];
    updates.updatedAt = new Date();

    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('attendees', 'firstName lastName email phone');

    // Send update notifications
    if (isRescheduling && updatedAppointment.attendees.length > 0) {
      try {
        await calendarService.sendUpdateNotifications({
          appointment: updatedAppointment,
          attendees: updatedAppointment.attendees,
          changeType: 'rescheduled'
        });
      } catch (notifyError) {
        logger.error('Failed to send update notifications:', notifyError);
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:updated', updatedAppointment);

    res.json({
      success: true,
      data: updatedAppointment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to update appointment',
        details: error.message
      }
    });
  }
};

// DELETE /api/v1/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { sendCancellation = true } = req.query;

    const appointment = await Appointment.findById(id).populate('attendees');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    // Send cancellation notices
    if (sendCancellation && appointment.attendees.length > 0) {
      try {
        await calendarService.sendCancellationNotices({
          appointment,
          attendees: appointment.attendees
        });
      } catch (cancelError) {
        logger.error('Failed to send cancellation notices:', cancelError);
      }
    }

    await Appointment.findByIdAndDelete(id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:deleted', { id });

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
        message: 'Failed to delete appointment',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments/:id/reminders
exports.sendReminders = async (req, res) => {
  try {
    const { id } = req.params;
    const { reminderType } = req.body;

    const appointment = await Appointment.findById(id).populate('attendees');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    const remindersToSend = reminderType 
      ? appointment.reminders.filter(r => r.type === reminderType && !r.sent)
      : appointment.reminders.filter(r => !r.sent);

    const sentReminders = [];
    for (const reminder of remindersToSend) {
      try {
        await calendarService.sendReminder({
          appointment,
          attendees: appointment.attendees,
          reminderType: reminder.type
        });
        
        reminder.sent = true;
        reminder.sentAt = new Date();
        sentReminders.push(reminder.type);
      } catch (reminderError) {
        logger.error(`Failed to send ${reminder.type} reminder:`, reminderError);
      }
    }

    await appointment.save();

    res.json({
      success: true,
      data: {
        sentReminders,
        appointment
      },
      message: `Sent ${sentReminders.length} reminder(s)`,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error sending reminders:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REMINDER_ERROR',
        message: 'Failed to send reminders',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments/:id/complete
exports.markComplete = async (req, res) => {
  try {
    const { id } = req.params;
    const { outcome, notes, followUpRequired, followUpDate } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    appointment.status = 'Completed';
    appointment.completedAt = new Date();
    appointment.outcome = outcome;
    appointment.completionNotes = notes;
    
    if (followUpRequired) {
      appointment.followUp = {
        required: true,
        date: followUpDate ? new Date(followUpDate) : null,
        created: false
      };
    }

    await appointment.save();

    // Create follow-up appointment if needed
    if (followUpRequired && followUpDate) {
      const followUpAppointment = await Appointment.create({
        title: `Follow-up: ${appointment.title}`,
        type: appointment.type,
        date: new Date(followUpDate),
        startTime: appointment.startTime,
        duration: appointment.duration,
        attendees: appointment.attendees,
        description: `Follow-up to appointment on ${appointment.date.toLocaleDateString()}. Previous outcome: ${outcome}`,
        parentAppointmentId: id,
        status: 'Scheduled'
      });

      appointment.followUp.created = true;
      appointment.followUp.appointmentId = followUpAppointment._id;
      await appointment.save();
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:completed', appointment);

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment marked as completed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error marking appointment complete:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPLETE_ERROR',
        message: 'Failed to mark appointment as complete',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments/:id/no-show
exports.markNoShow = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeId, reason } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    if (attendeeId) {
      // Mark specific attendee as no-show
      const attendeeIndex = appointment.attendees.findIndex(
        a => a.toString() === attendeeId
      );
      
      if (attendeeIndex === -1) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ATTENDEE_NOT_FOUND',
            message: 'Attendee not found in appointment'
          }
        });
      }

      if (!appointment.noShows) appointment.noShows = [];
      appointment.noShows.push({
        attendeeId,
        reason,
        markedAt: new Date()
      });
    } else {
      // Mark entire appointment as no-show
      appointment.status = 'No Show';
      appointment.noShowReason = reason;
      appointment.markedNoShowAt = new Date();
    }

    await appointment.save();

    res.json({
      success: true,
      data: appointment,
      message: attendeeId ? 'Attendee marked as no-show' : 'Appointment marked as no-show',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error marking no-show:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NO_SHOW_ERROR',
        message: 'Failed to mark no-show',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments/:id/cancel
exports.cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, sendNotification = true } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REASON',
          message: 'Cancellation reason is required'
        }
      });
    }

    const appointment = await Appointment.findById(id).populate('attendees');
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = reason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user?.id || 'system';

    await appointment.save();

    // Send cancellation notifications
    if (sendNotification && appointment.attendees.length > 0) {
      try {
        await calendarService.sendCancellationNotices({
          appointment,
          attendees: appointment.attendees,
          reason
        });
      } catch (notifyError) {
        logger.error('Failed to send cancellation notices:', notifyError);
      }
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to('appointments').emit('appointment:cancelled', appointment);

    res.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_ERROR',
        message: 'Failed to cancel appointment',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments/:id/preparation-notes
exports.addPreparationNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note, checklistItemId } = req.body;

    if (!note) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_NOTE',
          message: 'Note content is required'
        }
      });
    }

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    const preparationNote = {
      content: note,
      checklistItemId,
      createdBy: req.user?.id || 'system',
      createdAt: new Date()
    };

    if (!appointment.preparationNotes) appointment.preparationNotes = [];
    appointment.preparationNotes.push(preparationNote);

    // If note is related to checklist item, mark it as completed
    if (checklistItemId && appointment.preparationChecklist) {
      const checklistItem = appointment.preparationChecklist.find(
        item => item._id.toString() === checklistItemId
      );
      if (checklistItem) {
        checklistItem.completed = true;
        checklistItem.completedAt = new Date();
      }
    }

    await appointment.save();

    res.json({
      success: true,
      data: appointment,
      message: 'Preparation note added',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error adding preparation note:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'NOTE_ERROR',
        message: 'Failed to add preparation note',
        details: error.message
      }
    });
  }
};

// GET /api/v1/appointments/available-slots
exports.getAvailableSlots = async (req, res) => {
  try {
    const { date, duration = 60, startHour = 9, endHour = 17 } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATE',
          message: 'Date is required'
        }
      });
    }

    const requestedDate = new Date(date);
    const dayStart = new Date(requestedDate);
    dayStart.setHours(startHour, 0, 0, 0);
    const dayEnd = new Date(requestedDate);
    dayEnd.setHours(endHour, 0, 0, 0);

    // Get all appointments for the day
    const existingAppointments = await Appointment.find({
      date: {
        $gte: dayStart,
        $lte: dayEnd
      },
      status: { $in: ['Scheduled', 'Confirmed'] }
    }).sort('startTime');

    // Generate available slots
    const availableSlots = [];
    const slotDuration = parseInt(duration);
    let currentTime = new Date(dayStart);

    while (currentTime < dayEnd) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      
      // Check if slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(appt => {
        const apptStart = new Date(appt.startTime);
        const apptEnd = new Date(appt.endTime);
        
        // Add buffer time
        apptStart.setMinutes(apptStart.getMinutes() - (appt.bufferTime || 0));
        apptEnd.setMinutes(apptEnd.getMinutes() + (appt.bufferTime || 0));
        
        return (currentTime < apptEnd && slotEnd > apptStart);
      });

      if (!hasConflict && slotEnd <= dayEnd) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          available: true
        });
      }

      // Move to next slot
      currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
    }

    res.json({
      success: true,
      data: {
        date: requestedDate,
        availableSlots,
        totalSlots: availableSlots.length,
        businessHours: { start: startHour, end: endHour }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SLOTS_ERROR',
        message: 'Failed to get available slots',
        details: error.message
      }
    });
  }
};

// POST /api/v1/appointments/check-conflicts
exports.checkConflicts = async (req, res) => {
  try {
    const { date, start, end, excludeId, includeBufferTime = true } = req.body;

    if (!date || !start || !end) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Date, start time, and end time are required'
        }
      });
    }

    const startTime = new Date(`${date} ${start}`);
    const endTime = new Date(`${date} ${end}`);

    const conflicts = await Appointment.checkConflicts(
      startTime,
      endTime,
      excludeId,
      { includeBufferTime }
    );

    res.json({
      success: true,
      data: {
        hasConflicts: conflicts.length > 0,
        conflicts: conflicts.map(c => ({
          id: c._id,
          title: c.title,
          type: c.type,
          startTime: c.startTime,
          endTime: c.endTime,
          attendees: c.attendees
        }))
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error checking conflicts:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CONFLICT_CHECK_ERROR',
        message: 'Failed to check conflicts',
        details: error.message
      }
    });
  }
};

// GET /api/v1/appointments/:id/export-ics
exports.exportToICS = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findById(id)
      .populate('attendees', 'firstName lastName email')
      .populate('propertyId', 'address');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    }

    const icsContent = calendarService.generateICS(appointment);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="appointment-${id}.ics"`);
    res.send(icsContent);
  } catch (error) {
    logger.error('Error exporting to ICS:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXPORT_ERROR',
        message: 'Failed to export appointment',
        details: error.message
      }
    });
  }
};

// GET /api/v1/appointments/upcoming
exports.getUpcomingAppointments = async (req, res) => {
  try {
    const { days = 7, includeCompleted = false } = req.query;
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + parseInt(days));

    const statusFilter = includeCompleted === 'true' 
      ? { $in: ['Scheduled', 'Confirmed', 'Completed'] }
      : { $in: ['Scheduled', 'Confirmed'] };

    const appointments = await Appointment.find({
      date: {
        $gte: startDate,
        $lte: endDate
      },
      status: statusFilter
    })
    .sort('date startTime')
    .populate('attendees', 'firstName lastName')
    .populate('propertyId', 'address');

    // Group by date
    const groupedAppointments = appointments.reduce((acc, appt) => {
      const dateKey = appt.date.toISOString().split('T')[0];
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(appt);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        appointments,
        grouped: groupedAppointments,
        totalCount: appointments.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching upcoming appointments:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch upcoming appointments',
        details: error.message
      }
    });
  }
};

// GET /api/v1/appointments/stats
exports.getStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'quarter':
        startDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    const stats = await Appointment.aggregate([
      {
        $match: {
          date: { $gte: startDate }
        }
      },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byType: [
            { $group: { _id: '$type', count: { $sum: 1 } } }
          ],
          completion: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                completed: {
                  $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                },
                cancelled: {
                  $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                },
                noShow: {
                  $sum: { $cond: [{ $eq: ['$status', 'No Show'] }, 1, 0] }
                }
              }
            }
          ],
          averageDuration: [
            {
              $group: {
                _id: null,
                avgDuration: { $avg: '$duration' }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const completionStats = result.completion[0] || { total: 0, completed: 0, cancelled: 0, noShow: 0 };
    const completionRate = completionStats.total > 0 
      ? (completionStats.completed / completionStats.total * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        period,
        byStatus: result.byStatus,
        byType: result.byType,
        totals: completionStats,
        completionRate: parseFloat(completionRate),
        averageDuration: result.averageDuration[0]?.avgDuration || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching appointment stats:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_ERROR',
        message: 'Failed to fetch appointment statistics',
        details: error.message
      }
    });
  }
};

// Helper functions

function formatForCalendar(appointments) {
  return appointments.map(appt => ({
    id: appt._id,
    title: appt.title,
    start: appt.startTime,
    end: appt.endTime,
    color: getAppointmentColor(appt.type),
    extendedProps: {
      type: appt.type,
      status: appt.status,
      location: appt.location,
      attendees: appt.attendees,
      propertyId: appt.propertyId
    }
  }));
}

function formatForAgenda(appointments) {
  const grouped = {};
  
  appointments.forEach(appt => {
    const dateKey = appt.date.toISOString().split('T')[0];
    if (!grouped[dateKey]) {
      grouped[dateKey] = {
        date: dateKey,
        dayOfWeek: appt.date.toLocaleDateString('en-US', { weekday: 'long' }),
        appointments: []
      };
    }
    grouped[dateKey].appointments.push(appt);
  });

  return Object.values(grouped);
}

function getAppointmentColor(type) {
  const colors = {
    'Showing': '#2196F3',
    'Listing Presentation': '#4CAF50',
    'Buyer Consultation': '#FF9800',
    'Open House': '#9C27B0',
    'Closing': '#F44336',
    'Inspection': '#00BCD4',
    'Appraisal': '#FFEB3B',
    'Other': '#9E9E9E'
  };
  return colors[type] || colors.Other;
}

function getPreparationChecklist(type) {
  const checklists = {
    'Showing': [
      { task: 'Confirm appointment with client', priority: 'high' },
      { task: 'Prepare property information sheets', priority: 'high' },
      { task: 'Check property access/lockbox code', priority: 'high' },
      { task: 'Plan route and check traffic', priority: 'medium' },
      { task: 'Prepare comparison properties', priority: 'medium' },
      { task: 'Charge devices and bring chargers', priority: 'low' }
    ],
    'Listing Presentation': [
      { task: 'Prepare CMA (Comparative Market Analysis)', priority: 'high' },
      { task: 'Print listing agreement and disclosures', priority: 'high' },
      { task: 'Prepare marketing plan presentation', priority: 'high' },
      { task: 'Bring measuring tape and camera', priority: 'medium' },
      { task: 'Review recent neighborhood sales', priority: 'medium' },
      { task: 'Prepare commission discussion points', priority: 'low' }
    ],
    'Buyer Consultation': [
      { task: 'Prepare buyer representation agreement', priority: 'high' },
      { task: 'Set up MLS search criteria', priority: 'high' },
      { task: 'Prepare financing information', priority: 'high' },
      { task: 'Print sample properties matching criteria', priority: 'medium' },
      { task: 'Prepare neighborhood guides', priority: 'medium' },
      { task: 'Schedule pre-approval appointment if needed', priority: 'low' }
    ],
    'Closing': [
      { task: 'Confirm closing time and location', priority: 'high' },
      { task: 'Review closing documents', priority: 'high' },
      { task: 'Remind client to bring ID and funds', priority: 'high' },
      { task: 'Prepare keys and garage door openers', priority: 'high' },
      { task: 'Final walkthrough scheduled', priority: 'medium' },
      { task: 'Prepare closing gift', priority: 'low' }
    ],
    'Inspection': [
      { task: 'Confirm inspector and time', priority: 'high' },
      { task: 'Notify listing agent', priority: 'high' },
      { task: 'Prepare inspection checklist', priority: 'medium' },
      { task: 'Review previous disclosures', priority: 'medium' },
      { task: 'Bring flashlight and notepad', priority: 'low' }
    ],
    'Open House': [
      { task: 'Place directional signs', priority: 'high' },
      { task: 'Prepare sign-in sheets', priority: 'high' },
      { task: 'Print property flyers', priority: 'high' },
      { task: 'Prepare refreshments', priority: 'medium' },
      { task: 'Stage property/turn on lights', priority: 'medium' },
      { task: 'Promote on social media', priority: 'medium' }
    ]
  };
  
  return checklists[type] || [
    { task: 'Review appointment details', priority: 'high' },
    { task: 'Prepare necessary documents', priority: 'medium' },
    { task: 'Confirm with all parties', priority: 'high' }
  ];
}

function calculateReminderTime(appointmentDate, reminderType) {
  const reminderDate = new Date(appointmentDate);
  
  switch (reminderType) {
    case '1_week':
      reminderDate.setDate(reminderDate.getDate() - 7);
      break;
    case '1_day':
      reminderDate.setDate(reminderDate.getDate() - 1);
      break;
    case '1_hour':
      reminderDate.setHours(reminderDate.getHours() - 1);
      break;
    case '30_minutes':
      reminderDate.setMinutes(reminderDate.getMinutes() - 30);
      break;
    default:
      reminderDate.setHours(reminderDate.getHours() - 1);
  }
  
  return reminderDate;
}

function generateRecurringAppointments(baseAppointment, pattern) {
  const appointments = [];
  const {
    frequency, // daily, weekly, monthly
    interval = 1,
    count,
    endDate,
    daysOfWeek // for weekly recurrence
  } = pattern;

  const startDate = new Date(baseAppointment.date);
  let currentDate = new Date(startDate);
  let occurrences = 0;
  const maxOccurrences = count || 52; // Default to 1 year of weekly
  const finalDate = endDate ? new Date(endDate) : null;

  while (occurrences < maxOccurrences) {
    if (finalDate && currentDate > finalDate) break;

    const appointmentDate = new Date(currentDate);
    const appointment = {
      ...baseAppointment,
      date: appointmentDate,
      startTime: new Date(appointmentDate),
      endTime: new Date(appointmentDate.getTime() + baseAppointment.duration * 60000),
      recurringGroupId: `${baseAppointment.title}_${Date.now()}`,
      recurringIndex: occurrences
    };

    appointments.push(appointment);
    occurrences++;

    // Calculate next occurrence
    switch (frequency) {
      case 'daily':
        currentDate.setDate(currentDate.getDate() + interval);
        break;
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + (7 * interval));
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + interval);
        break;
    }
  }

  return appointments;
}

async function scheduleReminders(appointment) {
  // In production, this would integrate with a job scheduler like Bull or Agenda
  logger.info('Scheduling reminders for appointment:', {
    appointmentId: appointment._id,
    reminders: appointment.reminders.map(r => ({
      type: r.type,
      scheduledFor: r.scheduledFor
    }))
  });
}