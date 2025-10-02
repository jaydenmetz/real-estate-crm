const { pool } = require('../config/database');
const appointmentsController = require('./appointments.controller');

// Mock database and logger
jest.mock('../config/database');
jest.mock('../utils/logger');

describe('AppointmentsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: {
        id: 'user-123',
        teamId: 'team-456',
        team_id: 'team-456',
        email: 'agent@example.com'
      },
      body: {},
      query: {},
      params: {}
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis()
    };
  });

  describe('getAppointments (GET /appointments)', () => {
    // TEST 1: Get all appointments with pagination
    it('should return paginated appointments', async () => {
      const mockAppointments = [
        {
          id: 'appt-1',
          title: 'Property Showing',
          appointment_date: '2025-10-15',
          start_time: '10:00:00',
          status: 'Scheduled'
        },
        {
          id: 'appt-2',
          title: 'Client Meeting',
          appointment_date: '2025-10-16',
          start_time: '14:00:00',
          status: 'Scheduled'
        }
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '25' }] }) // Count
        .mockResolvedValueOnce({ rows: mockAppointments }); // Data

      mockReq.query = { page: 1, limit: 20 };

      await appointmentsController.getAppointments(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          appointments: mockAppointments,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalCount: 25,
            limit: 20
          }
        },
        timestamp: expect.any(String)
      });
    });

    // TEST 2: Filter by date range
    it('should filter appointments by date range', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = {
        startDate: '2025-10-01',
        endDate: '2025-10-31'
      };

      await appointmentsController.getAppointments(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('appointment_date >= $'),
        expect.arrayContaining(['team-456', '2025-10-01', '2025-10-31'])
      );
    });

    // TEST 3: Filter by status
    it('should filter appointments by status', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '8' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { status: 'Completed' };

      await appointmentsController.getAppointments(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $'),
        expect.arrayContaining(['team-456', 'Completed'])
      );
    });

    // TEST 4: Exclude soft-deleted appointments
    it('should exclude soft-deleted appointments', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [] });

      await appointmentsController.getAppointments(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array)
      );
    });

    // TEST 5: Handle database errors
    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('Database error'));

      await appointmentsController.getAppointments(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch appointments',
          details: 'Database error'
        }
      });
    });
  });

  describe('getAppointment (GET /appointments/:id)', () => {
    // TEST 6: Get appointment by ID
    it('should return appointment by ID', async () => {
      const mockAppointment = {
        id: 'appt-1',
        title: 'Property Showing',
        appointment_date: '2025-10-15',
        start_time: '10:00:00',
        status: 'Scheduled'
      };

      pool.query.mockResolvedValue({ rows: [mockAppointment] });

      mockReq.params = { id: 'appt-1' };

      await appointmentsController.getAppointment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockAppointment,
        timestamp: expect.any(String)
      });
    });

    // TEST 7: Return 404 for non-existent appointment
    it('should return 404 when appointment not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };

      await appointmentsController.getAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Appointment not found'
        }
      });
    });
  });

  describe('createAppointment (POST /appointments)', () => {
    // TEST 8: Create new appointment successfully
    it('should create new appointment with valid data', async () => {
      const newAppointment = {
        title: 'Property Showing',
        appointmentDate: '2025-10-15',
        startTime: '10:00:00',
        endTime: '11:00:00',
        location: '123 Main St',
        appointmentType: 'Property Showing',
        description: 'Show property to client',
        clientId: 'client-1'
      };

      const mockCreatedAppointment = {
        id: 'appt-1',
        title: 'Property Showing',
        appointment_date: '2025-10-15',
        start_time: '10:00:00',
        status: 'Scheduled'
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedAppointment] });

      mockReq.body = newAppointment;

      await appointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedAppointment,
        message: 'Appointment created successfully',
        timestamp: expect.any(String)
      });
    });

    // TEST 9: Reject appointment without required fields
    it('should reject appointment without required fields', async () => {
      mockReq.body = {
        // Missing title, appointmentDate, startTime
        location: '123 Main St'
      };

      await appointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Title, date, and start time are required'
        }
      });
    });

    // TEST 10: Default status to "Scheduled"
    it('should default status to Scheduled if not provided', async () => {
      const mockCreatedAppointment = {
        id: 'appt-1',
        status: 'Scheduled'
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedAppointment] });

      mockReq.body = {
        title: 'Property Showing',
        appointmentDate: '2025-10-15',
        startTime: '10:00:00'
        // status omitted - should default to 'Scheduled'
      };

      await appointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // TEST 11: Default appointment type to "Property Showing"
    it('should default appointment type to Property Showing if not provided', async () => {
      const mockCreatedAppointment = {
        id: 'appt-1',
        appointment_type: 'Property Showing'
      };

      pool.query.mockResolvedValue({ rows: [mockCreatedAppointment] });

      mockReq.body = {
        title: 'Show property',
        appointmentDate: '2025-10-15',
        startTime: '10:00:00'
        // appointmentType omitted
      };

      await appointmentsController.createAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateAppointment (PUT /appointments/:id)', () => {
    // TEST 12: Update appointment successfully
    it('should update appointment with valid data', async () => {
      const updatedAppointment = {
        id: 'appt-1',
        title: 'Updated Showing',
        status: 'Confirmed'
      };

      pool.query.mockResolvedValue({ rows: [updatedAppointment] });

      mockReq.params = { id: 'appt-1' };
      mockReq.body = {
        title: 'Updated Showing',
        status: 'Confirmed'
      };

      await appointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedAppointment,
        timestamp: expect.any(String)
      });
    });

    // TEST 13: Return 404 for non-existent appointment
    it('should return 404 when appointment not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { title: 'Updated' };

      await appointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    // TEST 14: Handle version conflict (optimistic locking)
    it('should handle version conflict with optimistic locking', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [] }) // Update fails (version mismatch)
        .mockResolvedValueOnce({ rows: [{ version: 5 }] }); // Check query

      mockReq.params = { id: 'appt-1' };
      mockReq.body = {
        title: 'Updated',
        version: 3 // Outdated version
      };

      await appointmentsController.updateAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'VERSION_CONFLICT',
          currentVersion: 5,
          attemptedVersion: 3
        })
      });
    });
  });

  describe('archiveAppointment (PUT /appointments/:id/archive)', () => {
    // TEST 15: Archive appointment successfully
    it('should archive appointment successfully', async () => {
      const archivedAppointment = {
        id: 'appt-1',
        title: 'Property Showing',
        deleted_at: new Date(),
        status: 'cancelled'
      };

      pool.query.mockResolvedValue({ rows: [archivedAppointment] });

      mockReq.params = { id: 'appt-1' };

      await appointmentsController.archiveAppointment(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at = CURRENT_TIMESTAMP'),
        ['appt-1']
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: archivedAppointment,
        message: 'Appointment archived successfully',
        timestamp: expect.any(String)
      });
    });

    // TEST 16: Return 404 when archiving non-existent appointment
    it('should return 404 when appointment not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };

      await appointmentsController.archiveAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteAppointment (DELETE /appointments/:id)', () => {
    // TEST 17: Delete archived appointment successfully
    it('should delete archived appointment successfully', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ deleted_at: new Date() }] }) // Check query
        .mockResolvedValueOnce({ rows: [] }); // Delete

      mockReq.params = { id: 'appt-1' };

      await appointmentsController.deleteAppointment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Appointment deleted successfully',
        timestamp: expect.any(String)
      });
    });

    // TEST 18: Prevent deletion of non-archived appointment
    it('should prevent deletion of non-archived appointment', async () => {
      pool.query.mockResolvedValueOnce({ rows: [{ deleted_at: null }] }); // Not archived

      mockReq.params = { id: 'appt-1' };

      await appointmentsController.deleteAppointment(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: 'Appointment must be archived before deletion'
        }
      });
    });
  });

  describe('cancelAppointment (POST /appointments/:id/cancel)', () => {
    // TEST 19: Cancel appointment successfully
    it('should cancel appointment successfully', async () => {
      const cancelledAppointment = {
        id: 'appt-1',
        title: 'Property Showing',
        status: 'cancelled'
      };

      pool.query.mockResolvedValue({ rows: [cancelledAppointment] });

      mockReq.params = { id: 'appt-1' };

      await appointmentsController.cancelAppointment(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: cancelledAppointment,
        message: 'Appointment cancelled successfully',
        timestamp: expect.any(String)
      });
    });
  });

  describe('markComplete (POST /appointments/:id/complete)', () => {
    // TEST 20: Mark appointment as complete successfully
    it('should mark appointment as complete successfully', async () => {
      const completedAppointment = {
        id: 'appt-1',
        title: 'Property Showing',
        status: 'Completed'
      };

      pool.query.mockResolvedValue({ rows: [completedAppointment] });

      mockReq.params = { id: 'appt-1' };

      await appointmentsController.markComplete(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: completedAppointment,
        message: 'Appointment marked as completed',
        timestamp: expect.any(String)
      });
    });
  });

  describe('batchDeleteAppointments (POST /appointments/batch-delete)', () => {
    let mockClient;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn()
      };

      pool.connect = jest.fn().mockResolvedValue(mockClient);
    });

    // TEST 21: Batch delete archived appointments successfully
    it('should batch delete archived appointments successfully', async () => {
      const mockIds = ['appt-1', 'appt-2', 'appt-3'];

      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ // Exist check - all archived
          rows: [
            { id: 'appt-1', deleted_at: new Date() },
            { id: 'appt-2', deleted_at: new Date() },
            { id: 'appt-3', deleted_at: new Date() }
          ]
        })
        .mockResolvedValueOnce({ // Delete
          rowCount: 3,
          rows: [
            { id: 'appt-1' },
            { id: 'appt-2' },
            { id: 'appt-3' }
          ]
        })
        .mockResolvedValueOnce({ }); // COMMIT

      mockReq.body = { ids: mockIds };

      await appointmentsController.batchDeleteAppointments(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: 'Successfully deleted 3 appointments',
        deletedCount: 3,
        deletedIds: mockIds
      });
    });

    // TEST 22: Prevent batch deletion of non-archived appointments
    it('should prevent batch deletion of non-archived appointments', async () => {
      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ // Exist check - some not archived
          rows: [
            { id: 'appt-1', deleted_at: new Date() },
            { id: 'appt-2', deleted_at: null }, // Not archived!
            { id: 'appt-3', deleted_at: new Date() }
          ]
        })
        .mockResolvedValueOnce({ }); // ROLLBACK

      mockReq.body = { ids: ['appt-1', 'appt-2', 'appt-3'] };

      await appointmentsController.batchDeleteAppointments(mockReq, mockRes);

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_ARCHIVED'
        })
      });
    });
  });
});
