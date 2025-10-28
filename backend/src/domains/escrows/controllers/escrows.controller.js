const BaseDomainController = require('../../../shared/controllers/BaseDomainController');
const escrowsService = require('../services/escrows.service');
const { AppError } = require('../../../shared/utils/errors');

/**
 * EscrowsController
 * Enhanced escrows controller extending BaseDomainController
 * Delegates to EscrowsService for business logic
 */
class EscrowsController extends BaseDomainController {
  constructor() {
    super('EscrowsController');
  }

  /**
   * Get all escrows with pagination, filtering, and sorting
   * GET /v1/escrows?scope=my|team|broker
   */
  getAllEscrows = this.asyncHandler(async (req, res) => {
    // Get pagination
    const pagination = this.getPagination(req);

    // Get sorting
    const sorting = this.getSorting(req, [
      'created_at',
      'closing_date',
      'acceptance_date',
      'purchase_price',
      'property_address',
      'escrow_status'
    ]);

    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'propertyType',
      'closingDateStart',
      'closingDateEnd',
      'search'
    ]);

    // Add scope filtering
    const scope = req.query.scope || 'my';
    const user = req.user;

    // For system_admin role, "my" scope means ALL escrows
    if (user.role === 'system_admin' && scope === 'my') {
      // No additional filters - show all escrows
    } else if (scope === 'my') {
      // Show only user's own escrows
      filters.owner_id = user.id;
    } else if (scope === 'team') {
      // Show team's escrows
      filters.team_id = user.team_id;
    } else if (scope === 'broker') {
      // Show broker's escrows
      filters.broker_id = user.broker_id;
    }

    // Fetch data
    const result = await escrowsService.findAll(filters, {
      ...pagination,
      ...sorting
    });

    // Build response
    this.success(res, {
      escrows: result.items,
      stats: result.stats,
      pagination: result.pagination
    });
  });

  /**
   * Get single escrow by ID
   * GET /v1/escrows/:id
   */
  getEscrowById = this.asyncHandler(async (req, res) => {
    let { id } = req.params;

    // Strip "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    const escrow = await escrowsService.findById(id);

    // Check ownership
    await this.checkOwnership(escrow, req.user.id, req.user.team_id);

    this.success(res, escrow);
  });

  /**
   * Create new escrow
   * POST /v1/escrows
   */
  createEscrow = this.asyncHandler(async (req, res) => {
    // Validate request
    this.validate(req);

    const escrowData = req.body;

    // Check for empty body
    if (!escrowData || typeof escrowData !== 'object' || Object.keys(escrowData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Create escrow
    const newEscrow = await escrowsService.create(escrowData, req.user);

    this.created(res, newEscrow, 'Escrow created successfully');
  });

  /**
   * Update existing escrow
   * PUT /v1/escrows/:id
   */
  updateEscrow = this.asyncHandler(async (req, res) => {
    let { id } = req.params;

    // Strip "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    // Validate request
    this.validate(req);

    const updateData = req.body;

    // Check for empty body
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Update escrow
    const updated = await escrowsService.update(id, updateData, req.user);

    this.success(res, updated, 'Escrow updated successfully');
  });

  /**
   * Archive escrow (soft delete)
   * PATCH /v1/escrows/:id/archive
   */
  archiveEscrow = this.asyncHandler(async (req, res) => {
    let { id } = req.params;

    // Strip "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    // Archive escrow
    const result = await escrowsService.archive(id, req.user);

    this.success(res, result, 'Escrow archived successfully');
  });

  /**
   * Restore archived escrow
   * PATCH /v1/escrows/:id/restore
   */
  restoreEscrow = this.asyncHandler(async (req, res) => {
    let { id } = req.params;

    // Strip "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    // Restore escrow
    const restored = await escrowsService.restore(id, req.user);

    this.success(res, restored, 'Escrow restored successfully');
  });

  /**
   * Permanently delete escrow
   * DELETE /v1/escrows/:id
   */
  deleteEscrow = this.asyncHandler(async (req, res) => {
    let { id } = req.params;

    // Strip "escrow-" prefix if present
    if (id.startsWith('escrow-')) {
      id = id.substring(7);
    }

    // Delete escrow
    await escrowsService.delete(id, req.user);

    this.success(res, { id }, 'Escrow deleted successfully');
  });

  /**
   * Batch delete escrows
   * DELETE /v1/escrows/batch
   */
  batchDeleteEscrows = this.asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids array is required', 400);
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await escrowsService.delete(id, req.user);
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
   * Get escrow statistics
   * GET /v1/escrows/stats
   */
  getStats = this.asyncHandler(async (req, res) => {
    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'propertyType',
      'closingDateStart',
      'closingDateEnd'
    ]);

    // Calculate stats
    const stats = await escrowsService.calculateStats(filters);

    this.success(res, stats);
  });
}

module.exports = new EscrowsController();
