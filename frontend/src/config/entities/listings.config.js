import { createEntityConfig } from '../../utils/config/createEntityConfig';
import { api } from '../../services/api.service';
import { createSortFunction } from '../../utils/sortUtils';

// Import hero stat cards
import {
  TotalListingsCard,
  TotalThisMonthCard,
  TotalVolumeCard,
  TotalCommissionCard
} from '../../components/dashboards/listings/hero';

// Import navigation configurations
import {
  listingStatusTabs,
  listingSortOptions,
  listingDefaultSort,
  getListingScopeOptions,
  listingDefaultScope,
  listingViewModes,
  listingDefaultViewMode
} from '../../components/dashboards/listings/navigation';

// Import widget components
import PriceHistoryWidget from '../../components/details/listings/components/PriceHistoryWidget';
import ActivityWidget from '../../components/details/listings/components/ActivityWidget';
import ComparablesWidget from '../../components/details/listings/components/ComparablesWidget';

export const listingsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'listing',
    namePlural: 'listings',
    label: 'Listing',
    labelPlural: 'Listings',
    icon: 'Home',
    color: '#8B5CF6',
    colorGradient: {
      start: '#8B5CF6',
      end: '#A78BFA'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/listings',
    // Use api.service methods directly
    getAll: (params) => api.listingsAPI.getAll(params),
    getById: (id) => api.listingsAPI.getById(id),
    create: (data) => api.listingsAPI.create(data),
    update: (id, data) => api.listingsAPI.update(id, data),
    delete: (id) => api.listingsAPI.delete(id),
    archive: (id) => api.listingsAPI.archive(id),
    restore: (id) => api.listingsAPI.restore(id),
    endpoints: {
      list: '/listings',
      get: '/listings/:id',
      create: '/listings',
      update: '/listings/:id',
      delete: '/listings/:id',
      archive: '/listings/:id/archive',
      restore: '/listings/:id/restore',
      stats: '/listings/stats',
    },
    idField: 'id', // CRITICAL FIX: Database column is 'id', not 'listing_id'
  },

  // ========================================
  // DASHBOARD CONFIGURATION
  // ========================================
  dashboard: {
    // Multi-select feature
    enableMultiSelect: true,

    // Status Mapping (tab label → API status value)
    // Maps user-facing tab names to database status values if they differ
    // Currently all tab names match database values exactly
    statusMapping: {},

    // Hero Card Configuration
    hero: {
      dateRangeFilters: ['1D', '1M', '1Y', 'YTD', 'Custom'],
      defaultDateRange: '1M',
      showAIAssistant: true,
      aiAssistantLabel: 'AI Listing Manager',
      aiAssistantDescription: 'Optimize listings, automate MLS updates, and generate property descriptions.',
      showAnalyticsButton: true,
      analyticsButtonLabel: 'LISTING ANALYTICS',
      showAddButton: true,
      addButtonLabel: 'NEW LISTING'
    },

    // Stats Configuration (component-based for reusability)
    // visibleWhen uses lowercase category keys to match database category_key values
    stats: [
      // ========================================
      // ACTIVE TAB STATS
      // ========================================
      {
        id: 'total_active_listings',
        component: TotalListingsCard,
        props: { status: 'active' },
        visibleWhen: ['active']
      },
      {
        id: 'total_active_this_month',
        component: TotalThisMonthCard,
        props: { status: 'active', dateField: 'created_at' },
        visibleWhen: ['active']
      },
      {
        id: 'total_active_volume',
        component: TotalVolumeCard,
        props: { status: 'active' },
        visibleWhen: ['active']
      },
      {
        id: 'total_active_commission',
        component: TotalCommissionCard,
        props: { status: 'active' },
        visibleWhen: ['active']
      },

      // ========================================
      // CLOSED TAB STATS (won category)
      // ========================================
      {
        id: 'total_closed_listings',
        component: TotalListingsCard,
        props: { status: 'closed' },
        visibleWhen: ['won']
      },
      {
        id: 'total_closed_this_month',
        component: TotalThisMonthCard,
        props: { status: 'closed', dateField: 'closing_date' },
        visibleWhen: ['won']
      },
      {
        id: 'total_closed_volume',
        component: TotalVolumeCard,
        props: { status: 'closed' },
        visibleWhen: ['won']
      },
      {
        id: 'total_closed_commission',
        component: TotalCommissionCard,
        props: { status: 'closed' },
        visibleWhen: ['won']
      },

      // ========================================
      // EXPIRED TAB STATS (lost category)
      // ========================================
      {
        id: 'total_expired_listings',
        component: TotalListingsCard,
        props: { status: 'expired' },
        visibleWhen: ['lost']
      },
      {
        id: 'total_expired_this_month',
        component: TotalThisMonthCard,
        props: { status: 'expired', dateField: 'created_at' },
        visibleWhen: ['lost']
      },
      {
        id: 'total_expired_volume',
        component: TotalVolumeCard,
        props: { status: 'expired' },
        visibleWhen: ['lost']
      },
      {
        id: 'total_expired_commission',
        component: TotalCommissionCard,
        props: { status: 'expired' },
        visibleWhen: ['lost']
      },

      // ========================================
      // ALL LISTINGS TAB STATS
      // ========================================
      {
        id: 'total_listings',
        component: TotalListingsCard,
        props: { status: 'all' },
        visibleWhen: ['all']
      },
      {
        id: 'total_listings_this_month',
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
    statusTabs: listingStatusTabs,
    defaultStatus: 'active',

    // Scope Filter Configuration
    getScopeOptions: getListingScopeOptions,
    defaultScope: listingDefaultScope,

    // Sort Options Configuration
    sortOptions: listingSortOptions,
    defaultSort: listingDefaultSort,

    // View Modes Configuration
    viewModes: listingViewModes,
    defaultViewMode: listingDefaultViewMode,

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'ListingCard',
      props: {
        showImage: true,
        imageField: 'property_image_url',
        imageFallback: 'https://via.placeholder.com/400x300?text=Property',
        showStatus: true,
        showActions: true,
        animationType: 'spring',
        showPrice: true,
        showDetails: true,
        showMLS: true,
        inlineEditing: true
      }
    }
  },

  // ========================================
  // DETAIL PAGE CONFIGURATION
  // ========================================
  detail: {
    hero: {
      titleField: 'property_address',
      imageField: 'property_image_url',
      placeholderIcon: '🏠',
      statusField: 'listing_status',
      displayIdField: 'mls_number',
      subtitleFields: [
        { field: 'city', icon: 'MapPin' }
      ],
      statusColors: {
        active: '#4caf50',
        closed: '#2196f3',
        expired: '#f44336'
      },
      stats: [
        { label: 'List Price', field: 'listing_price', format: 'currency' },
        { label: 'Bedrooms', field: 'bedrooms', format: 'number' },
        { label: 'Bathrooms', field: 'bathrooms', format: 'number' },
        { label: 'Sq Ft', field: 'square_feet', format: 'number' }
      ]
    },

    widgets: [
      {
        id: 'price',
        title: 'Price History',
        component: PriceHistoryWidget,
        props: {}
      },
      {
        id: 'activity',
        title: 'Activity',
        component: ActivityWidget,
        props: {}
      },
      {
        id: 'comparables',
        title: 'Comparables',
        component: ComparablesWidget,
        props: {}
      }
    ],

    leftSidebar: {
      title: 'Quick Actions',
      sections: []
    },

    rightSidebar: {
      title: 'Smart Context',
      sections: []
    },

    activityFeed: {
      enabled: true,
      title: 'Live Activity'
    }
  },

  // ========================================
  // FORMS CONFIGURATION
  // ========================================
  forms: {
    create: {
      title: 'Add New Listing',
      fields: [
        { key: 'property_address', label: 'Property Address', type: 'address', required: true },
        { key: 'listing_price', label: 'Listing Price', type: 'currency', required: true },
        { key: 'bedrooms', label: 'Bedrooms', type: 'number', required: true },
        { key: 'bathrooms', label: 'Bathrooms', type: 'number', required: true },
        { key: 'square_feet', label: 'Square Feet', type: 'number' },
        { key: 'listing_status', label: 'Status', type: 'select', options: ['active', 'closed', 'expired'], default: 'active' },
        { key: 'mls_number', label: 'MLS #', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' }
      ]
    },
    edit: {
      title: 'Edit Listing',
      fields: [
        { key: 'property_address', label: 'Property Address', type: 'address', required: true },
        { key: 'listing_price', label: 'Listing Price', type: 'currency', required: true },
        { key: 'bedrooms', label: 'Bedrooms', type: 'number', required: true },
        { key: 'bathrooms', label: 'Bathrooms', type: 'number', required: true },
        { key: 'square_feet', label: 'Square Feet', type: 'number' },
        { key: 'listing_status', label: 'Status', type: 'select', options: ['active', 'closed', 'expired'] },
        { key: 'mls_number', label: 'MLS #', type: 'text' },
        { key: 'description', label: 'Description', type: 'textarea' }
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
    formatDisplay: (listing) => listing?.property_address || 'Unnamed Property',
    getRoute: (id) => `/listings/${id}`,
    getStatusColor: (status) => {
      const colors = {
        'active': 'success',
        'closed': 'info',
        'expired': 'error'
      };
      return colors[status] || 'default';
    },
    calculateDaysOnMarket: (listingDate) => {
      const start = new Date(listingDate);
      const now = new Date();
      const diffTime = Math.abs(now - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    },
    formatPrice: (price) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    },
    filterByStatus: (listings, status) => {
      if (status === 'all') return listings;
      return listings.filter(l => l.listing_status === status);
    },
    // Sort listings using centralized sort utility
    // Automatically handles: status fields, dates, currency, strings
    // Status priority is derived from category sortOrder in statusCategories.js
    sortBy: createSortFunction('listings')
  }
});
