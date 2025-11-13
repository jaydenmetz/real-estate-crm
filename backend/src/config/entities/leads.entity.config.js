/**
 * Leads Entity Configuration
 */

const { createEntityConfig } = require('./base.entity.config');

const leadsConfig = createEntityConfig({
  name: 'lead',
  namePlural: 'leads',
  tableName: 'leads',
  tableAlias: 'ld',
  displayField: 'first_name',

  fields: {
    id: 'id',
    owner: 'owner_id',
    team: 'team_id',
    broker: 'broker_id',
    status: 'lead_status',
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    version: 'version',
    isPrivate: 'is_private',  // Leads support privacy
    custom: {
      firstName: 'first_name',
      lastName: 'last_name',
      email: 'email',
      phone: 'phone',
      leadSource: 'lead_source',
      leadType: 'lead_type',
      notes: 'notes'
    }
  },

  operations: {
    fieldMappings: {
      firstName: 'first_name',
      lastName: 'last_name',
      leadStatus: 'lead_status',
      leadSource: 'lead_source',
      leadType: 'lead_type',
      isPrivate: 'is_private'
    },
    requiredFields: ['first_name', 'lead_status'],
    immutableFields: ['id', 'created_at']
  },

  query: {
    defaultSort: 'created_at',
    defaultOrder: 'desc',
    allowedSortFields: {
      'created_at': 'created_at',
      'updated_at': 'updated_at',
      'first_name': 'first_name',
      'last_name': 'last_name',
      'lead_status': 'lead_status'
    },
    searchFields: ['first_name', 'last_name', 'email', 'phone'],
    joins: [],
    selectFields: ['*']
  },

  filters: {
    statusValues: ['new', 'contacted', 'qualified', 'converted', 'lost', 'all'],
    custom: [
      {
        name: 'leadType',
        field: 'lead_type',
        operator: '=',
        type: 'string'
      },
      {
        name: 'leadSource',
        field: 'lead_source',
        operator: '=',
        type: 'string'
      }
    ]
  },

  websocket: {
    enabled: true,
    eventPrefix: 'lead',
    broadcastRooms: ['user', 'team', 'broker']
  },

  notifications: {
    enabled: true,
    onCreate: false,
    onUpdate: false,
    onDelete: false
  }
});

module.exports = leadsConfig;
