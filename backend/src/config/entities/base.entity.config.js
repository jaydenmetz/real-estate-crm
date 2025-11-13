/**
 * Base Entity Configuration
 *
 * Defines the structure for entity configurations used by the CRUD controller factory.
 * Each entity (listings, clients, leads, appointments) extends this base config.
 */

/**
 * Create entity configuration
 * @param {Object} config - Entity-specific configuration
 * @returns {Object} - Complete entity configuration
 */
function createEntityConfig(config) {
  return {
    // ========================================
    // ENTITY METADATA
    // ========================================
    entity: {
      name: config.name,              // Singular: 'listing', 'client', 'lead', 'appointment'
      namePlural: config.namePlural,  // Plural: 'listings', 'clients', 'leads', 'appointments'
      tableName: config.tableName || config.namePlural,  // Database table name
      tableAlias: config.tableAlias || config.name.charAt(0),  // SQL alias: 'l', 'c', 'a'
      displayField: config.displayField,  // Field to use for display (e.g., 'property_address')
      ...config.entity
    },

    // ========================================
    // FIELDS CONFIGURATION
    // ========================================
    fields: {
      // ID field
      id: config.fields?.id || 'id',

      // Display ID (if different from id)
      displayId: config.fields?.displayId || null,

      // Owner field (usually 'owner_id', but clients use different field)
      owner: config.fields?.owner || 'owner_id',

      // Team field
      team: config.fields?.team || 'team_id',

      // Broker field
      broker: config.fields?.broker || 'broker_id',

      // Created by field
      createdBy: config.fields?.createdBy || 'created_by',

      // Status field
      status: config.fields?.status || 'status',

      // Soft delete field
      deletedAt: config.fields?.deletedAt || 'deleted_at',

      // Timestamps
      createdAt: config.fields?.createdAt || 'created_at',
      updatedAt: config.fields?.updatedAt || 'updated_at',

      // Version field (for optimistic locking)
      version: config.fields?.version || 'version',

      // Privacy field (for leads)
      isPrivate: config.fields?.isPrivate || 'is_private',

      // Custom fields specific to entity
      ...config.fields?.custom
    },

    // ========================================
    // CRUD OPERATIONS CONFIG
    // ========================================
    operations: {
      // Which operations are supported
      getAll: config.operations?.getAll !== false,
      getById: config.operations?.getById !== false,
      create: config.operations?.create !== false,
      update: config.operations?.update !== false,
      archive: config.operations?.archive !== false,
      restore: config.operations?.restore !== false,
      delete: config.operations?.delete !== false,
      batchDelete: config.operations?.batchDelete !== false,

      // Custom field mappings for camelCase → snake_case
      fieldMappings: config.operations?.fieldMappings || {},

      // Required fields for creation
      requiredFields: config.operations?.requiredFields || [],

      // Fields that cannot be updated
      immutableFields: config.operations?.immutableFields || ['id', 'created_at', 'created_by']
    },

    // ========================================
    // QUERY CONFIGURATION
    // ========================================
    query: {
      // Default sort field
      defaultSort: config.query?.defaultSort || 'created_at',

      // Default sort order
      defaultOrder: config.query?.defaultOrder || 'desc',

      // Allowed sort fields
      allowedSortFields: config.query?.allowedSortFields || {},

      // Default pagination limit
      defaultLimit: config.query?.defaultLimit || 20,

      // Search fields (for text search)
      searchFields: config.query?.searchFields || [],

      // JOIN configuration (for getAll with related data)
      joins: config.query?.joins || [],

      // SELECT fields for list view
      selectFields: config.query?.selectFields || ['*'],

      // SELECT fields for detail view
      detailFields: config.query?.detailFields || ['*']
    },

    // ========================================
    // FILTERS CONFIGURATION
    // ========================================
    filters: {
      // Status filter values
      statusValues: config.filters?.statusValues || [],

      // Custom filters
      custom: config.filters?.custom || []
    },

    // ========================================
    // VALIDATION CONFIGURATION
    // ========================================
    validation: {
      // Custom validation function for create
      onCreate: config.validation?.onCreate || null,

      // Custom validation function for update
      onUpdate: config.validation?.onUpdate || null
    },

    // ========================================
    // WEBSOCKET CONFIGURATION
    // ========================================
    websocket: {
      // Enable WebSocket events
      enabled: config.websocket?.enabled !== false,

      // Event name prefix (e.g., 'listing', 'client')
      eventPrefix: config.websocket?.eventPrefix || config.name,

      // Rooms to broadcast to (user, team, broker)
      broadcastRooms: config.websocket?.broadcastRooms || ['user', 'team', 'broker']
    },

    // ========================================
    // NOTIFICATIONS CONFIGURATION
    // ========================================
    notifications: {
      // Enable notifications
      enabled: config.notifications?.enabled !== false,

      // Notification events
      onCreate: config.notifications?.onCreate || false,
      onUpdate: config.notifications?.onUpdate || false,
      onDelete: config.notifications?.onDelete || false,
      onStatusChange: config.notifications?.onStatusChange || false
    },

    // ========================================
    // CUSTOM HOOKS
    // ========================================
    hooks: {
      // Before operations
      beforeCreate: config.hooks?.beforeCreate || null,
      beforeUpdate: config.hooks?.beforeUpdate || null,
      beforeDelete: config.hooks?.beforeDelete || null,

      // After operations
      afterCreate: config.hooks?.afterCreate || null,
      afterUpdate: config.hooks?.afterUpdate || null,
      afterDelete: config.hooks?.afterDelete || null
    }
  };
}

module.exports = {
  createEntityConfig
};
