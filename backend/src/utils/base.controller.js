/**
 * Base Controller Utilities
 *
 * Shared utilities and patterns for all module controllers
 * Reduces code duplication and enforces consistent patterns
 */

const { validationResult } = require('express-validator');
const logger = require('./logger');
const websocketService = require('../services/websocket.service');
const NotificationService = require('../services/notification.service');
const { buildOwnershipWhereClauseWithAlias, validateScope, getDefaultScope } = require('./ownership.helper');

/**
 * Standard validation error handler
 * Returns 422 with validation errors if present
 */
function handleValidationErrors(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array(),
      },
    });
  }
  return null;
}

/**
 * Standard pagination parameters
 * Extracts and validates pagination from query params
 */
function getPaginationParams(req, defaultLimit = 20) {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || defaultLimit;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build ownership filter for multi-tenant queries
 * Handles user/team/broker scope filtering
 *
 * @param {Object} req - Express request object
 * @param {string} entityType - Entity type (escrow, listing, client, etc.)
 * @param {string} tableAlias - SQL table alias
 * @param {number} paramIndex - Starting parameter index
 * @returns {Object} { whereClause, params, nextParamIndex }
 */
function buildOwnershipFilter(req, entityType, tableAlias, paramIndex) {
  const userRole = req.user?.role;
  const requestedScope = req.query.scope || getDefaultScope(userRole);
  const scope = validateScope(requestedScope, userRole);

  return buildOwnershipWhereClauseWithAlias(
    req.user,
    scope,
    entityType,
    tableAlias,
    paramIndex
  );
}

/**
 * Build dynamic UPDATE query from request body
 * Handles camelCase to snake_case conversion
 *
 * @param {Object} updates - Object with fields to update
 * @param {Object} columnMap - Mapping of camelCase to snake_case
 * @param {Array} excludeFields - Fields to exclude (e.g., 'id')
 * @returns {Object} { updateFields, values, paramCount }
 */
function buildUpdateQuery(updates, columnMap = {}, excludeFields = ['id']) {
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  Object.entries(updates).forEach(([key, value]) => {
    const column = columnMap[key] || key;
    if (!excludeFields.includes(key) && column) {
      updateFields.push(`${column} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  return { updateFields, values, paramCount };
}

/**
 * Standard sorting parameters
 * Validates sort column and direction
 *
 * @param {Object} req - Express request object
 * @param {Object} allowedColumns - Map of allowed sort columns
 * @param {string} defaultColumn - Default column if invalid
 * @returns {Object} { sortColumn, sortDirection }
 */
function getSortParams(req, allowedColumns, defaultColumn = 'created_at') {
  const sortBy = req.query.sortBy || req.query.sort || defaultColumn;
  const sortOrder = req.query.sortOrder || req.query.order || 'desc';

  const sortColumn = allowedColumns[sortBy] || allowedColumns[defaultColumn];
  const sortDirection = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

  return { sortColumn, sortDirection };
}

/**
 * Send WebSocket update to user/team/broker rooms
 * Implements 3-tier notification system
 *
 * @param {string} entityType - Type of entity (escrow, listing, client, etc.)
 * @param {string} entityId - Entity ID
 * @param {string} action - Action performed (created, updated, deleted)
 * @param {Object} data - Event data
 * @param {Object} user - User object with id, team_id, broker_id
 */
function emitWebSocketUpdate(entityType, entityId, action, data, user) {
  const eventData = {
    entityType,
    entityId,
    action,
    data
  };

  // Send to broker room (all users under this broker)
  if (user.broker_id || user.brokerId) {
    const brokerId = user.broker_id || user.brokerId;
    websocketService.sendToBroker(brokerId, 'data:update', eventData);
  }

  // Send to team room if user has a team
  if (user.team_id || user.teamId) {
    const teamId = user.team_id || user.teamId;
    websocketService.sendToTeam(teamId, 'data:update', eventData);
  }

  // Always send to user's personal room as fallback
  if (user.id) {
    websocketService.sendToUser(user.id, 'data:update', eventData);
  }
}

/**
 * Standard error response
 * Logs error and sends consistent error response
 *
 * @param {Object} res - Express response object
 * @param {Error} error - Error object
 * @param {string} code - Error code
 * @param {string} message - User-facing error message
 * @param {number} statusCode - HTTP status code (default 500)
 */
function sendErrorResponse(res, error, code, message, statusCode = 500) {
  logger.error(`${code}:`, error);
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
    },
    timestamp: new Date().toISOString(),
  });
}

/**
 * Standard success response
 * Sends consistent success response
 *
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {number} statusCode - HTTP status code (default 200)
 */
function sendSuccessResponse(res, data, statusCode = 200) {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Build pagination response object
 *
 * @param {number} total - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Records per page
 * @returns {Object} Pagination metadata
 */
function buildPaginationResponse(total, page, limit) {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    pages: Math.ceil(total / parseInt(limit)),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
}

/**
 * Extract user context from request
 * Standardizes user data access across controllers
 *
 * @param {Object} req - Express request object
 * @returns {Object} User context
 */
function getUserContext(req) {
  return {
    userId: req.user?.id,
    teamId: req.user?.team_id || req.user?.teamId,
    brokerId: req.user?.broker_id || req.user?.brokerId,
    role: req.user?.role,
    email: req.user?.email,
    firstName: req.user?.first_name || req.user?.firstName,
    lastName: req.user?.last_name || req.user?.lastName,
  };
}

/**
 * Common camelCase to snake_case mappings
 * Used across multiple modules
 */
const commonColumnMappings = {
  // Common fields
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  ownerId: 'owner_id',
  teamId: 'team_id',
  brokerId: 'broker_id',
  createdBy: 'created_by',
  lastModifiedBy: 'last_modified_by',

  // Contact fields
  firstName: 'first_name',
  lastName: 'last_name',
  phoneNumber: 'phone_number',

  // Property fields
  propertyAddress: 'property_address',
  closingDate: 'closing_date',
  purchasePrice: 'purchase_price',

  // Status fields
  escrowStatus: 'escrow_status',
  listingStatus: 'listing_status',
  clientStatus: 'client_status',
  leadStatus: 'lead_status',
  appointmentStatus: 'appointment_status',
};

module.exports = {
  handleValidationErrors,
  getPaginationParams,
  buildOwnershipFilter,
  buildUpdateQuery,
  getSortParams,
  emitWebSocketUpdate,
  sendErrorResponse,
  sendSuccessResponse,
  buildPaginationResponse,
  getUserContext,
  commonColumnMappings,
};
