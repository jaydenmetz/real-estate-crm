const BaseDomainController = require('../../../shared/controllers/BaseDomainController');
const leadsService = require('../services/leads.service');
const { AppError } = require('../../../shared/utils/errors');

/**
 * LeadsController
 * Enhanced leads controller extending BaseDomainController
 * Delegates to LeadsService for business logic
 */
class LeadsController extends BaseDomainController {
  constructor() {
    super('LeadsController');
  }

  /**
   * Get all leads with pagination, filtering, and sorting
   * GET /v1/leads
   */
  getLeads = this.asyncHandler(async (req, res) => {
    // Get pagination
    const pagination = this.getPagination(req);

    // Get sorting
    const sorting = this.getSorting(req, [
      'created_at',
      'updated_at',
      'lead_status',
      'first_name',
      'last_name'
    ]);

    // Get filters
    const filters = this.getFilters(req, [
      'leadStatus',
      'leadSource',
      'isPrivate',
      'search'
    ]);

    // Fetch data
    const result = await leadsService.findAll(filters, {
      ...pagination,
      ...sorting
    });

    // Build response
    this.success(res, {
      leads: result.items,
      stats: result.stats,
      pagination: result.pagination
    });
  });

  /**
   * Get single lead by ID
   * GET /v1/leads/:id
   */
  getLead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const lead = await leadsService.findById(id);

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Check ownership
    await this.checkOwnership(lead, req.user.id, req.user.team_id);

    this.success(res, lead);
  });

  /**
   * Create new lead
   * POST /v1/leads
   */
  createLead = this.asyncHandler(async (req, res) => {
    // Validate request
    this.validate(req);

    const leadData = req.body;

    // Check for empty body
    if (!leadData || typeof leadData !== 'object' || Object.keys(leadData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Create lead
    const newLead = await leadsService.create(leadData, req.user);

    this.created(res, newLead, 'Lead created successfully');
  });

  /**
   * Update existing lead
   * PUT /v1/leads/:id
   */
  updateLead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate request
    this.validate(req);

    const updateData = req.body;

    // Check for empty body
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Update lead
    const updated = await leadsService.update(id, updateData, req.user);

    this.success(res, updated, 'Lead updated successfully');
  });

  /**
   * Archive lead (soft delete)
   * PATCH /v1/leads/:id/archive
   */
  archiveLead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Archive lead
    const result = await leadsService.archive(id, req.user);

    this.success(res, result, 'Lead archived successfully');
  });

  /**
   * Restore archived lead
   * PATCH /v1/leads/:id/restore
   */
  restoreLead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Restore lead
    const restored = await leadsService.restore(id, req.user);

    this.success(res, restored, 'Lead restored successfully');
  });

  /**
   * Permanently delete lead
   * DELETE /v1/leads/:id
   */
  deleteLead = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete lead
    await leadsService.delete(id, req.user);

    this.success(res, { id }, 'Lead deleted successfully');
  });

  /**
   * Batch delete leads
   * DELETE /v1/leads/batch
   */
  batchDeleteLeads = this.asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids array is required', 400);
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await leadsService.delete(id, req.user);
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
   * Get lead statistics
   * GET /v1/leads/stats
   */
  getStats = this.asyncHandler(async (req, res) => {
    // Get filters
    const filters = this.getFilters(req, [
      'leadStatus',
      'leadSource',
      'isPrivate'
    ]);

    // Calculate stats
    const stats = await leadsService.calculateStats(filters);

    this.success(res, stats);
  });

  /**
   * Update lead status
   * PATCH /v1/leads/:id/status
   */
  updateStatus = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('status is required', 400);
    }

    // Validate status value
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Lost'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Update status
    const updated = await leadsService.update(id, { lead_status: status }, req.user);

    this.success(res, updated, 'Lead status updated successfully');
  });

  /**
   * Convert lead to client
   * POST /v1/leads/:id/convert
   */
  convertToClient = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Get lead
    const lead = await leadsService.findById(id);

    if (!lead) {
      throw new AppError('Lead not found', 404);
    }

    // Update lead status to Converted
    const updated = await leadsService.update(id, { lead_status: 'Converted' }, req.user);

    this.success(res, updated, 'Lead converted successfully');
  });
}

module.exports = new LeadsController();
