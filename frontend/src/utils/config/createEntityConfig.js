/**
 * Base Entity Configuration
 *
 * This file defines the base configuration structure that all entities
 * (escrows, clients, listings, leads, appointments) will extend.
 *
 * Each entity config defines:
 * - Entity metadata (name, labels, icons, colors)
 * - API endpoints and methods
 * - Dashboard configuration (hero cards, stats, filters, views)
 * - Detail page configuration (sections, widgets, actions)
 * - Forms and modals configuration
 * - Permissions and access control
 */

/**
 * Base entity configuration structure
 * All entity configs should follow this structure
 */
export const baseEntityConfig = {
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'entity',              // Singular lowercase name (e.g., 'escrow', 'client')
    namePlural: 'entities',      // Plural lowercase name (e.g., 'escrows', 'clients')
    label: 'Entity',             // Singular display name (e.g., 'Escrow', 'Client')
    labelPlural: 'Entities',     // Plural display name (e.g., 'Escrows', 'Clients')
    icon: 'Home',                // Material-UI icon name
    color: '#1976d2',            // Primary theme color
    colorGradient: {
      start: '#1976d2',
      end: '#42a5f5'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/entities',   // API base path
    endpoints: {
      list: '/entities',
      get: '/entities/:id',
      create: '/entities',
      update: '/entities/:id',
      delete: '/entities/:id',
      archive: '/entities/:id/archive',
      restore: '/entities/:id/restore',
      stats: '/entities/stats'
    },
    methods: {
      list: 'GET',
      get: 'GET',
      create: 'POST',
      update: 'PUT',
      delete: 'DELETE',
      archive: 'PATCH',
      restore: 'PATCH',
      stats: 'GET'
    },
    idField: 'id',               // Primary key field name
    queryParams: {
      status: 'status',
      scope: 'scope',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
      page: 'page',
      limit: 'limit'
    }
  },

  // ========================================
  // DASHBOARD CONFIGURATION
  // ========================================
  dashboard: {
    // Hero Card Configuration
    hero: {
      dateRangeFilters: ['1D', '1M', '1Y', 'YTD', 'Custom'],
      defaultDateRange: '1M',
      showAIManager: true,
      aiManagerLabel: 'AI Entity Manager',
      showAnalyticsButton: true,
      showAddButton: true,
      addButtonLabel: 'Add New Entity'
    },

    // Stats Configuration (displayed in hero card)
    stats: [
      {
        id: 'total',
        label: 'Total Entities',
        field: 'total',
        format: 'number',
        icon: 'Home',
        color: 'primary.main',
        goal: null,
        showGoal: false,
        showTrend: false
      }
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'active', label: 'Active' },
      { value: 'all', label: 'All Entities' }
    ],
    defaultStatus: 'active',

    // Scope Filter Configuration
    scopeOptions: [
      { value: 'team', label: 'Team' },
      { value: 'user', label: 'My Entities' }
    ],
    defaultScope: 'team',

    // Sort Options Configuration
    sortOptions: [
      { value: 'created_at', label: 'Date Created' },
      { value: 'updated_at', label: 'Last Updated' }
    ],
    defaultSort: 'created_at',

    // View Modes Configuration
    viewModes: [
      { value: 'cards', label: 'Cards', icon: 'GridView' },
      { value: 'large', label: 'Full Width', icon: 'ViewList' },
      { value: 'calendar', label: 'Calendar', icon: 'CalendarToday' }
    ],
    defaultViewMode: 'cards',

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'EntityCard',  // Component name to use
      props: {
        showImage: true,
        imageField: 'image_url',
        imageFallback: '/placeholder.jpg',
        showStatus: true,
        showActions: true,
        animationType: 'spring'
      }
    },

    // List Configuration
    list: {
      component: 'EntityList',
      columns: [
        { field: 'name', label: 'Name', width: '30%' },
        { field: 'status', label: 'Status', width: '15%' },
        { field: 'created_at', label: 'Created', width: '20%', format: 'date' }
      ]
    }
  },

  // ========================================
  // DETAIL PAGE CONFIGURATION
  // ========================================
  detail: {
    // Hero Configuration
    hero: {
      showImage: true,
      imageField: 'image_url',
      showStatus: true,
      showActions: true,
      actions: [
        { id: 'edit', label: 'Edit', icon: 'Edit' },
        { id: 'archive', label: 'Archive', icon: 'Archive' },
        { id: 'delete', label: 'Delete', icon: 'Delete' }
      ]
    },

    // Sections Configuration (tabs/accordion sections)
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        icon: 'Info',
        component: 'OverviewSection',
        fields: []
      }
    ],

    // Widgets Configuration (displayed in grid)
    widgets: [
      {
        id: 'details',
        label: 'Details',
        icon: 'Info',
        component: 'DetailsWidget',
        size: { xs: 12, md: 6 },
        order: 1
      }
    ]
  },

  // ========================================
  // FORM CONFIGURATION
  // ========================================
  forms: {
    // Create Form
    create: {
      title: 'Create New Entity',
      fields: [],
      submitLabel: 'Create Entity',
      cancelLabel: 'Cancel',
      validationSchema: null  // Yup schema
    },

    // Edit Form
    edit: {
      title: 'Edit Entity',
      fields: [],
      submitLabel: 'Save Changes',
      cancelLabel: 'Cancel',
      validationSchema: null
    }
  },

  // ========================================
  // PERMISSIONS CONFIGURATION
  // ========================================
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
    archive: true,
    export: true,
    viewSensitive: false  // Financial data, SSN, etc.
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  utils: {
    // Format entity for display
    formatDisplay: (entity) => entity?.name || 'Unnamed Entity',

    // Generate entity route
    getRoute: (id) => `/entities/${id}`,

    // Get entity status color
    getStatusColor: (status) => {
      const colors = {
        active: 'success',
        pending: 'warning',
        closed: 'info',
        archived: 'error'
      };
      return colors[status] || 'default';
    },

    // Filter entities by status
    filterByStatus: (entities, status) => {
      if (status === 'all') return entities;
      if (status === 'archived') {
        return entities.filter(e => e.deleted_at || e.deletedAt);
      }
      return entities.filter(e =>
        (!e.deleted_at && !e.deletedAt) &&
        (e.status === status || status === 'active')
      );
    },

    // Sort entities
    sortBy: (entities, field, order = 'asc') => {
      return [...entities].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }
};

/**
 * Helper function to create entity config by extending base config
 */
export const createEntityConfig = (overrides = {}) => {
  return {
    ...baseEntityConfig,
    ...overrides,
    entity: {
      ...baseEntityConfig.entity,
      ...(overrides.entity || {})
    },
    api: {
      ...baseEntityConfig.api,
      ...(overrides.api || {}),
      endpoints: {
        ...baseEntityConfig.api.endpoints,
        ...(overrides.api?.endpoints || {})
      }
    },
    dashboard: {
      ...baseEntityConfig.dashboard,
      ...(overrides.dashboard || {}),
      hero: {
        ...baseEntityConfig.dashboard.hero,
        ...(overrides.dashboard?.hero || {})
      }
    },
    detail: {
      ...baseEntityConfig.detail,
      ...(overrides.detail || {}),
      hero: {
        ...baseEntityConfig.detail.hero,
        ...(overrides.detail?.hero || {})
      }
    },
    permissions: {
      ...baseEntityConfig.permissions,
      ...(overrides.permissions || {})
    }
  };
};

export default baseEntityConfig;
