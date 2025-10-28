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

    // Stats Configuration (dynamic based on selectedStatus and date range)
    stats: [
      // ========================================
      // ACTIVE STATS (gradient background matching hero)
      // ========================================
      {
        id: 'total_active_escrows',
        label: 'TOTAL ACTIVE ESCROWS',
        calculation: (_data, helpers) => helpers.countByStatus('active'),
        format: 'number',
        icon: 'Home',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['active']
      },
      {
        id: 'on_pace_to_close_this_month',
        label: 'ON PACE TO CLOSE THIS MONTH',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          return data.filter(item => {
            const status = item.escrow_status || item.status;
            const closingDate = new Date(item.closing_date);
            return status?.toLowerCase() === 'active' &&
                   closingDate >= monthStart &&
                   closingDate <= monthEnd;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['active']
      },
      {
        id: 'total_active_volume',
        label: 'TOTAL ACTIVE VOLUME',
        calculation: (_data, helpers) => helpers.sumByStatus('active', 'purchase_price'),
        format: 'currency',
        icon: 'AttachMoney',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['active']
      },
      {
        id: 'total_active_commission',
        label: 'TOTAL ACTIVE COMMISSION',
        calculation: (data) => {
          return data
            .filter(item => {
              const status = item.escrow_status || item.status;
              return status?.toLowerCase() === 'active';
            })
            .reduce((sum, item) => {
              const price = parseFloat(item.purchase_price || 0);
              const commissionPct = parseFloat(item.commission_percentage || 3);
              return sum + (price * (commissionPct / 100));
            }, 0);
        },
        format: 'currency',
        icon: 'Paid',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['active']
      },

      // ========================================
      // CLOSED STATS (gradient background, GREEN value text for earnings)
      // ========================================
      {
        id: 'total_closed_escrows',
        label: 'TOTAL CLOSED ESCROWS',
        calculation: (_data, helpers) => helpers.countByStatus('closed'),
        format: 'number',
        icon: 'CheckCircle',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['closed']
      },
      {
        id: 'total_escrows_set_to_close_this_month',
        label: 'TOTAL ESCROWS SET TO CLOSE THIS MONTH',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          return data.filter(item => {
            const closingDate = new Date(item.closing_date);
            return closingDate >= monthStart && closingDate <= monthEnd;
          }).length;
        },
        format: 'number',
        icon: 'EventAvailable',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['closed']
      },
      {
        id: 'total_closed_volume',
        label: 'TOTAL CLOSED VOLUME',
        calculation: (_data, helpers) => helpers.sumByStatus('closed', 'purchase_price'),
        format: 'currency',
        icon: 'TrendingUp',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['closed']
      },
      {
        id: 'total_closed_commission',
        label: 'TOTAL CLOSED COMMISSION',
        calculation: (data) => {
          return data
            .filter(item => {
              const status = item.escrow_status || item.status;
              return status?.toLowerCase() === 'closed';
            })
            .reduce((sum, item) => {
              const price = parseFloat(item.purchase_price || 0);
              const commissionPct = parseFloat(item.commission_percentage || 3);
              return sum + (price * (commissionPct / 100));
            }, 0);
        },
        format: 'currency',
        icon: 'MonetizationOn',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['closed']
      },

      // ========================================
      // CANCELLED STATS (gradient background, RED value text for losses)
      // ========================================
      {
        id: 'total_cancelled_escrows',
        label: 'TOTAL CANCELLED ESCROWS',
        calculation: (_data, helpers) => helpers.countByStatus('cancelled'),
        format: 'number',
        icon: 'Cancel',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },
      {
        id: 'total_cancelled_this_month',
        label: 'TOTAL CANCELLED THIS MONTH',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

          return data.filter(item => {
            const status = item.escrow_status || item.status;
            const updatedDate = new Date(item.updated_at || item.updatedAt);
            return status?.toLowerCase() === 'cancelled' &&
                   updatedDate >= monthStart &&
                   updatedDate <= monthEnd;
          }).length;
        },
        format: 'number',
        icon: 'EventBusy',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },
      {
        id: 'lost_total_volume',
        label: 'LOST TOTAL VOLUME',
        calculation: (_data, helpers) => helpers.sumByStatus('cancelled', 'purchase_price'),
        format: 'currency',
        icon: 'TrendingDown',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },
      {
        id: 'lost_total_commission',
        label: 'LOST TOTAL COMMISSION',
        calculation: (data) => {
          return data
            .filter(item => {
              const status = item.escrow_status || item.status;
              return status?.toLowerCase() === 'cancelled';
            })
            .reduce((sum, item) => {
              const price = parseFloat(item.purchase_price || 0);
              const commissionPct = parseFloat(item.commission_percentage || 3);
              return sum + (price * (commissionPct / 100));
            }, 0);
        },
        format: 'currency',
        icon: 'MoneyOff',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },

      // ========================================
      // ALL ESCROWS STATS (gradient background, dynamic value colors)
      // ========================================
      {
        id: 'total_escrows',
        label: 'TOTAL ESCROWS',
        calculation: (data) => data.length,
        format: 'number',
        icon: 'Dashboard',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'total_escrows_this_month',
        label: 'TOTAL ESCROWS THIS MONTH',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

          return data.filter(item => {
            const createdDate = new Date(item.created_at || item.createdAt);
            return createdDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'CalendarMonth',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'total_volume',
        label: 'TOTAL VOLUME',
        calculation: (data) => {
          return data.reduce((sum, item) => sum + parseFloat(item.purchase_price || 0), 0);
        },
        format: 'currency',
        icon: 'AccountBalance',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'total_commission',
        label: 'TOTAL COMMISSION',
        calculation: (data) => {
          // Total Closed Commission - Lost Commission
          const closedCommission = data
            .filter(item => {
              const status = item.escrow_status || item.status;
              return status?.toLowerCase() === 'closed';
            })
            .reduce((sum, item) => {
              const price = parseFloat(item.purchase_price || 0);
              const commissionPct = parseFloat(item.commission_percentage || 3);
              return sum + (price * (commissionPct / 100));
            }, 0);

          const lostCommission = data
            .filter(item => {
              const status = item.escrow_status || item.status;
              return status?.toLowerCase() === 'cancelled';
            })
            .reduce((sum, item) => {
              const price = parseFloat(item.purchase_price || 0);
              const commissionPct = parseFloat(item.commission_percentage || 3);
              return sum + (price * (commissionPct / 100));
            }, 0);

          return closedCommission - lostCommission;
        },
        format: 'currency',
        icon: 'AccountBalanceWallet',
        color: '#42a5f5', // Blue gradient (matches hero)
        backgroundColor: null, // Use gradient
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'active', label: 'Active' },
      { value: 'closed', label: 'Closed' },
      { value: 'cancelled', label: 'Cancelled' },
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
