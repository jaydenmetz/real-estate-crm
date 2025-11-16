const { pool } = require('../config/infrastructure/database');
const clientsController = require('./clients.controller');

// Mock database
jest.mock('../../../config/infrastructure/database');

describe('ClientsController', () => {
  let mockReq;
  let mockRes;
  let mockClient;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock authenticated request
    mockReq = {
      user: {
        id: 'user-123',
        email: 'agent@example.com',
        role: 'agent',
        teamId: 'team-456',
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

    // Setup mock database client for transactions
    mockClient = {
      query: jest.fn(),
      release: jest.fn(),
    };
  });

  describe('getAllClients (GET /clients)', () => {
    // TEST 1: Get all active clients with pagination
    it('should return paginated list of active clients', async () => {
      // Arrange
      const mockClients = [
        {
          id: 'client-1',
          first_name: 'John',
          last_name: 'Buyer',
          email: 'john@example.com',
          phone: '555-0101',
          client_type: 'Buyer',
          status: 'active',
        },
        {
          id: 'client-2',
          first_name: 'Jane',
          last_name: 'Seller',
          email: 'jane@example.com',
          phone: '555-0102',
          client_type: 'Seller',
          status: 'active',
        },
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '25' }] }) // Count query
        .mockResolvedValueOnce({ rows: mockClients }); // Data query

      mockReq.query = { page: 1, limit: 20, status: 'active' };

      // Act
      await clientsController.getAllClients(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          clients: mockClients,
          pagination: {
            currentPage: 1,
            totalPages: 2,
            totalCount: 25,
            limit: 20,
          },
        },
      });
    });

    // TEST 2: Filter by status
    it('should filter clients by status', async () => {
      // Arrange
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '5' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { status: 'inactive' };

      // Act
      await clientsController.getAllClients(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('cl.status = $'),
        expect.arrayContaining(['team-456', 'inactive', 20, 0]),
      );
    });

    // TEST 3: Search by name/email
    it('should search clients by name or email', async () => {
      // Arrange
      const searchResults = [
        {
          id: 'client-1',
          first_name: 'John',
          last_name: 'Smith',
          email: 'john.smith@example.com',
        },
      ];

      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({ rows: searchResults });

      mockReq.query = { search: 'john' };

      // Act
      await clientsController.getAllClients(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('ILIKE'),
        expect.arrayContaining(['team-456', 'active', '%john%', 20, 0]),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          clients: searchResults,
          pagination: expect.any(Object),
        },
      });
    });

    // TEST 4: Pagination - page 2
    it('should return correct page of results', async () => {
      // Arrange
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '50' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { page: 2, limit: 20 };

      // Act
      await clientsController.getAllClients(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([20, 20]), // limit, offset
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          clients: [],
          pagination: {
            currentPage: 2,
            totalPages: 3,
            totalCount: 50,
            limit: 20,
          },
        },
      });
    });

    // TEST 5: Empty results
    it('should return empty array when no clients found', async () => {
      // Arrange
      pool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      // Act
      await clientsController.getAllClients(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          clients: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            limit: 20,
          },
        },
      });
    });

    // TEST 6: Handle database errors
    it('should handle database errors gracefully', async () => {
      // Arrange
      pool.query.mockRejectedValue(new Error('Database connection failed'));

      // Act
      await clientsController.getAllClients(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch clients',
          details: 'Database connection failed',
        },
      });
    });
  });

  describe('getClientById (GET /clients/:id)', () => {
    // TEST 7: Get client by valid ID
    it('should return client by ID', async () => {
      // Arrange
      const mockClient = {
        id: 'client-1',
        first_name: 'John',
        last_name: 'Buyer',
        email: 'john@example.com',
        client_type: 'Buyer',
        status: 'active',
      };

      mockReq.params = { id: 'client-1' };
      pool.query.mockResolvedValue({ rows: [mockClient] });

      // Act
      await clientsController.getClientById(mockReq, mockRes);

      // Assert
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE cl.id = $1'),
        ['client-1'],
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockClient,
      });
    });

    // TEST 8: Return 404 for non-existent client
    it('should return 404 when client not found', async () => {
      // Arrange
      mockReq.params = { id: 'nonexistent-id' };
      pool.query.mockResolvedValue({ rows: [] });

      // Act
      await clientsController.getClientById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Client not found',
        },
      });
    });

    // TEST 9: Handle database errors on getById
    it('should handle database errors on getById', async () => {
      // Arrange
      mockReq.params = { id: 'client-1' };
      pool.query.mockRejectedValue(new Error('Connection timeout'));

      // Act
      await clientsController.getClientById(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch client',
          details: 'Connection timeout',
        },
      });
    });
  });

  describe('createClient (POST /clients)', () => {
    beforeEach(() => {
      pool.connect = jest.fn().mockResolvedValue(mockClient);
    });

    // TEST 10: Create new client successfully
    it('should create new client with valid data', async () => {
      // Arrange
      const newClientData = {
        firstName: 'John',
        lastName: 'Buyer',
        email: 'john@example.com',
        phone: '555-0101',
        clientType: 'Buyer',
        addressStreet: '123 Main St',
        addressCity: 'Los Angeles',
        addressState: 'CA',
        addressZip: '90001',
        notes: 'First-time buyer',
        tags: ['hot-lead', 'pre-approved'],
      };

      const mockContact = {
        id: 'contact-1',
        ...newClientData,
      };

      const mockClient_created = {
        id: 'client-1',
        contact_id: 'contact-1',
        client_type: 'Buyer',
        status: 'active',
      };

      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Duplicate check (no duplicates)
        .mockResolvedValueOnce({ rows: [mockContact] }) // Insert contact
        .mockResolvedValueOnce({ rows: [mockClient_created] }) // Insert client
        .mockResolvedValueOnce({ }); // COMMIT

      mockReq.body = newClientData;

      // Act
      await clientsController.createClient(mockReq, mockRes);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'client-1',
        }),
      });
    });

    // TEST 11: Reject duplicate email
    it('should reject client creation with duplicate email', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'existing-contact' }] }) // Duplicate found
        .mockResolvedValueOnce({ }); // ROLLBACK

      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'existing@example.com',
      };

      // Act
      await clientsController.createClient(mockReq, mockRes);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'DUPLICATE_EMAIL',
          message: 'A contact with this email already exists',
        },
      });
    });

    // TEST 12: Create client without email (optional field)
    it('should create client without email', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ id: 'contact-1' }] }) // Insert contact
        .mockResolvedValueOnce({ rows: [{ id: 'client-1' }] }) // Insert client
        .mockResolvedValueOnce({ }); // COMMIT

      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-0101',
        // email omitted
      };

      // Act
      await clientsController.createClient(mockReq, mockRes);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // TEST 13: Handle transaction rollback on error
    it('should rollback transaction on database error', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Duplicate check
        .mockRejectedValueOnce(new Error('Insert failed')) // Insert contact fails
        .mockResolvedValueOnce({ }); // ROLLBACK

      mockReq.body = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'test@example.com',
      };

      // Act
      await clientsController.createClient(mockReq, mockRes);

      // Assert
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    // TEST 14: Validate client type (Buyer/Seller/Both)
    it('should accept valid client types', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Duplicate check
        .mockResolvedValueOnce({ rows: [{ id: 'contact-1' }] }) // Contact
        .mockResolvedValueOnce({ rows: [{ id: 'client-1', client_type: 'Seller' }] }) // Client
        .mockResolvedValueOnce({ }); // COMMIT

      mockReq.body = {
        firstName: 'Jane',
        lastName: 'Seller',
        email: 'jane@example.com',
        clientType: 'Seller',
      };

      // Act
      await clientsController.createClient(mockReq, mockRes);

      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          client_type: 'Seller',
        }),
      });
    });

    // TEST 15: Default client type to "Buyer"
    it('should default client type to Buyer if not specified', async () => {
      // Arrange
      mockClient.query
        .mockResolvedValueOnce({ }) // BEGIN
        .mockResolvedValueOnce({ rows: [] }) // Duplicate check
        .mockResolvedValueOnce({ rows: [{ id: 'contact-1' }] }) // Contact
        .mockResolvedValueOnce({ rows: [{ id: 'client-1', client_type: 'Buyer' }] }) // Client
        .mockResolvedValueOnce({ }); // COMMIT

      mockReq.body = {
        firstName: 'John',
        lastName: 'Default',
        email: 'default@example.com',
        // clientType omitted - should default to 'Buyer'
      };

      // Act
      await clientsController.createClient(mockReq, mockRes);

      // Assert
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          client_type: 'Buyer',
        }),
      });
    });
  });
});
