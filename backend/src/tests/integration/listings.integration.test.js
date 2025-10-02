const request = require('supertest');
const app = require('../../app');
const { pool } = require('../../config/database');

describe('Listings API Integration Tests', () => {
  let authToken;
  let testUserId;
  let testListingId;

  // Setup: Login and get auth token
  beforeAll(async () => {
    const loginResponse = await request(app)
      .post('/v1/auth/login')
      .send({
        email: 'admin@jaydenmetz.com',
        password: 'AdminPassword123!'
      });

    expect(loginResponse.status).toBe(200);
    authToken = loginResponse.body.data.token;
    testUserId = loginResponse.body.data.user.id;
  });

  // Cleanup: Delete test data
  afterAll(async () => {
    if (testListingId) {
      await pool.query('DELETE FROM listings WHERE id = $1', [testListingId]);
    }
    await pool.end();
  });

  // Test 1: Create listing with complete property details
  it('should create listing with all required fields', async () => {
    const response = await request(app)
      .post('/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '456 Listing Test Ave',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        price: 750000,
        bedrooms: 4,
        bathrooms: 3,
        squareFeet: 2500,
        lotSize: 10000,
        yearBuilt: 2010,
        propertyType: 'Single Family',
        listingType: 'Sale',
        status: 'Active',
        mlsNumber: `MLS-${Date.now()}`,
        description: 'Beautiful test property'
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.address).toBe('456 Listing Test Ave');
    expect(response.body.data.price).toBe('750000');

    testListingId = response.body.data.id;
  });

  // Test 2: Get all listings with status filter
  it('should retrieve active listings with status filter', async () => {
    const response = await request(app)
      .get('/v1/listings?status=Active')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('listings');
    expect(Array.isArray(response.body.data.listings)).toBe(true);

    // All returned listings should have status 'Active'
    response.body.data.listings.forEach(listing => {
      expect(listing.status).toBe('Active');
    });
  });

  // Test 3: Get single listing by ID
  it('should retrieve single listing with full details', async () => {
    const response = await request(app)
      .get(`/v1/listings/${testListingId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(testListingId);
    expect(response.body.data.bedrooms).toBe(4);
    expect(response.body.data.bathrooms).toBe(3);
  });

  // Test 4: Update listing price
  it('should update listing price and reflect changes', async () => {
    const response = await request(app)
      .put(`/v1/listings/${testListingId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        price: 725000 // Price reduction
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.price).toBe('725000');
  });

  // Test 5: Search listings by price range
  it('should filter listings by price range', async () => {
    const response = await request(app)
      .get('/v1/listings?minPrice=700000&maxPrice=800000')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // All listings should be within price range
    response.body.data.listings.forEach(listing => {
      const price = parseFloat(listing.price);
      expect(price).toBeGreaterThanOrEqual(700000);
      expect(price).toBeLessThanOrEqual(800000);
    });
  });

  // Test 6: Reject invalid property type
  it('should reject listing with invalid property type', async () => {
    const response = await request(app)
      .post('/v1/listings')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        address: '789 Invalid St',
        city: 'Tehachapi',
        state: 'CA',
        zipCode: '93561',
        price: 500000,
        propertyType: 'InvalidType' // Invalid
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // Test 7: Archive listing and verify exclusion
  it('should archive listing and exclude from active listings', async () => {
    // Archive
    const archiveResponse = await request(app)
      .put(`/v1/listings/${testListingId}/archive`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(archiveResponse.status).toBe(200);
    expect(archiveResponse.body.success).toBe(true);

    // Verify not in active listings
    const listResponse = await request(app)
      .get('/v1/listings?status=Active')
      .set('Authorization', `Bearer ${authToken}`);

    const archivedListing = listResponse.body.data.listings.find(l => l.id === testListingId);
    expect(archivedListing).toBeUndefined();
  });
});
