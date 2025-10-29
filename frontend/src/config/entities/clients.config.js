import { createEntityConfig } from './base.config';
import { clientsAPI } from '../../services/api.service';

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

    // Stats Configuration
    stats: [
      {
        id: 'totalClients',
        label: 'TOTAL ACTIVE CLIENTS',
        field: 'totalClients',
        format: 'number',
        icon: 'People',
        color: '#0891B2',
        goal: 100,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'newThisMonth',
        label: 'NEW THIS MONTH',
        field: 'newThisMonth',
        format: 'number',
        icon: 'PersonAdd',
        color: '#10b981',
        goal: 10,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'totalClientValue',
        label: 'TOTAL CLIENT VALUE',
        field: 'totalClientValue',
        format: 'currency',
        icon: 'TrendingUp',
        color: '#0891B2',
        goal: 5000000,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'avgClientLifetime',
        label: 'AVG CLIENT LIFETIME',
        field: 'avgClientLifetime',
        format: 'currency',
        icon: 'Schedule',
        color: '#06B6D4',
        goal: 50000,
        showGoal: true,
        showTrend: true,
        suffix: 'K',
        showPrivacy: true,
        visibleWhen: ['active', 'all']
      },
      // Lead-specific stats
      {
        id: 'convertedLeads',
        label: 'CONVERTED LEADS',
        field: 'convertedLeads',
        format: 'number',
        icon: 'CheckCircle',
        color: '#10b981',
        goal: 25,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['lead']
      },
      {
        id: 'conversionRate',
        label: 'CONVERSION RATE',
        field: 'conversionRate',
        format: 'percentage',
        icon: 'TrendingUp',
        color: '#0891B2',
        goal: 30,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['lead']
      },
      {
        id: 'potentialValue',
        label: 'POTENTIAL VALUE',
        field: 'potentialValue',
        format: 'currency',
        icon: 'AttachMoney',
        color: '#f59e0b',
        goal: 2000000,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['lead']
      },
      // Inactive-specific stats
      {
        id: 'totalInactive',
        label: 'TOTAL INACTIVE',
        field: 'totalInactive',
        format: 'number',
        icon: 'TrendingDown',
        color: '#ef4444',
        showTrend: true,
        visibleWhen: ['inactive']
      },
      {
        id: 'lostValue',
        label: 'LOST VALUE',
        field: 'lostValue',
        format: 'currency',
        icon: 'Cancel',
        color: '#ef4444',
        showTrend: true,
        visibleWhen: ['inactive']
      },
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'active', label: 'Active Clients' },
      { value: 'lead', label: 'Leads' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'all', label: 'All Clients' }
    ],
    defaultStatus: 'active',

    // Scope Filter Configuration
    getScopeOptions: (user) => {
      if (!user) {
        return [
          { value: 'my', label: 'My Clients' },
          { value: 'team', label: 'Team Clients' },
          { value: 'broker', label: 'Broker Clients' }
        ];
      }

      // Handle both camelCase and snake_case from backend
      const firstName = user.firstName || user.first_name || 'My';
      const lastName = user.lastName || user.last_name || '';
      const fullName = lastName ? `${firstName} ${lastName}` : (user.username || firstName);
      const teamName = user.teamName || user.team_name || 'Team';
      const brokerName = user.brokerName || user.broker_name || 'Broker';

      return [
        {
          value: 'my',
          label: `${firstName}'s Clients`,
          fullLabel: fullName
        },
        {
          value: 'team',
          label: `${teamName}'s Clients`,
          fullLabel: teamName
        },
        {
          value: 'broker',
          label: `${brokerName}'s Clients`,
          fullLabel: brokerName
        }
      ];
    },
    defaultScope: 'my',

    // Sort Options Configuration
    sortOptions: [
      { value: 'created_at', label: 'Date Added' },
      { value: 'updated_at', label: 'Last Updated' },
      { value: 'first_name', label: 'First Name' },
      { value: 'last_name', label: 'Last Name' },
      { value: 'total_value', label: 'Total Value' }
    ],
    defaultSort: 'created_at',

    // View Modes Configuration
    viewModes: [
      { value: 'small', label: 'Grid', icon: 'GridView' },
      { value: 'large', label: 'Full Width', icon: 'ViewList' },
      { value: 'calendar', label: 'Calendar', icon: 'CalendarToday' }
    ],
    defaultViewMode: 'small', // 4 cards per row

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
    hero: {
      showImage: true,
      imageField: 'profile_image_url',
      showStatus: true,
      showActions: true,
      showContact: true
    },

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
    sortBy: (clients, field, order = 'desc') => {
      const sorted = [...clients].sort((a, b) => {
        const aVal = a[field];
        const bVal = b[field];

        if (typeof aVal === 'string') {
          return order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        return order === 'asc'
          ? (aVal || 0) - (bVal || 0)
          : (bVal || 0) - (aVal || 0);
      });
      return sorted;
    }
  }
});