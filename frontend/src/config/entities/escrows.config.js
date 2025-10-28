/**
 * Escrows Entity Configuration
 *
 * Complete configuration for the escrows entity including:
 * - Dashboard layout and stats
 * - Detail page widgets and sections
 * - Forms and validation
 * - API endpoints
 * - Permissions
 */

import { createEntityConfig } from './base.config';
import { api } from '../../services/api.service';

export const escrowsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'escrow',
    namePlural: 'escrows',
    label: 'Escrow',
    labelPlural: 'Escrows',
    icon: 'Home',
    color: '#1976d2',
    colorGradient: {
      start: '#1976d2',
      end: '#42a5f5'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/escrows',
    // Use api.service methods directly
    getAll: (params) => api.escrowsAPI.getAll(params),
    getById: (id) => api.escrowsAPI.getById(id),
    create: (data) => api.escrowsAPI.create(data),
    update: (id, data) => api.escrowsAPI.update(id, data),
    delete: (id) => api.escrowsAPI.delete(id),
    archive: (id) => api.escrowsAPI.archive(id),
    restore: (id) => api.escrowsAPI.restore(id),
    endpoints: {
      list: '/escrows',
      get: '/escrows/:id',
      create: '/escrows',
      update: '/escrows/:id',
      delete: '/escrows/:id',
      archive: '/escrows/:id/archive',
      restore: '/escrows/:id/restore',
      stats: '/escrows/stats',
      // Escrow-specific endpoints
      people: '/escrows/:id/people',
      financials: '/escrows/:id/financials',
      timeline: '/escrows/:id/timeline',
      checklists: '/escrows/:id/checklists'
    },
    idField: 'escrow_id',
    queryParams: {
      status: 'status',
      scope: 'scope',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
      page: 'page',
      limit: 'limit',
      startDate: 'startDate',
      endDate: 'endDate'
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
      showAIAssistant: true,
      aiAssistantLabel: 'AI Escrow Manager',
      aiAssistantDescription: 'Hire an AI assistant to manage escrows, track deadlines, and automate document workflows.',
      showAnalyticsButton: true,
      analyticsButtonLabel: 'ESCROW ANALYTICS',
      showAddButton: true,
      addButtonLabel: 'NEW ESCROW'
    },

    // Stats Configuration (dynamic based on selectedStatus)
    stats: [
      // When selectedStatus === 'active'
      {
        id: 'total',
        label: 'TOTAL ESCROWS',
        field: 'total',
        format: 'number',
        icon: 'Home',
        color: 'primary.main',
        goal: 50,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'active',
        label: 'ACTIVE ESCROWS',
        field: 'active',
        format: 'number',
        icon: 'CheckCircle',
        color: 'success.main',
        goal: 30,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'active_volume',
        label: 'ACTIVE VOLUME',
        field: 'activeVolume',
        format: 'currency',
        icon: 'AttachMoney',
        color: 'success.main',
        goal: 10000000,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active']
      },
      {
        id: 'avg_days_to_close',
        label: 'AVG DAYS TO CLOSE',
        field: 'avgDaysToClose',
        format: 'number',
        icon: 'Schedule',
        suffix: ' days',
        color: 'info.main',
        goal: 30,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active']
      },
      {
        id: 'closed_volume',
        label: 'Closed Volume',
        field: 'closedVolume',
        format: 'currency',
        icon: 'TrendingUp',
        color: 'primary.main',
        goal: 20000000,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['closed']
      },
      // Add more stats as needed for different statuses
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'closed', label: 'Closed' },
      { value: 'all', label: 'All Escrows' },
      { value: 'archived', label: 'Archived' } // For mobile tab display
    ],
    defaultStatus: 'active',

    // Scope Filter Configuration
    scopeOptions: [
      { value: 'team', label: 'Team' },
      { value: 'my', label: 'My Escrows' }
    ],
    defaultScope: 'team',

    // Sort Options Configuration
    sortOptions: [
      { value: 'created_at', label: 'Created' },
      { value: 'closing_date', label: 'Closing Date' },
      { value: 'purchase_price', label: 'Purchase Price' },
      { value: 'property_address', label: 'Property Address' }
    ],
    defaultSort: 'created_at',

    // View Modes Configuration
    viewModes: [
      { value: 'grid', label: 'Grid', icon: 'GridView' },
      { value: 'list', label: 'List', icon: 'ViewList' }
    ],
    defaultViewMode: 'grid',

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'EscrowCard',
      props: {
        showImage: true,
        imageField: 'property_image_url',
        imageFallback: 'https://via.placeholder.com/400x300?text=Property',
        showStatus: true,
        showActions: true,
        animationType: 'spring',
        showFinancials: true,
        showTimeline: true,
        inlineEditing: true
      }
    }
  },

  // ========================================
  // DETAIL PAGE CONFIGURATION
  // ========================================
  detail: {
    // Hero Configuration
    hero: {
      showImage: true,
      imageField: 'property_image_url',
      showStatus: true,
      showActions: true,
      showBreadcrumbs: true,
      actions: [
        { id: 'edit', label: 'Edit', icon: 'Edit', color: 'primary' },
        { id: 'archive', label: 'Archive', icon: 'Archive', color: 'warning' },
        { id: 'delete', label: 'Delete', icon: 'Delete', color: 'error' }
      ],
      fields: [
        { field: 'property_address', label: 'Property Address', type: 'text', editable: true },
        { field: 'closing_date', label: 'Closing Date', type: 'date', editable: true },
        { field: 'purchase_price', label: 'Purchase Price', type: 'currency', editable: true },
        { field: 'escrow_status', label: 'Status', type: 'select', editable: true }
      ]
    },

    // Widgets Configuration (displayed in grid)
    widgets: [
      {
        id: 'financials',
        label: 'Financials',
        icon: 'AttachMoney',
        component: 'FinancialsWidget_White',
        size: { xs: 12, md: 6 },
        order: 1,
        modal: 'FinancialsModal',
        fields: [
          'purchase_price',
          'down_payment',
          'loan_amount',
          'seller_concessions',
          'commission_percentage',
          'commission_amount'
        ]
      },
      {
        id: 'people',
        label: 'People',
        icon: 'People',
        component: 'PeopleWidget_White',
        size: { xs: 12, md: 6 },
        order: 2,
        modal: 'PeopleModal',
        fields: [
          'buyers',
          'sellers',
          'buyer_agent',
          'listing_agent',
          'lender',
          'escrow_officer'
        ]
      },
      {
        id: 'timeline',
        label: 'Timeline',
        icon: 'Timeline',
        component: 'TimelineWidget_White',
        size: { xs: 12, md: 6 },
        order: 3,
        modal: 'TimelineModal',
        fields: [
          'offer_date',
          'acceptance_date',
          'inspection_date',
          'appraisal_date',
          'closing_date'
        ]
      },
      {
        id: 'checklists',
        label: 'Checklists',
        icon: 'CheckBox',
        component: 'ChecklistsWidget_White',
        size: { xs: 12, md: 6 },
        order: 4,
        modal: 'ChecklistsModal',
        showProgress: true
      }
    ]
  },

  // ========================================
  // FORM CONFIGURATION
  // ========================================
  forms: {
    // Create Form
    create: {
      title: 'Create New Escrow',
      fields: [
        {
          name: 'property_address',
          label: 'Property Address',
          type: 'text',
          required: true,
          placeholder: '123 Main St, City, State ZIP'
        },
        {
          name: 'closing_date',
          label: 'Closing Date',
          type: 'date',
          required: true
        },
        {
          name: 'purchase_price',
          label: 'Purchase Price',
          type: 'currency',
          required: true
        },
        {
          name: 'escrow_status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'pending', label: 'Pending' },
            { value: 'closed', label: 'Closed' }
          ],
          defaultValue: 'active'
        },
        {
          name: 'transaction_type',
          label: 'Transaction Type',
          type: 'select',
          options: [
            { value: 'sale', label: 'Sale' },
            { value: 'purchase', label: 'Purchase' }
          ],
          required: true
        }
      ],
      submitLabel: 'Create Escrow',
      cancelLabel: 'Cancel'
    },

    // Edit Form (inherits from create with overrides)
    edit: {
      title: 'Edit Escrow',
      submitLabel: 'Save Changes',
      cancelLabel: 'Cancel'
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
    viewSensitive: true,  // Can view financial data
    viewCommissions: true // Can view commission calculations
  },

  // ========================================
  // UTILITY FUNCTIONS (Escrow-specific)
  // ========================================
  utils: {
    // Format escrow for display
    formatDisplay: (escrow) => escrow?.property_address || 'Unnamed Property',

    // Generate escrow route
    getRoute: (id) => `/escrows/${id}`,

    // Get escrow status color
    getStatusColor: (status) => {
      const colors = {
        active: 'success',
        pending: 'warning',
        closed: 'info',
        archived: 'error',
        cancelled: 'error'
      };
      return colors[status] || 'default';
    },

    // Calculate commission
    calculateCommission: (purchasePrice, percentage = 3) => {
      return (purchasePrice * (percentage / 100)).toFixed(2);
    },

    // Calculate closing date proximity
    getClosingProximity: (closingDate) => {
      const now = new Date();
      const closing = new Date(closingDate);
      const daysUntil = Math.ceil((closing - now) / (1000 * 60 * 60 * 24));

      if (daysUntil < 0) return { status: 'overdue', days: Math.abs(daysUntil), color: 'error' };
      if (daysUntil <= 7) return { status: 'urgent', days: daysUntil, color: 'warning' };
      if (daysUntil <= 30) return { status: 'soon', days: daysUntil, color: 'info' };
      return { status: 'upcoming', days: daysUntil, color: 'default' };
    },

    // Filter escrows by status
    filterByStatus: (escrows, status) => {
      if (status === 'all') return escrows;
      if (status === 'archived') {
        return escrows.filter(e => e.deleted_at || e.deletedAt);
      }
      return escrows.filter(e =>
        (!e.deleted_at && !e.deletedAt) &&
        (e.escrow_status === status || (status === 'active' && e.escrow_status !== 'closed'))
      );
    },

    // Sort escrows
    sortBy: (escrows, field, order = 'asc') => {
      return [...escrows].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle date fields
        if (field.includes('date')) {
          aVal = new Date(aVal || 0);
          bVal = new Date(bVal || 0);
        }

        // Handle currency fields
        if (field.includes('price') || field.includes('amount')) {
          aVal = parseFloat(aVal || 0);
          bVal = parseFloat(bVal || 0);
        }

        if (aVal < bVal) return order === 'asc' ? -1 : 1;
        if (aVal > bVal) return order === 'asc' ? 1 : -1;
        return 0;
      });
    }
  }
});

export default escrowsConfig;
