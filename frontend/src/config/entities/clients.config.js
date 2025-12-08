import { createEntityConfig } from '../../utils/config/createEntityConfig';
import { clientsAPI } from '../../services/api.service';
import { createSortFunction } from '../../utils/sortUtils';

// Import dashboard stat components
import {
  TotalClientsCard,
  ActiveClientsCard,
  NewThisMonthCard,
  ClientValueCard
} from '../../components/dashboards/clients/hero/stats';

// Import navigation configurations
import {
  clientStatusTabs,
  clientSortOptions,
  clientDefaultSort,
  getClientScopeOptions,
  clientDefaultScope,
  clientViewModes,
  clientDefaultViewMode
} from '../../components/dashboards/clients/navigation';

export const clientsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'client',
    namePlural: 'clients',
    label: 'Client',
    labelPlural: 'Clients',
    icon: 'People',
    color: '#0891B2',
    colorGradient: {
      start: '#0891B2',
      end: '#06B6D4'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/clients',
    // Use api.service methods directly
    getAll: (params) => clientsAPI.getAll(params),
    getById: (id) => clientsAPI.getById(id),
    create: (data) => clientsAPI.create(data),
    update: (id, data) => clientsAPI.update(id, data),
    delete: (id) => clientsAPI.delete(id),
    archive: (id) => clientsAPI.archive(id),
    restore: (id) => clientsAPI.restore(id),
    endpoints: {
      list: '/clients',
      get: '/clients/:id',
      create: '/clients',
      update: '/clients/:id',
      delete: '/clients/:id',
      archive: '/clients/:id/archive',
      restore: '/clients/:id/restore',
      stats: '/clients/stats',
    },
    idField: 'id',
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
      aiManagerLabel: 'AI Client Manager',
      aiManagerDescription: 'Hire an AI assistant to manage client relationships, send reminders, and track touchpoints.',
      showAnalyticsButton: true,
      analyticsButtonLabel: 'CLIENT ANALYTICS',
      showAddButton: true,
      addButtonLabel: 'ADD NEW CLIENT'
    },

    // Stats Configuration (component-based for reusability)
    // visibleWhen uses lowercase category keys to match database category_key values
    stats: [
      // ========================================
      // ACTIVE TAB STATS
      // ========================================
      {
        id: 'total_active_clients',
        component: TotalClientsCard,
        props: { status: 'active' },
        visibleWhen: ['active']
      },
      {
        id: 'active_clients_count',
        component: ActiveClientsCard,
        props: {},
        visibleWhen: ['active']
      },
      {
        id: 'new_this_month_active',
        component: NewThisMonthCard,
        props: {},
        visibleWhen: ['active']
      },
      {
        id: 'total_client_value_active',
        component: ClientValueCard,
        props: {},
        visibleWhen: ['active']
      },

      // ========================================
      // CLOSED TAB STATS (won category)
      // ========================================
      {
        id: 'total_closed_clients',
        component: TotalClientsCard,
        props: { status: 'closed' },
        visibleWhen: ['won']
      },
      {
        id: 'closed_active_count',
        component: ActiveClientsCard,
        props: {},
        visibleWhen: ['won']
      },
      {
        id: 'new_this_month_closed',
        component: NewThisMonthCard,
        props: {},
        visibleWhen: ['won']
      },
      {
        id: 'total_client_value_closed',
        component: ClientValueCard,
        props: {},
        visibleWhen: ['won']
      },

      // ========================================
      // INACTIVE TAB STATS (lost category)
      // ========================================
      {
        id: 'total_inactive_clients',
        component: TotalClientsCard,
        props: { status: 'inactive' },
        visibleWhen: ['lost']
      },
      {
        id: 'inactive_active_count',
        component: ActiveClientsCard,
        props: {},
        visibleWhen: ['lost']
      },
      {
        id: 'new_this_month_inactive',
        component: NewThisMonthCard,
        props: {},
        visibleWhen: ['lost']
      },
      {
        id: 'total_client_value_inactive',
        component: ClientValueCard,
        props: {},
        visibleWhen: ['lost']
      },

      // ========================================
      // ALL CLIENTS TAB STATS
      // ========================================
      {
        id: 'total_all_clients',
        component: TotalClientsCard,
        props: { status: 'all' },
        visibleWhen: ['all']
      },
      {
        id: 'all_active_count',
        component: ActiveClientsCard,
        props: {},
        visibleWhen: ['all']
      },
      {
        id: 'new_this_month_all',
        component: NewThisMonthCard,
        props: {},
        visibleWhen: ['all']
      },
      {
        id: 'total_client_value_all',
        component: ClientValueCard,
        props: {},
        visibleWhen: ['all']
      },
    ],

    // Status Tabs Configuration (from centralized config)
    statusTabs: clientStatusTabs,
    defaultStatus: 'active',

    // Scope Filter Configuration (from navigation)
    getScopeOptions: getClientScopeOptions,
    defaultScope: clientDefaultScope,

    // Sort Options Configuration (from navigation)
    sortOptions: clientSortOptions,
    defaultSort: clientDefaultSort,

    // View Modes Configuration (from navigation)
    viewModes: clientViewModes,
    defaultViewMode: clientDefaultViewMode,

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'ClientCard',
      props: {
        showImage: true,
        imageField: 'profile_image_url',
        imageFallback: 'https://via.placeholder.com/400x300?text=Client',
        showStatus: true,
        showActions: true,
        animationType: 'spring',
        showMetrics: true,
        inlineEditing: false
      }
    }
  },

  // ========================================
  // DETAIL PAGE CONFIGURATION
  // ========================================
  detail: {
    // Hero Section Configuration (matching escrows design)
    hero: {
      showImage: true,
      imageField: 'avatar',
      placeholderIcon: '👤',
      titleField: 'name',
      statusField: 'status',
      displayIdField: null, // No ID for clients

      // Status color mapping
      statusColors: {
        active: '#4caf50',
        inactive: '#9e9e9e',
        pending: '#ff9800',
        archived: '#757575',
      },

      // Subtitle info (shown below title)
      subtitleFields: [
        { field: (entity) => `${entity.city || ''}, ${entity.state || 'CA'}`.trim(), icon: 'MapPin' },
        { field: (entity) => entity.email || '', icon: 'User' },
      ],

      // Hero stats (stat cards)
      stats: [
        {
          label: 'PURCHASE PRICE',
          field: 'lifetimeValue',
          format: 'currency',
          defaultValue: 0,
        },
        {
          label: 'YOUR COMMISSION',
          field: 'totalVolume',
          format: 'currency',
          color: '#4caf50',
          defaultValue: 0,
        },
        {
          label: 'PROGRESS',
          field: (entity) => 0, // TODO: Calculate progress
          format: 'percent',
          defaultValue: 0,
        },
        {
          label: 'DAYS SINCE CONTACT',
          field: (entity) => entity.lastContact ? Math.floor((new Date() - new Date(entity.lastContact)) / (1000 * 60 * 60 * 24)) : 0,
          format: 'number',
          defaultValue: 0,
        },
      ],
    },

    // Left Sidebar (Quick Actions)
    leftSidebar: {
      title: 'Quick Actions',
      component: null, // TODO: Create QuickActionsComponent
    },

    // Right Sidebar (Smart Context)
    rightSidebar: {
      title: 'Smart Context',
      component: null, // TODO: Create SmartContextComponent
    },

    // Widgets (2x2 grid)
    widgets: [
      {
        id: 'timeline',
        title: 'Timeline',
        component: null, // TODO: Create TimelineWidget
      },
      {
        id: 'properties',
        title: 'Properties',
        component: null, // TODO: Create PropertiesWidget
      },
      {
        id: 'checklists',
        title: 'Checklists',
        component: null, // TODO: Create ChecklistsWidget
      },
      {
        id: 'documents',
        title: 'Documents',
        component: null, // TODO: Create DocumentsWidget
      },
    ],

    // Activity Feed (bottom expandable tab)
    activityFeed: {
      component: null, // TODO: Create ActivityFeedComponent
    },

    // Legacy sections config (kept for compatibility)
    sections: [
      {
        id: 'contact',
        label: 'Contact Information',
        icon: 'ContactPhone',
        fields: [
          { key: 'email', label: 'Email', type: 'email' },
          { key: 'phone', label: 'Phone', type: 'phone' },
          { key: 'address', label: 'Address', type: 'address' }
        ]
      },
      {
        id: 'transactions',
        label: 'Transactions',
        icon: 'Receipt',
        type: 'list',
        dataSource: 'transactions'
      },
      {
        id: 'notes',
        label: 'Notes',
        icon: 'Notes',
        type: 'notes',
        dataSource: 'notes'
      }
    ],

    widgets: [
      {
        id: 'value',
        label: 'Client Value',
        icon: 'AttachMoney',
        component: 'ValueWidget',
        order: 1
      },
      {
        id: 'activity',
        label: 'Recent Activity',
        icon: 'History',
        component: 'ActivityWidget',
        order: 2
      },
      {
        id: 'relationships',
        label: 'Relationships',
        icon: 'People',
        component: 'RelationshipsWidget',
        order: 3
      }
    ]
  },

  // ========================================
  // FORMS CONFIGURATION
  // ========================================
  forms: {
    create: {
      title: 'Add New Client',
      fields: [
        { key: 'first_name', label: 'First Name', type: 'text', required: true },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'Phone', type: 'phone' },
        { key: 'client_status', label: 'Status', type: 'select', options: ['active', 'lead', 'inactive'], default: 'lead' },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ]
    },
    edit: {
      title: 'Edit Client',
      fields: [
        { key: 'first_name', label: 'First Name', type: 'text', required: true },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email', required: true },
        { key: 'phone', label: 'Phone', type: 'phone' },
        { key: 'client_status', label: 'Status', type: 'select', options: ['active', 'lead', 'inactive'] },
        { key: 'address', label: 'Address', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ]
    }
  },

  // ========================================
  // PERMISSIONS
  // ========================================
  permissions: {
    create: true,
    read: true,
    update: true,
    delete: true,
    archive: true,
    export: true,
    viewSensitive: false
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  utils: {
    formatDisplay: (client) => `${client?.first_name || ''} ${client?.last_name || ''}`.trim() || 'Unnamed Client',
    getRoute: (id) => `/clients/${id}`,
    getStatusColor: (status) => {
      const colors = {
        'active': 'success',
        'lead': 'info',
        'inactive': 'default'
      };
      return colors[status] || 'default';
    },
    getStatusLabel: (status) => {
      const labels = {
        'active': 'Active',
        'lead': 'Lead',
        'inactive': 'Inactive'
      };
      return labels[status] || status;
    },
    calculateTotalValue: (transactions) => {
      return (transactions || []).reduce((sum, t) => sum + (t.amount || 0), 0);
    },
    filterByStatus: (clients, status) => {
      if (status === 'all') return clients;
      return clients.filter(c => c.client_status === status);
    },
    // Sort clients using centralized sort utility
    // Automatically handles: status fields, dates, currency, strings
    // Status priority is derived from category sortOrder in statusCategories.js
    sortBy: createSortFunction('clients')
  }
});