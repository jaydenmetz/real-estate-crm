/**
 * Appointments Entity Configuration
 */

const { createEntityConfig } = require('./base.entity.config');

const appointmentsConfig = createEntityConfig({
  name: 'appointment',
  namePlural: 'appointments',
  tableName: 'appointments',
  tableAlias: 'a',
  displayField: 'title',

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
      title: 'title',
      appointmentDate: 'appointment_date',
      startTime: 'start_time',
      endTime: 'end_time',
      location: 'location',
      notes: 'notes',
      clientId: 'client_id',
      leadId: 'lead_id',
      appointmentType: 'appointment_type'
    }
  },

  operations: {
    fieldMappings: {
      appointmentDate: 'appointment_date',
      startTime: 'start_time',
      endTime: 'end_time',
      clientId: 'client_id',
      leadId: 'lead_id',
      appointmentType: 'appointment_type'
    },
    requiredFields: ['title', 'appointment_date'],
    immutableFields: ['id', 'created_at']
  },

  query: {
    defaultSort: 'appointment_date',
    defaultOrder: 'desc',
    allowedSortFields: {
      'appointment_date': 'a.appointment_date',
      'start_time': 'a.start_time',
      'created_at': 'a.created_at',
      'status': 'a.status'
    },
    searchFields: ['title', 'location', 'notes'],
    joins: [
      {
        type: 'LEFT',
        table: 'clients',
        alias: 'cl',
        on: 'a.client_id = cl.id',
        fields: []
      },
      {
        type: 'LEFT',
        table: 'contacts',
        alias: 'c',
        on: 'cl.contact_id = c.id',
        fields: [
          'COALESCE(c.full_name, c.first_name || \' \' || c.last_name) AS client_name'
        ]
      }
    ],
    selectFields: [
      'a.*',
      'COALESCE(c.full_name, c.first_name || \' \' || c.last_name) AS client_name'
    ]
  },

  filters: {
    statusValues: ['scheduled', 'completed', 'cancelled', 'no-show', 'all'],
    custom: [
      {
        name: 'startDate',
        field: 'appointment_date',
        operator: '>=',
        type: 'date'
      },
      {
        name: 'endDate',
        field: 'appointment_date',
        operator: '<=',
        type: 'date'
      },
      {
        name: 'appointmentType',
        field: 'appointment_type',
        operator: '=',
        type: 'string'
      }
    ]
  },

  websocket: {
    enabled: true,
    eventPrefix: 'appointment',
    broadcastRooms: ['user', 'team', 'broker']
  },

  notifications: {
    enabled: true,
    onCreate: false,
    onUpdate: false,
    onDelete: false
  }
});

module.exports = appointmentsConfig;
