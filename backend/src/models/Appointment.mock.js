// Mock Appointment model for development and testing
const logger = require('../utils/logger');

// Comprehensive mock appointments data
let mockAppointments = [
  {
    id: '1',
    title: 'Property Showing - 123 Main St',
    type: 'Showing',
    status: 'Confirmed',
    priority: 'High',
    startTime: new Date('2025-07-18T14:00:00'),
    endTime: new Date('2025-07-18T15:00:00'),
    duration: 60,
    location: '123 Main Street, San Diego, CA 92101',
    locationDetails: {
      propertyId: '1',
      propertyAddress: '123 Main Street',
      propertyMLS: 'SD2025001',
      propertyPrice: 850000,
      lockboxCode: '1234',
      specialInstructions: 'Use side gate if front door locked'
    },
    clientId: '1',
    clientName: 'Michael Thompson',
    clientPhone: '(619) 555-1234',
    clientEmail: 'michael.thompson@email.com',
    clientType: 'Buyer',
    agentId: '1',
    agentName: 'Jayden Metz',
    notes: 'Client very interested in this property. Second showing - bringing spouse.',
    reminder: {
      client: true,
      clientReminderTime: 120, // minutes before
      agent: true,
      agentReminderTime: 60
    },
    createdAt: new Date('2025-07-10'),
    updatedAt: new Date(),
    createdBy: 'Jayden Metz'
  },
  {
    id: '2',
    title: 'Listing Presentation - Martinez Residence',
    type: 'Listing Appointment',
    status: 'Confirmed',
    priority: 'High',
    startTime: new Date('2025-07-19T10:00:00'),
    endTime: new Date('2025-07-19T11:30:00'),
    duration: 90,
    location: '456 Ocean View Drive, La Jolla, CA 92037',
    locationDetails: {
      propertyAddress: '456 Ocean View Drive',
      specialInstructions: 'Ring doorbell twice'
    },
    clientId: '2',
    clientName: 'Elizabeth Martinez',
    clientPhone: '(858) 555-2345',
    clientEmail: 'liz.martinez@email.com',
    clientType: 'Seller',
    agentId: '1',
    agentName: 'Jayden Metz',
    notes: 'Bring CMA report and listing agreement. Client wants to downsize.',
    preparationChecklist: [
      { item: 'Prepare CMA', completed: true },
      { item: 'Print listing agreement', completed: true },
      { item: 'Bring measuring tape', completed: false },
      { item: 'Professional photos samples', completed: true }
    ],
    reminder: {
      client: true,
      clientReminderTime: 1440, // 24 hours
      agent: true,
      agentReminderTime: 120
    },
    createdAt: new Date('2025-07-08'),
    updatedAt: new Date(),
    createdBy: 'Jayden Metz'
  },
  {
    id: '3',
    title: 'Open House - 789 Beach Drive',
    type: 'Open House',
    status: 'Scheduled',
    priority: 'Medium',
    startTime: new Date('2025-07-20T13:00:00'),
    endTime: new Date('2025-07-20T16:00:00'),
    duration: 180,
    location: '789 Beach Drive, Carlsbad, CA 92008',
    locationDetails: {
      propertyId: '3',
      propertyAddress: '789 Beach Drive',
      propertyMLS: 'CB2025003',
      propertyPrice: 2100000,
      parkingInstructions: 'Street parking available, driveway for agents only'
    },
    clientId: null,
    clientName: null,
    clientPhone: null,
    clientEmail: null,
    clientType: null,
    agentId: '1',
    agentName: 'Jayden Metz',
    notes: 'Expecting 20-30 visitors. Refreshments ordered. Sign-in sheets ready.',
    openHouseDetails: {
      expectedVisitors: 25,
      refreshments: true,
      signage: ['Directional signs', 'A-frame at corner', 'Yard sign'],
      marketing: ['MLS', 'Zillow', 'Facebook', 'Instagram'],
      coAgent: 'Sarah Johnson'
    },
    reminder: {
      agent: true,
      agentReminderTime: 1440 // 24 hours
    },
    createdAt: new Date('2025-07-05'),
    updatedAt: new Date(),
    createdBy: 'Jayden Metz'
  },
  {
    id: '4',
    title: 'Home Inspection - 123 Main St',
    type: 'Inspection',
    status: 'Tentative',
    priority: 'High',
    startTime: new Date('2025-07-22T09:00:00'),
    endTime: new Date('2025-07-22T12:00:00'),
    duration: 180,
    location: '123 Main Street, San Diego, CA 92101',
    locationDetails: {
      propertyId: '1',
      propertyAddress: '123 Main Street',
      propertyMLS: 'SD2025001'
    },
    clientId: '1',
    clientName: 'Michael Thompson',
    clientPhone: '(619) 555-1234',
    clientEmail: 'michael.thompson@email.com',
    clientType: 'Buyer',
    agentId: '1',
    agentName: 'Jayden Metz',
    notes: 'Pending offer acceptance. Inspector: ABC Home Inspections',
    inspectionDetails: {
      inspector: 'John Smith - ABC Home Inspections',
      inspectorPhone: '(619) 555-9999',
      inspectorEmail: 'john@abcinspections.com',
      type: 'Full Home Inspection',
      additionalServices: ['Termite', 'Roof', 'Pool']
    },
    reminder: {
      client: true,
      clientReminderTime: 1440,
      agent: true,
      agentReminderTime: 120
    },
    createdAt: new Date('2025-07-12'),
    updatedAt: new Date(),
    createdBy: 'Jayden Metz'
  },
  {
    id: '5',
    title: 'Closing - Thompson Purchase',
    type: 'Closing',
    status: 'Scheduled',
    priority: 'High',
    startTime: new Date('2025-08-15T10:00:00'),
    endTime: new Date('2025-08-15T11:00:00'),
    duration: 60,
    location: 'First American Title, 123 Title Way, San Diego, CA 92101',
    locationDetails: {
      company: 'First American Title',
      address: '123 Title Way, San Diego, CA 92101',
      room: 'Conference Room A',
      parkingInstructions: 'Free parking in building garage'
    },
    clientId: '1',
    clientName: 'Michael Thompson',
    clientPhone: '(619) 555-1234',
    clientEmail: 'michael.thompson@email.com',
    clientType: 'Buyer',
    agentId: '1',
    agentName: 'Jayden Metz',
    notes: 'Final walkthrough scheduled for 8am same day. Bring cashier\'s check.',
    closingDetails: {
      escrowNumber: 'FA-2025-12345',
      escrowOfficer: 'Jane Williams',
      escrowPhone: '(619) 555-8888',
      propertyAddress: '123 Main Street, San Diego, CA 92101',
      salePrice: 850000,
      buyerFunds: 175000,
      lender: 'Wells Fargo'
    },
    reminder: {
      client: true,
      clientReminderTime: 1440,
      agent: true,
      agentReminderTime: 1440
    },
    createdAt: new Date('2025-07-01'),
    updatedAt: new Date(),
    createdBy: 'Jayden Metz'
  }
];

class AppointmentMock {
  // Alias for compatibility with Mongoose-style queries
  static async find(filters = {}) {
    return this.findAll(filters);
  }
  
  static async findAll(filters = {}) {
    try {
      let filtered = [...mockAppointments];
      
      // Apply type filter
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter(a => a.type === filters.type);
      }
      
      // Apply status filter
      if (filters.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      
      // Apply date range filter
      if (filters.startDate || filters.endDate) {
        const startDate = filters.startDate ? new Date(filters.startDate) : new Date('1900-01-01');
        const endDate = filters.endDate ? new Date(filters.endDate) : new Date('2100-12-31');
        filtered = filtered.filter(a => 
          a.startTime >= startDate && a.startTime <= endDate
        );
      }
      
      // Apply client filter
      if (filters.clientId) {
        filtered = filtered.filter(a => a.clientId === filters.clientId);
      }
      
      // Apply property filter
      if (filters.propertyId) {
        filtered = filtered.filter(a => 
          a.locationDetails?.propertyId === filters.propertyId
        );
      }
      
      // Apply search
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filtered = filtered.filter(a => 
          a.title.toLowerCase().includes(searchTerm) ||
          a.location.toLowerCase().includes(searchTerm) ||
          (a.clientName && a.clientName.toLowerCase().includes(searchTerm)) ||
          a.notes.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      const sortField = filters.sort || 'startTime';
      const sortOrder = filters.order === 'desc' ? -1 : 1;
      
      filtered.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -sortOrder;
        if (a[sortField] > b[sortField]) return sortOrder;
        return 0;
      });
      
      // Apply pagination
      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const offset = (page - 1) * limit;
      const paginated = filtered.slice(offset, offset + limit);
      
      // Return minimal data for list view
      const minimalAppointments = paginated.map(appointment => ({
        id: appointment.id,
        title: appointment.title,
        type: appointment.type,
        status: appointment.status,
        priority: appointment.priority,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        location: appointment.location,
        clientId: appointment.clientId,
        clientName: appointment.clientName,
        propertyId: appointment.propertyId,
        propertyAddress: appointment.propertyAddress,
        reminder: appointment.reminder,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt
      }));
      
      return {
        appointments: minimalAppointments,
        pagination: {
          total: filtered.length,
          page,
          pages: Math.ceil(filtered.length / limit),
          limit
        }
      };
    } catch (error) {
      logger.error('Mock Appointment.findAll error:', error);
      throw error;
    }
  }

  static async findById(id) {
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) return null;
    
    // Return comprehensive appointment data for detail view
    return {
      ...appointment,
      
      // Related appointments
      relatedAppointments: appointment.clientId ? 
        mockAppointments
          .filter(a => a.clientId === appointment.clientId && a.id !== id)
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            title: a.title,
            type: a.type,
            startTime: a.startTime,
            status: a.status
          })) : [],
      
      // History (for rescheduled appointments)
      history: [
        {
          id: 1,
          date: new Date('2025-07-10'),
          action: 'Created',
          user: 'Jayden Metz',
          details: 'Appointment created'
        },
        ...(appointment.status === 'Rescheduled' ? [{
          id: 2,
          date: new Date('2025-07-12'),
          action: 'Rescheduled',
          user: 'Jayden Metz',
          details: 'Moved from July 17 to July 18 at client request'
        }] : []),
        {
          id: 3,
          date: new Date('2025-07-15'),
          action: 'Reminder Sent',
          user: 'System',
          details: 'Email reminder sent to client'
        }
      ],
      
      // Documents
      documents: appointment.type === 'Listing Appointment' ? [
        {
          id: 1,
          name: 'CMA Report',
          type: 'report',
          size: '2.4 MB',
          uploadedDate: new Date('2025-07-18').toISOString()
        },
        {
          id: 2,
          name: 'Listing Agreement',
          type: 'contract',
          size: '156 KB',
          uploadedDate: new Date('2025-07-18').toISOString()
        },
        {
          id: 3,
          name: 'Marketing Plan',
          type: 'presentation',
          size: '4.2 MB',
          uploadedDate: new Date('2025-07-17').toISOString()
        }
      ] : appointment.type === 'Closing' ? [
        {
          id: 1,
          name: 'HUD Statement',
          type: 'settlement',
          size: '324 KB',
          uploadedDate: new Date('2025-08-01').toISOString()
        },
        {
          id: 2,
          name: 'Closing Checklist',
          type: 'checklist',
          size: '89 KB',
          uploadedDate: new Date('2025-07-20').toISOString()
        }
      ] : [],
      
      // Attendees
      attendees: [
        {
          id: 1,
          name: appointment.agentName,
          role: 'Agent',
          email: 'jayden@luxuryrealty.com',
          phone: '(858) 555-9999',
          status: 'Confirmed'
        },
        ...(appointment.clientName ? [{
          id: 2,
          name: appointment.clientName,
          role: 'Client',
          email: appointment.clientEmail,
          phone: appointment.clientPhone,
          status: 'Confirmed'
        }] : []),
        ...(appointment.openHouseDetails?.coAgent ? [{
          id: 3,
          name: appointment.openHouseDetails.coAgent,
          role: 'Co-Agent',
          email: 'sarah@luxuryrealty.com',
          phone: '(858) 555-7777',
          status: 'Confirmed'
        }] : []),
        ...(appointment.inspectionDetails?.inspector ? [{
          id: 4,
          name: appointment.inspectionDetails.inspector,
          role: 'Inspector',
          email: appointment.inspectionDetails.inspectorEmail,
          phone: appointment.inspectionDetails.inspectorPhone,
          status: 'Confirmed'
        }] : [])
      ],
      
      // Tasks/Checklist
      tasks: appointment.type === 'Showing' ? [
        { id: 1, task: 'Confirm appointment with client', completed: true },
        { id: 2, task: 'Get lockbox code', completed: true },
        { id: 3, task: 'Review property details', completed: true },
        { id: 4, task: 'Prepare comp analysis', completed: false },
        { id: 5, task: 'Send reminder to client', completed: true }
      ] : appointment.type === 'Open House' ? [
        { id: 1, task: 'Order refreshments', completed: true },
        { id: 2, task: 'Print sign-in sheets', completed: false },
        { id: 3, task: 'Set up directional signs', completed: false },
        { id: 4, task: 'Post on social media', completed: true },
        { id: 5, task: 'Prepare property info packets', completed: false },
        { id: 6, task: 'Coordinate with co-agent', completed: true }
      ] : appointment.preparationChecklist || [],
      
      // Communication log
      communications: [
        {
          id: 1,
          date: new Date('2025-07-10'),
          type: 'Email',
          direction: 'Outbound',
          subject: 'Appointment Confirmation',
          summary: 'Sent appointment details and property information'
        },
        {
          id: 2,
          date: new Date('2025-07-15'),
          type: 'Text',
          direction: 'Inbound',
          subject: 'Confirmation',
          summary: 'Client confirmed attendance'
        },
        ...(appointment.reminder.client ? [{
          id: 3,
          date: new Date(appointment.startTime.getTime() - appointment.reminder.clientReminderTime * 60000),
          type: 'Email',
          direction: 'Outbound',
          subject: 'Appointment Reminder',
          summary: 'Automated reminder sent'
        }] : [])
      ],
      
      // Weather forecast (for future appointments)
      weather: appointment.startTime > new Date() ? {
        date: appointment.startTime,
        condition: 'Partly Cloudy',
        temperature: { high: 75, low: 62 },
        precipitation: '10%',
        wind: '8 mph SW'
      } : null,
      
      // Driving directions
      drivingInfo: {
        fromOffice: {
          distance: '12.5 miles',
          duration: '22 minutes',
          route: 'Take I-5 N to Exit 28, turn right on Main St'
        },
        parking: appointment.locationDetails?.parkingInstructions || 'Street parking available',
        toll: false
      },
      
      // Follow-up actions
      followUpActions: [
        {
          id: 1,
          action: 'Send thank you note',
          dueDate: new Date(appointment.startTime.getTime() + 24 * 60 * 60 * 1000),
          assignedTo: appointment.agentName,
          status: 'Pending'
        },
        {
          id: 2,
          action: 'Add to CRM activity',
          dueDate: appointment.endTime,
          assignedTo: appointment.agentName,
          status: 'Pending'
        },
        ...(appointment.type === 'Showing' ? [{
          id: 3,
          action: 'Get client feedback',
          dueDate: new Date(appointment.endTime.getTime() + 2 * 60 * 60 * 1000),
          assignedTo: appointment.agentName,
          status: 'Pending'
        }] : [])
      ]
    };
  }

  static async create(data) {
    try {
      const id = String(Math.max(...mockAppointments.map(a => parseInt(a.id) || 0)) + 1);
      
      const newAppointment = {
        id,
        title: data.title,
        type: data.type || 'Meeting',
        status: data.status || 'Scheduled',
        priority: data.priority || 'Medium',
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        duration: Math.round((new Date(data.endTime) - new Date(data.startTime)) / 60000),
        location: data.location || '',
        locationDetails: data.locationDetails || {},
        clientId: data.clientId || null,
        clientName: data.clientName || null,
        clientPhone: data.clientPhone || null,
        clientEmail: data.clientEmail || null,
        clientType: data.clientType || null,
        agentId: data.agentId || '1',
        agentName: data.agentName || 'Jayden Metz',
        notes: data.notes || '',
        reminder: data.reminder || {
          client: true,
          clientReminderTime: 120,
          agent: true,
          agentReminderTime: 60
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: data.createdBy || 'Jayden Metz'
      };
      
      // Add type-specific details
      if (data.preparationChecklist) {
        newAppointment.preparationChecklist = data.preparationChecklist;
      }
      if (data.openHouseDetails) {
        newAppointment.openHouseDetails = data.openHouseDetails;
      }
      if (data.inspectionDetails) {
        newAppointment.inspectionDetails = data.inspectionDetails;
      }
      if (data.closingDetails) {
        newAppointment.closingDetails = data.closingDetails;
      }
      
      mockAppointments.push(newAppointment);
      
      logger.info('Mock appointment created:', {
        id: newAppointment.id,
        title: newAppointment.title,
        type: newAppointment.type,
        startTime: newAppointment.startTime
      });
      
      return newAppointment;
    } catch (error) {
      logger.error('Mock Appointment.create error:', error);
      throw error;
    }
  }

  static async update(id, data) {
    try {
      const index = mockAppointments.findIndex(a => a.id === id);
      if (index === -1) {
        return null;
      }
      
      const currentAppointment = mockAppointments[index];
      
      // Track if time changed for history
      const timeChanged = data.startTime && 
        new Date(data.startTime).getTime() !== currentAppointment.startTime.getTime();
      
      // Update the appointment
      mockAppointments[index] = {
        ...currentAppointment,
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : currentAppointment.startTime,
        endTime: data.endTime ? new Date(data.endTime) : currentAppointment.endTime,
        updatedAt: new Date()
      };
      
      // Recalculate duration if times changed
      if (data.startTime || data.endTime) {
        const start = mockAppointments[index].startTime;
        const end = mockAppointments[index].endTime;
        mockAppointments[index].duration = Math.round((end - start) / 60000);
      }
      
      logger.info('Mock appointment updated:', {
        id,
        changes: Object.keys(data),
        timeChanged
      });
      
      return mockAppointments[index];
    } catch (error) {
      logger.error('Mock Appointment.update error:', error);
      throw error;
    }
  }

  static async updateStatus(id, status, reason) {
    try {
      const appointment = await this.update(id, { status });
      if (appointment && reason) {
        logger.info('Appointment status updated with reason:', { id, status, reason });
      }
      return appointment;
    } catch (error) {
      logger.error('Mock Appointment.updateStatus error:', error);
      throw error;
    }
  }

  static async reschedule(id, newStartTime, newEndTime, reason) {
    try {
      const appointment = await this.update(id, {
        startTime: newStartTime,
        endTime: newEndTime,
        status: 'Rescheduled'
      });
      
      if (appointment) {
        logger.info('Appointment rescheduled:', {
          id,
          oldTime: appointment.startTime,
          newTime: newStartTime,
          reason
        });
      }
      
      return appointment;
    } catch (error) {
      logger.error('Mock Appointment.reschedule error:', error);
      throw error;
    }
  }

  static async cancel(id, reason) {
    try {
      const appointment = await this.updateStatus(id, 'Cancelled', reason);
      return appointment;
    } catch (error) {
      logger.error('Mock Appointment.cancel error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const index = mockAppointments.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error('Appointment not found');
      }
      
      const deletedAppointment = mockAppointments[index];
      mockAppointments.splice(index, 1);
      
      logger.info('Mock appointment deleted:', {
        id,
        title: deletedAppointment.title
      });
      
      return deletedAppointment;
    } catch (error) {
      logger.error('Mock Appointment.delete error:', error);
      throw error;
    }
  }

  static async getUpcoming(days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return mockAppointments
      .filter(a => 
        a.startTime >= now && 
        a.startTime <= future && 
        a.status !== 'Cancelled'
      )
      .sort((a, b) => a.startTime - b.startTime);
  }

  static async getByClient(clientId) {
    return mockAppointments
      .filter(a => a.clientId === clientId)
      .sort((a, b) => b.startTime - a.startTime);
  }

  static async getByProperty(propertyId) {
    return mockAppointments
      .filter(a => a.locationDetails?.propertyId === propertyId)
      .sort((a, b) => b.startTime - a.startTime);
  }

  static async checkConflicts(startTime, endTime, excludeId = null) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return mockAppointments.filter(a => {
      if (excludeId && a.id === excludeId) return false;
      if (a.status === 'Cancelled') return false;
      
      // Check for time overlap
      return (
        (a.startTime >= start && a.startTime < end) ||
        (a.endTime > start && a.endTime <= end) ||
        (a.startTime <= start && a.endTime >= end)
      );
    });
  }

  static async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const thisMonth = mockAppointments.filter(a => 
      a.startTime >= startOfMonth && a.startTime <= endOfMonth
    );
    
    return {
      total: mockAppointments.length,
      upcoming: mockAppointments.filter(a => a.startTime > now && a.status !== 'Cancelled').length,
      today: mockAppointments.filter(a => {
        const appointmentDate = new Date(a.startTime);
        return appointmentDate.toDateString() === now.toDateString() && a.status !== 'Cancelled';
      }).length,
      thisWeek: mockAppointments.filter(a => {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return a.startTime >= weekStart && a.startTime < weekEnd;
      }).length,
      thisMonth: thisMonth.length,
      byType: {
        showing: thisMonth.filter(a => a.type === 'Showing').length,
        listing: thisMonth.filter(a => a.type === 'Listing Appointment').length,
        openHouse: thisMonth.filter(a => a.type === 'Open House').length,
        inspection: thisMonth.filter(a => a.type === 'Inspection').length,
        closing: thisMonth.filter(a => a.type === 'Closing').length,
        other: thisMonth.filter(a => !['Showing', 'Listing Appointment', 'Open House', 'Inspection', 'Closing'].includes(a.type)).length
      },
      byStatus: {
        scheduled: thisMonth.filter(a => a.status === 'Scheduled').length,
        confirmed: thisMonth.filter(a => a.status === 'Confirmed').length,
        tentative: thisMonth.filter(a => a.status === 'Tentative').length,
        cancelled: thisMonth.filter(a => a.status === 'Cancelled').length,
        completed: thisMonth.filter(a => a.status === 'Completed').length
      }
    };
  }
}

module.exports = AppointmentMock;