/**
 * Data Access Logging Middleware
 * Automatically logs CRUD operations on sensitive resources
 *
 * Usage:
 *   router.get('/:id', authenticate, logDataAccess('client'), getClientById);
 *   router.post('/', authenticate, logDataAccess('client'), createClient);
 *
 * NOTE: Uses fire-and-forget pattern - never blocks requests
 */

const SecurityEventService = require('../services/securityEvent.service');

/**
 * Resource type mapping for friendly names
 */
const RESOURCE_TYPES = {
  client: 'Client',
  escrow: 'Escrow',
  listing: 'Listing',
  lead: 'Lead',
  appointment: 'Appointment',
  contact: 'Contact',
};

/**
 * Create data access logging middleware for a specific resource type
 * @param {string} resourceType - Type of resource being accessed (client, escrow, etc.)
 */
const logDataAccess = (resourceType) => (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json.bind(res);

  // Override res.json to capture response data
  res.json = function (data) {
    // Log the data access event (fire-and-forget)
    try {
      logAccessEvent(req, res, resourceType, data).catch(console.error);
    } catch (error) {
      console.error('Error in data access logging middleware:', error);
    }

    // Call original res.json
    return originalJson(data);
  };

  next();
};

/**
 * Log the access event based on request method and response
 */
async function logAccessEvent(req, res, resourceType, responseData) {
  // Only log successful operations (2xx status codes)
  if (res.statusCode < 200 || res.statusCode >= 300) {
    return;
  }

  // Don't log if response is not successful
  if (responseData && responseData.success === false) {
    return;
  }

  const method = req.method;
  const resourceId = req.params.id || responseData?.data?.id;
  const resourceName = getResourceName(responseData, resourceType);

  // Determine operation type and log accordingly
  switch (method) {
    case 'GET':
      if (resourceId) {
        // Read single resource (fire-and-forget)
        SecurityEventService.logDataRead(
          req,
          RESOURCE_TYPES[resourceType] || resourceType,
          resourceId,
          resourceName
        ).catch(console.error);
      }
      // Don't log list operations to avoid spam (could add flag to enable)
      break;

    case 'POST':
      // Create operation (fire-and-forget)
      if (resourceId) {
        SecurityEventService.logDataCreated(
          req,
          RESOURCE_TYPES[resourceType] || resourceType,
          resourceId,
          resourceName
        ).catch(console.error);
      }
      break;

    case 'PUT':
    case 'PATCH':
      // Update operation (fire-and-forget)
      if (resourceId) {
        const changes = extractChanges(req.body);
        SecurityEventService.logDataUpdated(
          req,
          RESOURCE_TYPES[resourceType] || resourceType,
          resourceId,
          resourceName,
          changes
        ).catch(console.error);
      }
      break;

    case 'DELETE':
      // Delete operation (fire-and-forget)
      if (resourceId) {
        SecurityEventService.logDataDeleted(
          req,
          RESOURCE_TYPES[resourceType] || resourceType,
          resourceId,
          resourceName
        ).catch(console.error);
      }
      break;

    default:
      // Don't log other methods (HEAD, OPTIONS, etc.)
      break;
  }
}

/**
 * Extract resource name from response data
 */
function getResourceName(responseData, resourceType) {
  if (!responseData || !responseData.data) {
    return null;
  }

  const data = Array.isArray(responseData.data) ? responseData.data[0] : responseData.data;

  if (!data) {
    return null;
  }

  // Try common name fields
  switch (resourceType) {
    case 'client':
    case 'contact':
      return data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || null;

    case 'escrow':
      return data.property_address || data.address || null;

    case 'listing':
      return data.address || data.property_address || null;

    case 'lead':
      return data.name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || null;

    case 'appointment':
      return data.title || data.type || null;

    default:
      return data.name || data.title || null;
  }
}

/**
 * Extract meaningful changes from request body
 * (Excludes timestamps, metadata)
 */
function extractChanges(body) {
  if (!body || typeof body !== 'object') {
    return {};
  }

  const excludeFields = [
    'created_at', 'updated_at', 'deleted_at',
    'password', 'password_hash', 'token',
    'metadata', 'internal_notes'
  ];

  const changes = {};
  Object.keys(body).forEach(key => {
    if (!excludeFields.includes(key) && body[key] !== undefined) {
      changes[key] = typeof body[key] === 'object' ? '[Object]' : body[key];
    }
  });

  return changes;
}

module.exports = { logDataAccess };
