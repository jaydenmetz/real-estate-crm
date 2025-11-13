/**
 * Clients Entity Configuration
 */

const { createEntityConfig } = require('./base.entity.config');

const clientsConfig = createEntityConfig({
  name: 'client',
  namePlural: 'clients',
  tableName: 'clients',
  tableAlias: 'cl',
  displayField: 'full_name',

  fields: {
    id: 'id',
    owner: 'owner_id',
    team: 'team_id',
    broker: 'broker_id',
    status: 'status',
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    version: 'version',
    custom: {
      contactId: 'contact_id',
      clientType: 'client_type',
      leadSource: 'lead_source',
      budget: 'budget',
      preferredLocation: 'preferred_location',
      notes: 'notes'
    }
  },

  operations: {
    fieldMappings: {
      contactId: 'contact_id',
      clientType: 'client_type',
      leadSource: 'lead_source',
      preferredLocation: 'preferred_location'
    },
    requiredFields: ['contact_id'],
    immutableFields: ['id', 'created_at']
  },

  query: {
    defaultSort: 'created_at',
    defaultOrder: 'desc',
    allowedSortFields: {
      'created_at': 'cl.created_at',
      'updated_at': 'cl.updated_at',
      'first_name': 'co.first_name',
      'last_name': 'co.last_name',
      'email': 'co.email',
      'status': 'cl.status',
      'client_type': 'cl.client_type'
    },
    searchFields: ['co.first_name', 'co.last_name', 'co.email'],
    joins: [
      {
        type: 'JOIN',
        table: 'contacts',
        alias: 'co',
        on: 'cl.contact_id = co.id',
        fields: [
          'co.first_name',
          'co.last_name',
          'co.email',
          'co.phone',
          'co.address'
        ]
      }
    ],
    selectFields: [
      'cl.*',
      'co.first_name',
      'co.last_name',
      'co.email',
      'co.phone',
      'co.address'
    ]
  },

  filters: {
    statusValues: ['active', 'inactive', 'archived', 'all'],
    custom: []
  },

  websocket: {
    enabled: true,
    eventPrefix: 'client',
    broadcastRooms: ['user', 'team', 'broker']
  },

  notifications: {
    enabled: true,
    onCreate: false,
    onUpdate: false,
    onDelete: false
  }
});

module.exports = clientsConfig;
