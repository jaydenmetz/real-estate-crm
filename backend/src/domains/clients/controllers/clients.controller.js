const BaseDomainController = require('../../../shared/controllers/BaseDomainController');
const clientsService = require('../services/clients.service');
const { AppError } = require('../../../shared/utils/errors');

/**
 * ClientsController
 * Enhanced clients controller extending BaseDomainController
 * Delegates to ClientsService for business logic
 */
class ClientsController extends BaseDomainController {
  constructor() {
    super('ClientsController');
  }

  /**
   * Get all clients with pagination, filtering, and sorting
   * GET /v1/clients
   */
  getAllClients = this.asyncHandler(async (req, res) => {
    // Get pagination
    const pagination = this.getPagination(req);

    // Get sorting
    const sorting = this.getSorting(req, [
      'created_at',
      'updated_at',
      'status',
      'client_type'
    ]);

    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'clientType',
      'search'
    ]);

    // Fetch data
    const result = await clientsService.findAll(filters, {
      ...pagination,
      ...sorting
    });

    // Build response
    this.success(res, {
      clients: result.items,
      stats: result.stats,
      pagination: result.pagination
    });
  });

  /**
   * Get single client by ID
   * GET /v1/clients/:id
   */
  getClientById = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const client = await clientsService.findById(id);

    if (!client) {
      throw new AppError('Client not found', 404);
    }

    // Check ownership
    await this.checkOwnership(client, req.user.id, req.user.team_id);

    this.success(res, client);
  });

  /**
   * Create new client
   * POST /v1/clients
   */
  createClient = this.asyncHandler(async (req, res) => {
    // Validate request
    this.validate(req);

    const clientData = req.body;

    // Check for empty body
    if (!clientData || typeof clientData !== 'object' || Object.keys(clientData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Create client
    const newClient = await clientsService.create(clientData, req.user);

    this.created(res, newClient, 'Client created successfully');
  });

  /**
   * Update existing client
   * PUT /v1/clients/:id
   */
  updateClient = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate request
    this.validate(req);

    const updateData = req.body;

    // Check for empty body
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Update client
    const updated = await clientsService.update(id, updateData, req.user);

    this.success(res, updated, 'Client updated successfully');
  });

  /**
   * Delete client (hard delete)
   * DELETE /v1/clients/:id
   */
  deleteClient = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete client
    await clientsService.delete(id, req.user);

    this.success(res, { id }, 'Client deleted successfully');
  });

  /**
   * Batch delete clients
   * DELETE /v1/clients/batch
   */
  batchDeleteClients = this.asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids array is required', 400);
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await clientsService.delete(id, req.user);
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
   * Get client statistics
   * GET /v1/clients/stats
   */
  getStats = this.asyncHandler(async (req, res) => {
    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'clientType'
    ]);

    // Calculate stats
    const stats = await clientsService.calculateStats(filters);

    this.success(res, stats);
  });
}

module.exports = new ClientsController();
