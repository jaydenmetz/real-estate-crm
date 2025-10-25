const BaseDomainController = require('../../../shared/controllers/BaseDomainController');
const appointmentsService = require('../services/appointments.service');
const { AppError } = require('../../../shared/utils/errors');

/**
 * AppointmentsController
 * Enhanced appointments controller extending BaseDomainController
 * Delegates to AppointmentsService for business logic
 */
class AppointmentsController extends BaseDomainController {
  constructor() {
    super('AppointmentsController');
  }

  /**
   * Get all appointments with pagination, filtering, and sorting
   * GET /v1/appointments
   */
  getAppointments = this.asyncHandler(async (req, res) => {
    // Get pagination
    const pagination = this.getPagination(req);

    // Get sorting
    const sorting = this.getSorting(req, [
      'appointment_date',
      'created_at',
      'start_time',
      'status'
    ]);

    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'appointmentType',
      'startDate',
      'endDate',
      'clientId',
      'listingId',
      'search'
    ]);

    // Fetch data
    const result = await appointmentsService.findAll(filters, {
      ...pagination,
      ...sorting
    });

    // Build response
    this.success(res, {
      appointments: result.items,
      stats: result.stats,
      pagination: result.pagination
    });
  });

  /**
   * Get single appointment by ID
   * GET /v1/appointments/:id
   */
  getAppointment = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    const appointment = await appointmentsService.findById(id);

    if (!appointment) {
      throw new AppError('Appointment not found', 404);
    }

    // Check ownership
    await this.checkOwnership(appointment, req.user.id, req.user.team_id);

    this.success(res, appointment);
  });

  /**
   * Create new appointment
   * POST /v1/appointments
   */
  createAppointment = this.asyncHandler(async (req, res) => {
    // Validate request
    this.validate(req);

    const appointmentData = req.body;

    // Check for empty body
    if (!appointmentData || typeof appointmentData !== 'object' || Object.keys(appointmentData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Create appointment
    const newAppointment = await appointmentsService.create(appointmentData, req.user);

    this.created(res, newAppointment, 'Appointment created successfully');
  });

  /**
   * Update existing appointment
   * PUT /v1/appointments/:id
   */
  updateAppointment = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Validate request
    this.validate(req);

    const updateData = req.body;

    // Check for empty body
    if (!updateData || typeof updateData !== 'object' || Object.keys(updateData).length === 0) {
      throw new AppError('Request body cannot be empty', 400);
    }

    // Update appointment
    const updated = await appointmentsService.update(id, updateData, req.user);

    this.success(res, updated, 'Appointment updated successfully');
  });

  /**
   * Archive appointment (soft delete)
   * PATCH /v1/appointments/:id/archive
   */
  archiveAppointment = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Archive appointment
    const result = await appointmentsService.archive(id, req.user);

    this.success(res, result, 'Appointment archived successfully');
  });

  /**
   * Restore archived appointment
   * PATCH /v1/appointments/:id/restore
   */
  restoreAppointment = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Restore appointment
    const restored = await appointmentsService.restore(id, req.user);

    this.success(res, restored, 'Appointment restored successfully');
  });

  /**
   * Permanently delete appointment
   * DELETE /v1/appointments/:id
   */
  deleteAppointment = this.asyncHandler(async (req, res) => {
    const { id } = req.params;

    // Delete appointment
    await appointmentsService.delete(id, req.user);

    this.success(res, { id }, 'Appointment deleted successfully');
  });

  /**
   * Batch delete appointments
   * DELETE /v1/appointments/batch
   */
  batchDeleteAppointments = this.asyncHandler(async (req, res) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError('ids array is required', 400);
    }

    const results = [];
    const errors = [];

    for (const id of ids) {
      try {
        await appointmentsService.delete(id, req.user);
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
   * Get appointment statistics
   * GET /v1/appointments/stats
   */
  getStats = this.asyncHandler(async (req, res) => {
    // Get filters
    const filters = this.getFilters(req, [
      'status',
      'appointmentType',
      'startDate',
      'endDate'
    ]);

    // Calculate stats
    const stats = await appointmentsService.calculateStats(filters);

    this.success(res, stats);
  });

  /**
   * Update appointment status
   * PATCH /v1/appointments/:id/status
   */
  updateStatus = this.asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      throw new AppError('status is required', 400);
    }

    // Validate status value
    const validStatuses = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 400);
    }

    // Update status
    const updated = await appointmentsService.update(id, { status }, req.user);

    this.success(res, updated, 'Appointment status updated successfully');
  });
}

module.exports = new AppointmentsController();
