const { pool } = require('../config/infrastructure/database');
const EscrowsController = require('./escrows.controller');

// Mock database
jest.mock('../../../config/infrastructure/database');

describe('EscrowsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock authenticated request
    mockReq = {
      user: {
        id: 'user-123',
        email: 'agent@example.com',
        role: 'agent',
      },
      body: {},
      query: {},
      params: {},
    };

    // Setup mock response
    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getAll (GET /escrows)', () => {
    // TEST 1: Get all escrows for authenticated user
    it('should return all escrows for the authenticated user', async () => {
      // Arrange
      const mockEscrows = [
        {
          id: 'escrow-1',
          property_address: '123 Main St',
          purchase_price: 500000,
          status: 'active',
          user_id: 'user-123',
        },
        {
          id: 'escrow-2',
          property_address: '456 Oak Ave',
          purchase_price: 750000,
          status: 'pending',
          user_id: 'user-123',
        },
      ];

      pool.query.mockResolvedValue({ rows: mockEscrows });

      // Act
      await EscrowsController.getAll(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining(['user-123']),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockEscrows,
      });
    });

    // TEST 2: Filter escrows by status
    it('should filter escrows by status when query param provided', async () => {
      // Arrange
      mockReq.query = { status: 'active' };

      const mockEscrows = [
        {
          id: 'escrow-1',
          property_address: '123 Main St',
          status: 'active',
        },
      ];

      pool.query.mockResolvedValue({ rows: mockEscrows });

      // Act
      await EscrowsController.getAll(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['user-123', 'active']),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockEscrows,
      });
    });

    // TEST 3: Return empty array when no escrows found
    it('should return empty array when user has no escrows', async () => {
      // Arrange
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await EscrowsController.getAll(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });
  });

  describe('getById (GET /escrows/:id)', () => {
    // TEST 4: Get escrow by ID
    it('should return escrow by ID for authorized user', async () => {
      // Arrange
      const mockEscrow = {
        id: 'escrow-1',
        property_address: '123 Main St',
        purchase_price: 500000,
        status: 'active',
        user_id: 'user-123',
      };

      mockReq.params = { id: 'escrow-1' };
      pool.query.mockResolvedValue({ rows: [mockEscrow] });

      // Act
      await EscrowsController.getById(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE'),
        expect.arrayContaining(['escrow-1', 'user-123']),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockEscrow,
      });
    });

    // TEST 5: Return 404 for non-existent escrow
    it('should return 404 when escrow not found', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent-id' };
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await EscrowsController.getById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
        }),
      });
    });
  });

  describe('create (POST /escrows)', () => {
    // TEST 6: Create new escrow successfully
    it('should create new escrow with valid data', async () => {
      // Arrange
      const mockNewEscrow = {
        id: 'escrow-new',
        property_address: '789 Elm St',
        purchase_price: 600000,
        status: 'active',
        user_id: 'user-123',
        created_at: new Date().toISOString(),
      };

      mockReq.body = {
        property_address: '789 Elm St',
        purchase_price: 600000,
        seller_name: 'John Seller',
        buyer_name: 'Jane Buyer',
        escrow_company: 'Secure Escrow Inc',
        close_date: '2026-03-01',
      };

      pool.query.mockResolvedValue({ rows: [mockNewEscrow] });

      // Act
      await EscrowsController.create(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO escrows'),
        expect.arrayContaining([
          'user-123',
          '789 Elm St',
          600000,
        ]),
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockNewEscrow,
      });
    });

    // TEST 7: Validate required fields on create
    it('should return 400 when required fields are missing', async () => {
      // Arrange
      mockReq.body = {
        // Missing property_address
        purchase_price: 500000,
      };

      // Act
      await EscrowsController.create(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'MISSING_FIELDS',
        }),
      });
    });

    // TEST 8: Validate data types (purchase price must be number)
    it('should validate purchase price is a valid number', async () => {
      // Arrange
      mockReq.body = {
        property_address: '123 Main St',
        purchase_price: 'invalid-price', // Should be number
      };

      // Act
      await EscrowsController.create(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: expect.stringMatching(/INVALID|VALIDATION/),
        }),
      });
    });
  });

  describe('update (PUT /escrows/:id)', () => {
    // TEST 9: Update escrow successfully
    it('should update escrow with valid data', async () => {
      // Arrange
      const mockUpdatedEscrow = {
        id: 'escrow-1',
        property_address: '123 Main St',
        purchase_price: 550000, // Updated price
        status: 'pending', // Updated status
        user_id: 'user-123',
      };

      mockReq.params = { id: 'escrow-1' };
      mockReq.body = {
        purchase_price: 550000,
        status: 'pending',
      };

      // First query checks ownership, second updates
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 'escrow-1' }] }) // Ownership check
        .mockResolvedValueOnce({ rows: [mockUpdatedEscrow] }); // Update

      // Act
      await EscrowsController.update(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE escrows'),
        expect.any(Array),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedEscrow,
      });
    });

    // TEST 10: Prevent unauthorized update
    it('should return 404 when trying to update another user\'s escrow', async () => {
      // Arrange
      mockReq.params = { id: 'other-user-escrow' };
      mockReq.body = { status: 'closed' };

      pool.query.mockResolvedValue({ rows: [] }); // No escrow found for this user

      // Act
      await EscrowsController.update(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'NOT_FOUND',
        }),
      });
    });
  });

  describe('delete (DELETE /escrows/:id)', () => {
    // BONUS TEST 11: Delete escrow successfully
    it('should delete escrow when user is authorized', async () => {
      // Arrange
      mockReq.params = { id: 'escrow-1' };

      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 'escrow-1' }] }) // Ownership check
        .mockResolvedValueOnce({ rows: [] }); // Delete

      // Act
      await EscrowsController.delete(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('DELETE FROM escrows'),
        expect.arrayContaining(['escrow-1', 'user-123']),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        message: expect.any(String),
      });
    });
  });
});
