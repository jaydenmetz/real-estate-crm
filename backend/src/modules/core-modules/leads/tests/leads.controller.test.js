const { pool } = require('../config/infrastructure/database');
const leadsController = require('./leads.controller');

// Mock database and logger
jest.mock('../../../config/infrastructure/database');
jest.mock('../utils/logger');

describe('LeadsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: {
        id: 'user-123',
        teamId: 'team-456',
      },
      body: {},
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getLeads (GET /leads)', () => {
    // TEST 1: Get all leads with pagination
    it('should return paginated leads', async () => {
      const mockLeads = [
        {
          id: 'lead-1', first_name: 'John', last_name: 'Doe', lead_status: 'new',
        },
        {
          id: 'lead-2', first_name: 'Jane', last_name: 'Smith', lead_status: 'contacted',
        },
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '25' }] }) // Count
        .mockResolvedValueOnce({ rows: mockLeads }); // Data

      mockReq.query = { page: 1, limit: 20 };

      await leadsController.getLeads(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          leads: mockLeads,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalCount: 25,
            limit: 20,
          },
        },
        timestamp: expect.any(String),
      });
    });

    // TEST 2: Filter by lead status
    it('should filter leads by status', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '10' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { leadStatus: 'qualified' };

      await leadsController.getLeads(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('lead_status = $'),
        expect.arrayContaining(['team-456', 'qualified', 20, 0]),
      );
    });

    // TEST 3: Search leads by name/email
    it('should search leads by name or email', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '3' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { search: 'john' };

      await leadsController.getLeads(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['team-456', '%john%', 20, 0]),
      );
    });

    // TEST 4: Handle empty results
    it('should return empty array when no leads found', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      await leadsController.getLeads(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          leads: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            limit: 20,
          },
        },
        timestamp: expect.any(String),
      });
    });

    // TEST 5: Handle database errors
    it('should handle database errors', async () => {
      pool.query.mockRejectedValue(new Error('DB error'));

      await leadsController.getLeads(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'FETCH_ERROR',
        }),
        timestamp: expect.any(String),
      });
    });

    // TEST 6: Pagination - page 2 with custom limit
    it('should handle custom page and limit', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '100' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { page: 3, limit: 10 };

      await leadsController.getLeads(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([10, 20]), // limit=10, offset=(3-1)*10=20
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          leads: [],
          pagination: {
            currentPage: 3,
            totalPages: 10,
            totalCount: 100,
            limit: 10,
          },
        },
        timestamp: expect.any(String),
      });
    });

    // TEST 7: Filter deleted leads (soft delete)
    it('should exclude soft-deleted leads', async () => {
      pool.query
        .mockResolvedValueOnce({ rows: [{ count: '5' }] })
        .mockResolvedValueOnce({ rows: [] });

      await leadsController.getLeads(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array),
      );
    });
  });

  describe('createLead (POST /leads)', () => {
    // TEST 8: Create new lead successfully
    it('should create new lead with valid data', async () => {
      const newLead = {
        first_name: 'New',
        last_name: 'Lead',
        email: 'new@example.com',
        phone: '555-0199',
        lead_source: 'Website',
        lead_status: 'new',
      };

      pool.query.mockResolvedValue({
        rows: [{ id: 'lead-new', ...newLead }],
      });

      mockReq.body = newLead;

      await leadsController.createLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'lead-new',
          first_name: 'New',
        }),
        timestamp: expect.any(String),
      });
    });

    // TEST 9: Validate required fields
    it('should reject lead without required fields', async () => {
      mockReq.body = {
        // Missing first_name and last_name
        email: 'test@example.com',
      };

      await leadsController.createLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
        }),
        timestamp: expect.any(String),
      });
    });

    // TEST 10: Default lead status to 'new'
    it('should default lead status to new if not provided', async () => {
      pool.query.mockResolvedValue({
        rows: [{ id: 'lead-1', lead_status: 'new' }],
      });

      mockReq.body = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        // lead_status omitted
      };

      await leadsController.createLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateLead (PUT /leads/:id)', () => {
    // TEST 11: Update lead successfully
    it('should update lead with valid data', async () => {
      const updatedLead = {
        id: 'lead-1',
        first_name: 'John',
        last_name: 'Updated',
        lead_status: 'qualified',
      };

      pool.query.mockResolvedValue({ rows: [updatedLead] });

      mockReq.params = { id: 'lead-1' };
      mockReq.body = {
        last_name: 'Updated',
        lead_status: 'qualified',
      };

      await leadsController.updateLead(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedLead,
        timestamp: expect.any(String),
      });
    });

    // TEST 12: Return 404 for non-existent lead
    it('should return 404 when lead not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { lead_status: 'qualified' };

      await leadsController.updateLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
        }),
        timestamp: expect.any(String),
      });
    });
  });

  describe('deleteLead (DELETE /leads/:id)', () => {
    // TEST 13: Soft delete lead
    it('should soft delete lead', async () => {
      pool.query.mockResolvedValue({
        rows: [{ id: 'lead-1', deleted_at: new Date() }],
      });

      mockReq.params = { id: 'lead-1' };

      await leadsController.deleteLead(mockReq, mockRes);

      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at = NOW()'),
        expect.arrayContaining(['lead-1']),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: expect.stringContaining('deleted'),
        timestamp: expect.any(String),
      });
    });

    // TEST 14: Return 404 when deleting non-existent lead
    it('should return 404 when deleting non-existent lead', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };

      await leadsController.deleteLead(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getLeadById (GET /leads/:id)', () => {
    // TEST 15: Get lead by ID
    it('should return lead by ID', async () => {
      const mockLead = {
        id: 'lead-1',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        lead_status: 'new',
      };

      pool.query.mockResolvedValue({ rows: [mockLead] });

      mockReq.params = { id: 'lead-1' };

      await leadsController.getLeadById(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockLead,
        timestamp: expect.any(String),
      });
    });
  });
});
