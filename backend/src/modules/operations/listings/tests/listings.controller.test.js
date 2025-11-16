const { pool, query, transaction } = require('../config/infrastructure/database');
const listingsController = require('../controllers');

// Mock database and logger
jest.mock('../../../config/infrastructure/database');
jest.mock('../utils/logger');
jest.mock('express-validator', () => ({
  validationResult: jest.fn(() => ({ isEmpty: () => true, array: () => [] })),
}));

describe('ListingsController', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();

    mockReq = {
      user: {
        id: 'user-123',
        teamId: 'team-456',
        email: 'agent@example.com',
      },
      app: {
        get: jest.fn().mockReturnValue(null), // No socket.io in tests
      },
      body: {},
      query: {},
      params: {},
    };

    mockRes = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };

    // Mock query function
    query.mockResolvedValue({ rows: [] });
  });

  describe('getListings (GET /listings)', () => {
    // TEST 1: Get all listings with pagination
    it('should return paginated listings', async () => {
      const mockListings = [
        {
          id: 'listing-1', property_address: '123 Main St', list_price: 500000, listing_status: 'Active',
        },
        {
          id: 'listing-2', property_address: '456 Oak Ave', list_price: 650000, listing_status: 'Pending',
        },
      ];

      query
        .mockResolvedValueOnce({ rows: [{ total: '25' }] }) // Count
        .mockResolvedValueOnce({ rows: mockListings }); // Data

      mockReq.query = { page: 1, limit: 20 };

      await listingsController.getListings(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          listings: mockListings,
          pagination: {
            total: 25,
            page: 1,
            limit: 20,
            pages: 2,
          },
        },
        timestamp: expect.any(String),
      });
    });

    // TEST 2: Filter by status
    it('should filter listings by status', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '10' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { status: 'Active' };

      await listingsController.getListings(mockReq, mockRes);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('listing_status = $'),
        expect.arrayContaining(['Active']),
      );
    });

    // TEST 3: Filter by price range
    it('should filter listings by price range', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '5' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { minPrice: 300000, maxPrice: 700000 };

      await listingsController.getListings(mockReq, mockRes);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('list_price >= $'),
        expect.arrayContaining([300000, 700000]),
      );
    });

    // TEST 4: Filter by property type
    it('should filter listings by property type', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '8' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { propertyType: 'Condo' };

      await listingsController.getListings(mockReq, mockRes);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('property_type = $'),
        expect.arrayContaining(['Condo']),
      );
    });

    // TEST 5: Sort by price
    it('should sort listings by price', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '10' }] })
        .mockResolvedValueOnce({ rows: [] });

      mockReq.query = { sortBy: 'list_price', sortOrder: 'ASC' };

      await listingsController.getListings(mockReq, mockRes);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('ORDER BY l.list_price ASC'),
        expect.any(Array),
      );
    });

    // TEST 6: Exclude soft-deleted listings
    it('should exclude soft-deleted listings', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ total: '15' }] })
        .mockResolvedValueOnce({ rows: [] });

      await listingsController.getListings(mockReq, mockRes);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at IS NULL'),
        expect.any(Array),
      );
    });

    // TEST 7: Handle database errors
    it('should handle database errors', async () => {
      query.mockRejectedValue(new Error('Database error'));

      await listingsController.getListings(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch listings',
        },
      });
    });
  });

  describe('getListing (GET /listings/:id)', () => {
    // TEST 8: Get listing by ID
    it('should return listing by ID', async () => {
      const mockListing = {
        id: 'listing-1',
        property_address: '123 Main St',
        list_price: 500000,
        listing_status: 'Active',
        listing_commission: 3.0,
        buyer_commission: 2.5,
        total_commission: 5.5,
      };

      query.mockResolvedValue({ rows: [mockListing] });

      mockReq.params = { id: 'listing-1' };

      await listingsController.getListing(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          id: 'listing-1',
          analytics: expect.any(Object),
        }),
        timestamp: expect.any(String),
      });
    });

    // TEST 9: Return 404 for non-existent listing
    it('should return 404 when listing not found', async () => {
      query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };

      await listingsController.getListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found',
        },
      });
    });
  });

  describe('createListing (POST /listings)', () => {
    let mockClient;

    beforeEach(() => {
      mockClient = {
        query: jest.fn(),
        release: jest.fn(),
      };

      transaction.mockImplementation(async (callback) => await callback(mockClient));
    });

    // TEST 10: Create new listing successfully
    it('should create new listing with valid data', async () => {
      const newListing = {
        propertyAddress: '123 Main St',
        listPrice: 500000,
        propertyType: 'Single Family',
        bedrooms: 3,
        bathrooms: 2,
        squareFootage: 2000,
        listingStatus: 'Coming Soon',
      };

      const mockCreatedListing = {
        id: 'listing-1',
        property_address: '123 Main St',
        list_price: 500000,
        mls_number: 'MLS202512345',
        listing_status: 'Coming Soon',
      };

      mockClient.query.mockResolvedValue({ rows: [mockCreatedListing] });

      mockReq.body = newListing;

      await listingsController.createListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedListing,
        timestamp: expect.any(String),
      });
    });

    // TEST 11: Default property type to "Single Family"
    it('should default property type to Single Family if not specified', async () => {
      const mockCreatedListing = {
        id: 'listing-1',
        property_type: 'Single Family',
      };

      mockClient.query.mockResolvedValue({ rows: [mockCreatedListing] });

      mockReq.body = {
        propertyAddress: '123 Main St',
        listPrice: 500000,
        // propertyType omitted
      };

      await listingsController.createListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    // TEST 12: Generate MLS number automatically
    it('should generate MLS number automatically', async () => {
      const mockCreatedListing = {
        id: 'listing-1',
        mls_number: expect.stringMatching(/^MLS\d{4}\d{4}$/),
      };

      mockClient.query.mockResolvedValue({ rows: [mockCreatedListing] });

      mockReq.body = {
        propertyAddress: '123 Main St',
        listPrice: 500000,
      };

      await listingsController.createListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });
  });

  describe('updateListing (PUT /listings/:id)', () => {
    // TEST 13: Update listing successfully
    it('should update listing with valid data', async () => {
      const updatedListing = {
        id: 'listing-1',
        property_address: '123 Main St',
        list_price: 475000,
        listing_status: 'Active',
      };

      query
        .mockResolvedValueOnce({ rows: [{ list_price: 500000 }] }) // Get current price
        .mockResolvedValueOnce({ rows: [updatedListing] }); // Update

      mockReq.params = { id: 'listing-1' };
      mockReq.body = {
        listPrice: 475000,
        listingStatus: 'Active',
      };

      await listingsController.updateListing(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: updatedListing,
        timestamp: expect.any(String),
      });
    });

    // TEST 14: Return 404 for non-existent listing
    it('should return 404 when listing not found', async () => {
      query
        .mockResolvedValueOnce({ rows: [] }) // Get current price
        .mockResolvedValueOnce({ rows: [] }); // Update

      mockReq.params = { id: 'nonexistent' };
      mockReq.body = { listPrice: 475000 };

      await listingsController.updateListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    // TEST 15: Handle version conflict (optimistic locking)
    it('should handle version conflict with optimistic locking', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ list_price: 500000 }] }) // Get current price
        .mockResolvedValueOnce({ rows: [] }) // Update fails (version mismatch)
        .mockResolvedValueOnce({ rows: [{ version: 5 }] }); // Check query

      mockReq.params = { id: 'listing-1' };
      mockReq.body = {
        listPrice: 475000,
        version: 3, // Outdated version
      };

      await listingsController.updateListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'VERSION_CONFLICT',
          currentVersion: 5,
          attemptedVersion: 3,
        }),
      });
    });
  });

  describe('updateStatus (PUT /listings/:id/status)', () => {
    // TEST 16: Update status with valid transition
    it('should update status with valid transition', async () => {
      query
        .mockResolvedValueOnce({ rows: [{ listing_status: 'Coming Soon' }] }) // Get current
        .mockResolvedValueOnce({ rows: [{ listing_status: 'Active' }] }); // Update

      mockReq.params = { id: 'listing-1' };
      mockReq.body = { status: 'Active' };

      await listingsController.updateStatus(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({ listing_status: 'Active' }),
        timestamp: expect.any(String),
      });
    });

    // TEST 17: Reject invalid status transition
    it('should reject invalid status transition', async () => {
      query.mockResolvedValueOnce({ rows: [{ listing_status: 'Sold' }] }); // Terminal state

      mockReq.params = { id: 'listing-1' };
      mockReq.body = { status: 'Active' };

      await listingsController.updateStatus(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: expect.objectContaining({
          code: 'INVALID_TRANSITION',
          allowedTransitions: [],
        }),
      });
    });
  });

  describe('archiveListing (POST /listings/:id/archive)', () => {
    // TEST 18: Archive listing successfully
    it('should archive listing successfully', async () => {
      const archivedListing = {
        id: 'listing-1',
        property_address: '123 Main St',
        deleted_at: new Date(),
        listing_status: 'Cancelled',
      };

      query.mockResolvedValue({ rows: [archivedListing] });

      mockReq.params = { id: 'listing-1' };

      await listingsController.archiveListing(mockReq, mockRes);

      expect(query).toHaveBeenCalledWith(
        expect.stringContaining('deleted_at = CURRENT_TIMESTAMP'),
        expect.arrayContaining(['listing-1']),
      );

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: archivedListing,
        timestamp: expect.any(String),
      });
    });

    // TEST 19: Return 404 when archiving non-existent or already archived listing
    it('should return 404 when listing not found or already archived', async () => {
      query.mockResolvedValue({ rows: [] });

      mockReq.params = { id: 'nonexistent' };

      await listingsController.archiveListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Listing not found or already archived',
        },
      });
    });
  });

  describe('deleteListing (DELETE /listings/:id)', () => {
    // TEST 20: Delete archived listing successfully
    it('should delete archived listing successfully', async () => {
      const deletedListing = {
        id: 'listing-1',
        property_address: '123 Main St',
      };

      query
        .mockResolvedValueOnce({ rows: [{ id: 'listing-1', deleted_at: new Date() }] }) // Check query
        .mockResolvedValueOnce({ rows: [deletedListing] }); // Delete

      mockReq.params = { id: 'listing-1' };

      await listingsController.deleteListing(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        data: {
          id: 'listing-1',
          message: expect.stringContaining('permanently deleted'),
        },
        timestamp: expect.any(String),
      });
    });

    // TEST 21: Prevent deletion of non-archived listing
    it('should prevent deletion of non-archived listing', async () => {
      query.mockResolvedValueOnce({ rows: [{ id: 'listing-1', deleted_at: null }] }); // Not archived

      mockReq.params = { id: 'listing-1' };

      await listingsController.deleteListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        success: false,
        error: {
          code: 'NOT_ARCHIVED',
          message: 'Listing must be archived before deletion',
        },
      });
    });
  });
});
