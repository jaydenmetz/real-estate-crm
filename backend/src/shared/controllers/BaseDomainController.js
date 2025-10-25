const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * BaseDomainController
 * Provides common functionality for all domain controllers
 */
class BaseDomainController {
  constructor(serviceName) {
    this.serviceName = serviceName;
    this.logger = typeof logger === 'function' ? logger : console;
  }

  /**
   * Wrap async route handlers to catch errors
   */
  asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Send success response
   */
  success(res, data, message = 'Success', statusCode = 200) {
    res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Send created response
   */
  created(res, data, message = 'Created successfully') {
    this.success(res, data, message, 201);
  }

  /**
   * Send error response
   */
  error(res, message, statusCode = 400, errors = null) {
    res.status(statusCode).json({
      success: false,
      message,
      errors,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Validate request
   */
  validate(req) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError('Validation failed', 422, errors.array());
    }
  }

  /**
   * Get pagination parameters
   */
  getPagination(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
  }

  /**
   * Get sorting parameters
   */
  getSorting(req, allowedFields = []) {
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder === 'asc' ? 'ASC' : 'DESC';

    // Validate sort field if allowedFields specified
    if (allowedFields.length > 0 && !allowedFields.includes(sortBy)) {
      throw new AppError(`Invalid sort field: ${sortBy}`, 400);
    }

    return { sortBy, sortOrder };
  }

  /**
   * Get filter parameters
   */
  getFilters(req, allowedFilters = []) {
    const filters = {};

    // Add user context
    if (req.user) {
      filters.userId = req.user.id;
      filters.teamId = req.user.team_id;
    }

    // Process query filters
    Object.keys(req.query).forEach(key => {
      if (allowedFilters.includes(key) && req.query[key]) {
        filters[key] = req.query[key];
      }
    });

    // Handle date range
    if (req.query.startDate || req.query.endDate) {
      filters.dateRange = {
        start: req.query.startDate ? new Date(req.query.startDate) : null,
        end: req.query.endDate ? new Date(req.query.endDate) : null
      };
    }

    // Handle search
    if (req.query.search) {
      filters.search = req.query.search;
    }

    return filters;
  }

  /**
   * Check ownership
   */
  async checkOwnership(resource, userId, teamId) {
    if (!resource) {
      throw new AppError('Resource not found', 404);
    }

    // Check user ownership
    if (resource.user_id && resource.user_id.toString() !== userId.toString()) {
      // Check team ownership as fallback
      if (!resource.team_id || resource.team_id.toString() !== teamId.toString()) {
        throw new AppError('Access denied', 403);
      }
    }

    return true;
  }

  /**
   * Handle file upload
   */
  handleFileUpload(file) {
    if (!file) {
      throw new AppError('No file uploaded', 400);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError('Invalid file type', 400);
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new AppError('File too large', 400);
    }

    return {
      filename: file.filename,
      originalName: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path
    };
  }

  /**
   * Build response metadata
   */
  buildMetadata(data, pagination) {
    return {
      count: Array.isArray(data) ? data.length : 1,
      page: pagination?.page,
      limit: pagination?.limit,
      totalPages: pagination?.totalPages,
      totalItems: pagination?.totalItems,
      hasNext: pagination?.page < pagination?.totalPages,
      hasPrev: pagination?.page > 1
    };
  }
}

module.exports = BaseDomainController;
