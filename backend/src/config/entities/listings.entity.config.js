/**
 * Listings Entity Configuration
 *
 * Defines all configuration for listings CRUD operations
 */

const { createEntityConfig } = require('./base.entity.config');

const listingsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  name: 'listing',
  namePlural: 'listings',
  tableName: 'listings',
  tableAlias: 'l',
  displayField: 'property_address',

  // ========================================
  // FIELDS CONFIGURATION
  // ========================================
  fields: {
    id: 'id',
    owner: 'listing_agent_id',  // Listings use listing_agent_id instead of owner_id
    team: 'team_id',
    broker: 'broker_id',
    status: 'listing_status',
    deletedAt: 'deleted_at',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    version: 'version',
    custom: {
      propertyAddress: 'property_address',
      listPrice: 'list_price',
      mlsNumber: 'mls_number',
      propertyType: 'property_type',
      bedrooms: 'bedrooms',
      bathrooms: 'bathrooms',
      squareFeet: 'square_feet',
      lotSize: 'lot_size',
      yearBuilt: 'year_built',
      description: 'description',
      features: 'features',
      photos: 'photos',
      listingDate: 'listing_date',
      daysOnMarket: 'days_on_market',
      listingCommission: 'listing_commission',
      buyerCommission: 'buyer_commission',
      totalCommission: 'total_commission',
      virtualTourLink: 'virtual_tour_link',
      professionalPhotos: 'professional_photos',
      dronePhotos: 'drone_photos',
      videoWalkthrough: 'video_walkthrough',
      showingInstructions: 'showing_instructions',
      priceReductionDate: 'price_reduction_date'
    }
  },

  // ========================================
  // CRUD OPERATIONS CONFIG
  // ========================================
  operations: {
    getAll: true,
    getById: true,
    create: true,
    update: true,
    archive: true,
    restore: false,  // Listings don't have restore (archive sets status to 'Cancelled')
    delete: true,
    batchDelete: true,

    // CamelCase → snake_case mappings
    fieldMappings: {
      propertyAddress: 'property_address',
      listPrice: 'list_price',
      listingStatus: 'listing_status',
      propertyType: 'property_type',
      squareFootage: 'square_feet',
      lotSize: 'lot_size',
      yearBuilt: 'year_built',
      listingCommission: 'listing_commission',
      buyerCommission: 'buyer_commission',
      virtualTourLink: 'virtual_tour_link',
      professionalPhotos: 'professional_photos',
      dronePhotos: 'drone_photos',
      videoWalkthrough: 'video_walkthrough',
      showingInstructions: 'showing_instructions',
      priceReductionDate: 'price_reduction_date'
    },

    // Required fields for creation
    requiredFields: ['property_address'],

    // Fields that cannot be updated
    immutableFields: ['id', 'created_at', 'mls_number']
  },

  // ========================================
  // QUERY CONFIGURATION
  // ========================================
  query: {
    defaultSort: 'created_at',
    defaultOrder: 'desc',

    // Allowed sort fields
    allowedSortFields: {
      'created_at': 'l.created_at',
      'list_price': 'l.list_price',
      'listing_date': 'l.listing_date',
      'days_on_market': 'l.days_on_market',
      'property_address': 'l.property_address'
    },

    defaultLimit: 20,

    // Search fields
    searchFields: ['property_address', 'mls_number', 'city', 'state'],

    // JOIN with users to get agent name
    joins: [
      {
        type: 'LEFT',
        table: 'users',
        alias: 'u',
        on: 'l.listing_agent_id = u.id',
        fields: [
          'u.first_name || \' \' || u.last_name AS agent_name',
          'u.email AS agent_email',
          'u.phone AS agent_phone'
        ]
      }
    ],

    // Fields for list view
    selectFields: [
      'l.*',
      'u.first_name || \' \' || u.last_name AS agent_name',
      'u.email AS agent_email',
      'u.phone AS agent_phone'
    ],

    // Fields for detail view (include commission breakdown)
    detailFields: [
      'l.*',
      `json_build_object(
        'listing', l.listing_commission,
        'buyer', l.buyer_commission,
        'total', l.total_commission
      ) as commission`
    ]
  },

  // ========================================
  // FILTERS CONFIGURATION
  // ========================================
  filters: {
    // Valid status values
    statusValues: ['active', 'closed', 'expired', 'all'],

    // Custom filters
    custom: [
      {
        name: 'minPrice',
        field: 'list_price',
        operator: '>=',
        type: 'number'
      },
      {
        name: 'maxPrice',
        field: 'list_price',
        operator: '<=',
        type: 'number'
      },
      {
        name: 'propertyType',
        field: 'property_type',
        operator: '=',
        type: 'string'
      },
      {
        name: 'minDaysOnMarket',
        field: 'days_on_market',
        operator: '>=',
        type: 'number'
      },
      {
        name: 'maxDaysOnMarket',
        field: 'days_on_market',
        operator: '<=',
        type: 'number'
      }
    ]
  },

  // ========================================
  // VALIDATION CONFIGURATION
  // ========================================
  validation: {
    onCreate: (data) => {
      if (!data.propertyAddress && !data.property_address) {
        throw new Error('property_address is required');
      }
      return true;
    },

    onUpdate: null
  },

  // ========================================
  // WEBSOCKET CONFIGURATION
  // ========================================
  websocket: {
    enabled: true,
    eventPrefix: 'listing',
    broadcastRooms: ['user', 'team', 'broker']
  },

  // ========================================
  // NOTIFICATIONS CONFIGURATION
  // ========================================
  notifications: {
    enabled: true,
    onCreate: true,  // Notify broker when listing created
    onUpdate: false,
    onDelete: false,
    onStatusChange: false
  },

  // ========================================
  // CUSTOM HOOKS
  // ========================================
  hooks: {
    beforeCreate: async (data, user) => {
      // Generate MLS number if not provided
      if (!data.mls_number) {
        const prefix = 'MLS';
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        data.mls_number = `${prefix}${year}${random}`;
      }

      // Set days on market
      if (data.listing_status === 'Active' || data.listingStatus === 'Active') {
        data.days_on_market = 0;
      }

      return data;
    },

    afterCreate: null,

    beforeUpdate: async (data, currentRecord, user) => {
      // Update days on market if status changing to Active
      if ((data.listingStatus === 'Active' || data.listing_status === 'Active') &&
          currentRecord.listing_status !== 'Active') {
        data.days_on_market = 0;
        data.listing_date = 'CURRENT_DATE';
      }

      return data;
    },

    afterUpdate: null,

    beforeDelete: null,

    afterDelete: null
  }
});

module.exports = listingsConfig;
