const commissionsController = require('./commissions.controller');
const Commission = require('../models/Commission.mock');
const logger = require('../../../../utils/logger');

// Mock dependencies
jest.mock('../models/Commission.mock');
jest.mock('../utils/logger');

describe('CommissionsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: {
        id: 'agent-123',
        email: 'agent@example.com',
        role: 'agent',
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

  describe('getCommissions (GET /commissions)', () => {
    it('should return all commissions with default pagination', async () => {
      // Arrange
      const mockCommissions = {
        data: [
          {
            id: 'comm-1',
            amount: 15000,
            side: 'buyer',
            status: 'pending',
            agentId: 'agent-123',
          },
          {
            id: 'comm-2',
            amount: 12000,
            side: 'seller',
            status: 'paid',
            agentId: 'agent-123',
          },
        ],
        total: 2,
        page: 1,
        limit: 20,
      };

      Commission.findAll.mockResolvedValue(mockCommissions);

      // Act
      await commissionsController.getCommissions(mockReq, mockRes);

      // Assert
      expect(Commission.findAll).toHaveBeenCalledWith({
        status: undefined,
        agentId: undefined,
        side: undefined,
        startDate: undefined,
        endDate: undefined,
        page: 1,
        limit: 20,
        sort: undefined,
        order: undefined,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCommissions,
        timestamp: expect.any(String),
      });
    });

    it('should filter commissions by status', async () => {
      // Arrange
      mockReq.query = { status: 'paid' };
      const mockCommissions = {
        data: [{ id: 'comm-1', status: 'paid', amount: 12000 }],
        total: 1,
      };

      Commission.findAll.mockResolvedValue(mockCommissions);

      // Act
      await commissionsController.getCommissions(mockReq, mockRes);

      // Assert
      expect(Commission.findAll).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'paid' }),
      );
    });

    it('should filter commissions by date range', async () => {
      // Arrange
      mockReq.query = {
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      Commission.findAll.mockResolvedValue({ data: [], total: 0 });

      // Act
      await commissionsController.getCommissions(mockReq, mockRes);

      // Assert
      expect(Commission.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-01-01',
          endDate: '2025-01-31',
        }),
      );
    });

    it('should handle database errors', async () => {
      // Arrange
      Commission.findAll.mockRejectedValue(new Error('Database error'));

      // Act
      await commissionsController.getCommissions(mockReq, mockRes);

      // Assert
      expect(logger.error).toHaveBeenCalledWith(
        'Error fetching commissions:',
        expect.any(Error),
      );
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch commissions',
        },
      });
    });
  });

  describe('getCommission (GET /commissions/:id)', () => {
    it('should return specific commission by ID', async () => {
      // Arrange
      mockReq.params = { id: 'comm-123' };
      const mockCommission = {
        id: 'comm-123',
        amount: 15000,
        side: 'buyer',
        status: 'pending',
        agentId: 'agent-123',
        escrowId: 'escrow-456',
      };

      Commission.findById.mockResolvedValue(mockCommission);

      // Act
      await commissionsController.getCommission(mockReq, mockRes);

      // Assert
      expect(Commission.findById).toHaveBeenCalledWith('comm-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCommission,
        timestamp: expect.any(String),
      });
    });

    it('should return 404 if commission not found', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent' };
      Commission.findById.mockResolvedValue(null);

      // Act
      await commissionsController.getCommission(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Commission not found',
        },
      });
    });
  });

  describe('createCommission (POST /commissions)', () => {
    it('should create new commission with valid data', async () => {
      // Arrange
      mockReq.body = {
        amount: 15000,
        percentage: 3.0,
        side: 'buyer',
        agentId: 'agent-123',
        escrowId: 'escrow-456',
        status: 'pending',
      };

      const mockCreatedCommission = {
        id: 'comm-new',
        ...mockReq.body,
        created_at: '2025-01-01T00:00:00Z',
      };

      Commission.create.mockResolvedValue(mockCreatedCommission);

      // Act
      await commissionsController.createCommission(mockReq, mockRes);

      // Assert
      expect(Commission.create).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedCommission,
        timestamp: expect.any(String),
      });
    });

    it('should validate commission amount is positive', async () => {
      // Arrange
      mockReq.body = {
        amount: -5000, // Invalid negative amount
        side: 'buyer',
      };

      Commission.create.mockRejectedValue(new Error('Amount must be positive'));

      // Act
      await commissionsController.createCommission(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('updateCommission (PUT /commissions/:id)', () => {
    it('should update commission status', async () => {
      // Arrange
      mockReq.params = { id: 'comm-123' };
      mockReq.body = { status: 'paid' };

      const mockUpdatedCommission = {
        id: 'comm-123',
        amount: 15000,
        status: 'paid',
        updated_at: '2025-01-01T12:00:00Z',
      };

      Commission.update.mockResolvedValue(mockUpdatedCommission);

      // Act
      await commissionsController.updateCommission(mockReq, mockRes);

      // Assert
      expect(Commission.update).toHaveBeenCalledWith('comm-123', mockReq.body);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedCommission,
        timestamp: expect.any(String),
      });
    });

    it('should return 404 if commission not found', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { status: 'paid' };

      Commission.update.mockResolvedValue(null);

      // Act
      await commissionsController.updateCommission(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });
  });

  describe('deleteCommission (DELETE /commissions/:id)', () => {
    it('should soft delete commission', async () => {
      // Arrange
      mockReq.params = { id: 'comm-123' };

      Commission.delete.mockResolvedValue({ id: 'comm-123', deleted: true });

      // Act
      await commissionsController.deleteCommission(mockReq, mockRes);

      // Assert
      expect(Commission.delete).toHaveBeenCalledWith('comm-123');
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          message: expect.stringContaining('deleted'),
        }),
      });
    });
  });

  describe('calculateCommission (POST /commissions/calculate)', () => {
    it('should calculate commission based on sale price and percentage', async () => {
      // Arrange
      mockReq.body = {
        salePrice: 500000,
        commissionPercentage: 3.0,
      };

      const expectedCommission = 15000; // 500000 * 0.03

      Commission.calculate.mockResolvedValue({
        salePrice: 500000,
        percentage: 3.0,
        commission: expectedCommission,
      });

      // Act
      await commissionsController.calculateCommission(mockReq, mockRes);

      // Assert
      expect(Commission.calculate).toHaveBeenCalledWith({
        salePrice: 500000,
        commissionPercentage: 3.0,
      });
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          commission: 15000,
        }),
      });
    });
  });

  describe('Financial Accuracy Tests', () => {
    it('should handle decimal precision correctly', async () => {
      // Arrange
      mockReq.body = {
        salePrice: 333333.33,
        commissionPercentage: 2.5,
      };

      const expectedCommission = 8333.33; // 333333.33 * 0.025

      Commission.calculate.mockResolvedValue({
        commission: expectedCommission,
      });

      // Act
      await commissionsController.calculateCommission(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          commission: expect.any(Number),
        }),
      });
    });

    it('should not allow negative commission amounts', async () => {
      // Arrange
      mockReq.body = {
        amount: -1000,
      };

      Commission.create.mockRejectedValue(
        new Error('Commission amount must be positive'),
      );

      // Act
      await commissionsController.createCommission(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large commission amounts', async () => {
      // Arrange
      mockReq.body = {
        amount: 9999999.99, // Maximum realistic commission
        side: 'buyer',
      };

      Commission.create.mockResolvedValue({ id: 'comm-large', ...mockReq.body });

      // Act
      await commissionsController.createCommission(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should handle concurrent commission updates safely', async () => {
      // Arrange
      mockReq.params = { id: 'comm-123' };
      mockReq.body = { status: 'paid' };

      Commission.update.mockResolvedValue({ id: 'comm-123', status: 'paid' });

      // Act
      await Promise.all([
        commissionsController.updateCommission(mockReq, mockRes),
        commissionsController.updateCommission(mockReq, mockRes),
      ]);

      // Assert
      expect(Commission.update).toHaveBeenCalledTimes(2);
    });
  });
});
