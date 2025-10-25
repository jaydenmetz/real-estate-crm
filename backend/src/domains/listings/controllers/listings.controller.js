const BaseDomainController = require('../../../shared/controllers/BaseDomainController');
const listingsService = require('../services/listings.service');
const { AppError } = require('../../../shared/utils/errors');

/**
 * ListingsController
 * Enhanced listings controller extending BaseDomainController
 * Delegates to ListingsService for business logic
 */
class ListingsController extends BaseDomainController {
  constructor() {
    super('ListingsController');
  }

  /**
   * Get all listings with pagination, filtering, and sorting
   * GET /v1/listings
   */
  getListings = this.asyncHandler(async (req, res) => {
    // Get pagination
    const pagination = this.getPagination(req);

    // Get sorting
    const sorting = this.getSorting(req, [
      'created_at',
      'list_price',
      'listing_date',
      'days_on_market',
      'property_address',
      'listing_status'
    ]);

    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'propertyType',
      'minPrice',
      'maxPrice',
      'minDaysOnMarket',
      'maxDaysOnMarket',
      'search'
    ]);

    // Fetch data
    const result = await listingsService.findAll(filters, {
      ...pagination,
      ...sorting
    });

    // Build response
    this.success(res, {
      listings: result.items,
      stats: result.stats,
      pagination: result.pagination
    });
  });

  /**
   * Get single listing by ID
   * GET /v1/listings/:id
   */
  getListing = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const listing = await listingsService.findById(id);

    // Check ownership
    await this.checkOwnership(listing, req.user.id, req.user.team_id);

    this.success(res, listing);
  });

  /**
   * Create new listing
   * POST /v1/listings
   */
  createListing = this.asyncHandler(async (req, res) => {
    // Validate request
    this.validate(req);

    const listingData = req.body;

    // Check for empty body
    if (!listingData || typeof listingData !== 'object' || Object.keys(listingData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Create listing
    const newListing = await listingsService.create(listingData, req.user);

    this.created(res, newListing, 'Listing created successfully');
  });

  /**
   * Update existing listing
   * PUT /v1/listings/:id
   */
  updateListing = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate request
    this.validate(req);

    const updateData = req.body;

    // Check for empty body
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Update listing
    const updated = await listingsService.update(id, updateData, req.user);

    this.success(res, updated, 'Listing updated successfully');
  });

  /**
   * Archive listing (soft delete)
   * PATCH /v1/listings/:id/archive
   */
  archiveListing = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Archive listing
    const result = await listingsService.archive(id, req.user);

    this.success(res, result, 'Listing archived successfully');
  });

  /**
   * Restore archived listing
   * PATCH /v1/listings/:id/restore
   */
  restoreListing = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Restore listing
    const restored = await listingsService.restore(id, req.user);

    this.success(res, restored, 'Listing restored successfully');
  });

  /**
   * Permanently delete listing
   * DELETE /v1/listings/:id
   */
  deleteListing = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete listing
    await listingsService.delete(id, req.user);

    this.success(res, { id }, 'Listing deleted successfully');
  });

  /**
   * Batch delete listings
   * DELETE /v1/listings/batch
   */
  batchDeleteListings = this.asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids array is required', 400);
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await listingsService.delete(id, req.user);
        results.push({ id, success: true });
      } catch (error) {
        errors.push({ id, success: false, error: error.message });
      }
    }

    this.success(res, {
      results,
      errors,
      summary: {
        total: ids.length,
        successful: results.length,
        failed: errors.length
      }
    }, 'Batch delete completed');
  });

  /**
   * Get listing statistics
   * GET /v1/listings/stats
   */
  getStats = this.asyncHandler(async (req, res) => {
    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'propertyType',
      'minPrice',
      'maxPrice',
      'minDaysOnMarket',
      'maxDaysOnMarket'
    ]);

    // Calculate stats
    const stats = await listingsService.calculateStats(filters);

    this.success(res, stats);
  });

  /**
   * Update listing status with validation
   * PATCH /v1/listings/:id/status
   */
  updateStatus = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('status is required', 400);
    }

    // Get current listing
    const listing = await listingsService.findById(id);

    // Validate status transition
    if (!listingsService.isValidStatusTransition(listing.listing_status, status)) {
      throw new AppError(
        `Invalid status transition from ${listing.listing_status} to ${status}`,
        400
      );
    }

    // Update status
    const updated = await listingsService.update(id, { listing_status: status }, req.user);

    this.success(res, updated, 'Listing status updated successfully');
  });
}

module.exports = new ListingsController();
