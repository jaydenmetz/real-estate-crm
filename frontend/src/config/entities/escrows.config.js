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

import { createEntityConfig } from '../../utils/config/createEntityConfig';
import { escrowsAPI } from '../../services/api.service';

// Import dashboard components
import {
  TotalEscrowsCard,
  TotalThisMonthCard,
  TotalVolumeCard,
  TotalCommissionCard
} from '../../components/dashboards/escrows/hero';

// Import widgets
import TimelineWidget_White from '../../components/details/escrows/components/TimelineWidget_White';
import FinancialsWidget_White from '../../components/details/escrows/components/FinancialsWidget_White';
import PeopleWidget_White from '../../components/details/escrows/components/PeopleWidget_White';
import ChecklistsWidget_White from '../../components/details/escrows/components/ChecklistsWidget_White';

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
    getAll: (params) => escrowsAPI.getAll(params),
    getById: (id) => escrowsAPI.getById(id),
    create: (data) => escrowsAPI.create(data),
    update: (id, data) => escrowsAPI.update(id, data),
    delete: (id) => escrowsAPI.delete(id),
    archive: (id) => escrowsAPI.archive(id),
    restore: (id) => escrowsAPI.restore(id),
    endpoints: {
      list: '/escrows',
      get: '/escrows/:id',
      create: '/escrows',
      update: '/escrows/:id',
      delete: '/escrows/:id',
      archive: '/escrows/:id/archive',
      restore: '/escrows/:id/restore',
      // stats: '/escrows/stats',  // DISABLED - calculated client-side from data
      // Escrow-specific endpoints
      people: '/escrows/:id/people',
      financials: '/escrows/:id/financials',
      timeline: '/escrows/:id/timeline',
      checklists: '/escrows/:id/checklists'
    },
    idField: 'id',
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

    // Stats Configuration (component-based for reusability)
    stats: [
      // ========================================
      // ACTIVE TAB STATS (based on creation date)
      // ========================================
      {
        id: 'total_active_escrows',
        component: TotalEscrowsCard,
        props: { status: 'active' },
        visibleWhen: ['Active']
      },
      {
        id: 'total_active_this_month',
        component: TotalThisMonthCard,
        props: { status: 'active', dateField: 'created_at' },
        visibleWhen: ['Active']
      },
      {
        id: 'total_active_volume',
        component: TotalVolumeCard,
        props: { status: 'active' },
        visibleWhen: ['Active']
      },
      {
        id: 'total_active_commission',
        component: TotalCommissionCard,
        props: { status: 'active' },
        visibleWhen: ['Active']
      },

      // ========================================
      // CLOSED TAB STATS (based on closing date)
      // ========================================
      {
        id: 'total_closed_escrows',
        component: TotalEscrowsCard,
        props: { status: 'closed' },
        visibleWhen: ['Closed']
      },
      {
        id: 'total_closed_this_month',
        component: TotalThisMonthCard,
        props: { status: 'closed', dateField: 'closing_date' },
        visibleWhen: ['Closed']
      },
      {
        id: 'total_closed_volume',
        component: TotalVolumeCard,
        props: { status: 'closed' },
        visibleWhen: ['Closed']
      },
      {
        id: 'total_closed_commission',
        component: TotalCommissionCard,
        props: { status: 'closed' },
        visibleWhen: ['Closed']
      },

      // ========================================
      // CANCELLED TAB STATS (based on cancellation date)
      // ========================================
      {
        id: 'total_cancelled_escrows',
        component: TotalEscrowsCard,
        props: { status: 'cancelled' },
        visibleWhen: ['Cancelled']
      },
      {
        id: 'total_cancelled_this_month',
        component: TotalThisMonthCard,
        props: { status: 'cancelled', dateField: 'updated_at' },
        visibleWhen: ['Cancelled']
      },
      {
        id: 'total_cancelled_volume',
        component: TotalVolumeCard,
        props: { status: 'cancelled' },
        visibleWhen: ['Cancelled']
      },
      {
        id: 'total_cancelled_commission',
        component: TotalCommissionCard,
        props: { status: 'cancelled' },
        visibleWhen: ['Cancelled']
      },

      // ========================================
      // ALL ESCROWS TAB STATS (based on creation date)
      // ========================================
      {
        id: 'total_escrows',
        component: TotalEscrowsCard,
        props: { status: 'all' },
        visibleWhen: ['all']
      },
      {
        id: 'total_escrows_this_month',
        component: TotalThisMonthCard,
        props: { status: 'all', dateField: 'created_at' },
        visibleWhen: ['all']
      },
      {
        id: 'total_volume',
        component: TotalVolumeCard,
        props: { status: 'all' },
        visibleWhen: ['all']
      },
      {
        id: 'total_commission',
        component: TotalCommissionCard,
        props: { status: 'all' },
        visibleWhen: ['all']
      },
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'Active', label: 'Active', preferredViewMode: 'list' },
      { value: 'Closed', label: 'Closed', preferredViewMode: 'list' },
      { value: 'Cancelled', label: 'Cancelled', preferredViewMode: 'list' },
      { value: 'all', label: 'All Escrows', preferredViewMode: 'list' },
      { value: 'archived', label: 'Archived', preferredViewMode: 'card' }
    ],
    defaultStatus: 'Active',

    // Scope Filter Configuration
    // Scope options can be a function that receives user object
    getScopeOptions: (user) => {
      if (!user) {
        return [{ value: 'user', label: 'My Escrows' }];
      }

      // Handle both camelCase and snake_case from backend
      const firstName = user.firstName || user.first_name || 'My';
      const lastName = user.lastName || user.last_name || '';
      const fullName = lastName ? `${firstName} ${lastName}` : (user.username || firstName);
      const teamName = user.teamName || user.team_name || 'Team';
      const brokerName = user.brokerName || user.broker_name || 'Broker';
      const userRole = user.role || 'agent';

      const options = [];

      // All users can see their own records
      options.push({
        value: 'user',
        label: `${firstName}'s Escrows`,
        fullLabel: fullName
      });

      // Team owners and above can see team view
      if (['team_owner', 'broker', 'system_admin'].includes(userRole)) {
        options.push({
          value: 'team',
          label: `${teamName}'s Escrows`,
          fullLabel: teamName
        });
      }

      // Brokers and system admins can see broker view
      if (['broker', 'system_admin'].includes(userRole)) {
        options.push({
          value: 'broker',
          label: `${brokerName}'s Escrows`,
          fullLabel: brokerName
        });
      }

      return options;
    },
    defaultScope: 'user',

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
      { value: 'card', label: 'Card', icon: 'GridView' },
      { value: 'list', label: 'List', icon: 'ViewList' },
      { value: 'table', label: 'Table', icon: 'TableChart' }
    ],
    defaultViewMode: 'list', // Full width cards for Active tab

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
      titleField: 'property_address',
      subtitleField: 'city',
      statusField: 'escrow_status',
      showImage: true,
      imageField: 'property_image_url',
      showStatus: true,
      showActions: false,
      showBreadcrumbs: true,
      statCards: [
        {
          label: 'Purchase Price',
          field: 'purchase_price',
          format: 'currency'
        },
        {
          label: 'Closing Date',
          field: 'closing_date',
          format: 'date'
        },
        {
          label: 'Days Until Close',
          computedField: 'days_until_closing',
          format: 'number',
          suffix: ' days'
        },
        {
          label: 'Your Commission',
          computedField: 'net_commission',
          format: 'currency'
        }
      ]
    },

    // Widgets Configuration (displayed in grid)
    widgets: [
      {
        id: 'timeline',
        title: 'Timeline',
        component: TimelineWidget_White,
        props: {}
      },
      {
        id: 'checklists',
        title: 'Checklists',
        component: ChecklistsWidget_White,
        props: {}
      },
      {
        id: 'people',
        title: 'People',
        component: PeopleWidget_White,
        props: {}
      },
      {
        id: 'financials',
        title: 'Financials',
        component: FinancialsWidget_White,
        props: {}
      }
    ],

    // Left Sidebar Configuration
    leftSidebar: {
      title: 'Quick Actions',
      sections: []
    },

    // Right Sidebar Configuration
    rightSidebar: {
      title: 'Smart Context',
      sections: []
    },

    // Activity Feed Configuration
    activityFeed: {
      enabled: true,
      title: 'Live Activity'
    }
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
