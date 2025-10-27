import { createEntityConfig } from './base.config';
import { api } from '../../services/api.service';

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
    idField: 'listing_id',
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
      aiManagerLabel: 'AI Listing Manager',
      aiManagerDescription: 'Optimize listings, automate MLS updates, and generate property descriptions.',
      showAnalyticsButton: true,
      analyticsButtonLabel: 'LISTING ANALYTICS',
      showAddButton: true,
      addButtonLabel: 'ADD NEW LISTING'
    },

    // Stats Configuration
    stats: [
      {
        id: 'totalListings',
        label: 'TOTAL LISTINGS',
        field: 'totalListings',
        format: 'number',
        icon: 'Home',
        color: 'primary.main',
        goal: 50,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'activeListings',
        label: 'ACTIVE LISTINGS',
        field: 'activeListings',
        format: 'number',
        icon: 'Visibility',
        color: 'success.main',
        goal: 30,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'totalValue',
        label: 'TOTAL VALUE',
        field: 'totalValue',
        format: 'currency',
        icon: 'AttachMoney',
        color: 'primary.main',
        goal: 25000000,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      {
        id: 'avgDaysOnMarket',
        label: 'AVG DAYS ON MARKET',
        field: 'avgDaysOnMarket',
        format: 'number',
        suffix: ' days',
        icon: 'Schedule',
        color: 'info.main',
        goal: 30,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['active', 'all']
      },
      // Pending-specific stats
      {
        id: 'pendingListings',
        label: 'PENDING LISTINGS',
        field: 'pendingListings',
        format: 'number',
        icon: 'Pending',
        color: 'warning.main',
        showTrend: true,
        visibleWhen: ['pending']
      },
      {
        id: 'pendingVolume',
        label: 'PENDING VOLUME',
        field: 'pendingVolume',
        format: 'currency',
        icon: 'AttachMoney',
        color: 'warning.main',
        showTrend: true,
        visibleWhen: ['pending']
      },
      // Sold-specific stats
      {
        id: 'soldListings',
        label: 'SOLD LISTINGS',
        field: 'soldListings',
        format: 'number',
        icon: 'CheckCircle',
        color: 'success.main',
        showTrend: true,
        visibleWhen: ['sold']
      },
      {
        id: 'soldVolume',
        label: 'SOLD VOLUME',
        field: 'soldVolume',
        format: 'currency',
        icon: 'TrendingUp',
        color: 'success.main',
        goal: 10000000,
        showGoal: true,
        showTrend: true,
        visibleWhen: ['sold']
      },
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'sold', label: 'Sold' },
      { value: 'all', label: 'All Listings' }
    ],
    defaultStatus: 'active',

    // Scope Filter Configuration
    scopeOptions: [
      { value: 'my', label: 'My Listings' },
      { value: 'team', label: 'Team' },
      { value: 'office', label: 'Office' }
    ],
    defaultScope: 'team',

    // Sort Options Configuration
    sortOptions: [
      { value: 'created_at', label: 'Date Listed' },
      { value: 'price', label: 'Price' },
      { value: 'bedrooms', label: 'Bedrooms' },
      { value: 'square_feet', label: 'Square Feet' },
      { value: 'days_on_market', label: 'Days on Market' }
    ],
    defaultSort: 'created_at',

    // View Modes Configuration
    viewModes: [
      { value: 'grid', label: 'Grid', icon: 'GridView' },
      { value: 'list', label: 'List', icon: 'ViewList' },
      { value: 'map', label: 'Map', icon: 'Map' }
    ],
    defaultViewMode: 'grid',

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
      showImage: true,
      imageField: 'property_image_url',
      showStatus: true,
      showActions: true,
      showMLS: true,
      showPrice: true
    },

    sections: [
      {
        id: 'details',
        label: 'Property Details',
        icon: 'Home',
        fields: [
          { key: 'bedrooms', label: 'Bedrooms', type: 'number' },
          { key: 'bathrooms', label: 'Bathrooms', type: 'number' },
          { key: 'square_feet', label: 'Square Feet', type: 'number' },
          { key: 'lot_size', label: 'Lot Size', type: 'text' },
          { key: 'year_built', label: 'Year Built', type: 'number' }
        ]
      },
      {
        id: 'marketing',
        label: 'Marketing',
        icon: 'Campaign',
        fields: [
          { key: 'mls_number', label: 'MLS #', type: 'text' },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'features', label: 'Features', type: 'tags' }
        ]
      },
      {
        id: 'showing',
        label: 'Showing History',
        icon: 'Event',
        type: 'timeline',
        dataSource: 'showings'
      }
    ],

    widgets: [
      {
        id: 'price',
        label: 'Price History',
        icon: 'TrendingUp',
        component: 'PriceHistoryWidget',
        order: 1
      },
      {
        id: 'activity',
        label: 'Activity',
        icon: 'Visibility',
        component: 'ActivityWidget',
        order: 2
      },
      {
        id: 'comparable',
        label: 'Comparables',
        icon: 'CompareArrows',
        component: 'ComparablesWidget',
        order: 3
      }
    ]
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
        { key: 'listing_status', label: 'Status', type: 'select', options: ['active', 'pending', 'sold'], default: 'active' },
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
        { key: 'listing_status', label: 'Status', type: 'select', options: ['active', 'pending', 'sold'] },
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
        'pending': 'warning',
        'sold': 'info',
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
    sortBy: (listings, field, order = 'desc') => {
      const sorted = [...listings].sort((a, b) => {
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