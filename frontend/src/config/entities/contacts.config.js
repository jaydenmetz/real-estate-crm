/**
 * Contacts Entity Configuration
 *
 * Complete configuration for the contacts entity including:
 * - Dashboard layout with spheres hero mode
 * - Detail page widgets and sections
 * - Forms and validation
 * - API endpoints
 * - Permissions
 */

import { createEntityConfig } from '../../utils/config/createEntityConfig';
import { contactsAPI } from '../../services/api.service';
import { createSortFunction } from '../../utils/sortUtils';

// Import navigation configurations
import {
  contactStatusTabs,
  contactSortOptions,
  contactDefaultSort,
  getContactScopeOptions,
  contactDefaultScope,
  contactViewModes,
  contactDefaultViewMode
} from '../../components/dashboards/contacts/navigation';

export const contactsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'contact',
    namePlural: 'contacts',
    label: 'Contact',
    labelPlural: 'Contacts',
    icon: 'ContactPhone',
    color: '#8B5CF6', // Purple for contacts
    colorGradient: {
      start: '#8B5CF6',
      end: '#7C3AED'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/contacts',
    getAll: (params) => contactsAPI.getAll(params),
    getById: (id) => contactsAPI.getById(id),
    create: (data) => contactsAPI.create(data),
    update: (id, data) => contactsAPI.update(id, data),
    delete: (id) => contactsAPI.delete(id),
    search: (params) => contactsAPI.search(params),
    endpoints: {
      list: '/contacts',
      get: '/contacts/:id',
      create: '/contacts',
      update: '/contacts/:id',
      delete: '/contacts/:id',
      search: '/contacts/search',
    },
    idField: 'id',
  },

  // ========================================
  // DASHBOARD CONFIGURATION
  // ========================================
  dashboard: {
    // Hero Card Configuration - SPHERES MODE
    hero: {
      layoutMode: 'spheres', // Use the new spheres layout
      dateRangeFilters: ['1D', '1M', '1Y', 'YTD', 'Custom'],
      defaultDateRange: '1M',
      showAnalyticsButton: true,
      analyticsButtonLabel: 'CONTACT ANALYTICS',
      showAddButton: true,
      addButtonLabel: 'ADD NEW CONTACT',
      // Sphere data will be calculated from dashboard data
      sphereData: null, // Will be calculated dynamically
      onSphereClick: null, // Will be set by dashboard
      // AI Coach configuration
      aiCoachConfig: {
        title: 'AI Coach',
        description: 'Get personalized coaching to grow your sphere of influence and convert more leads to clients.',
        onHire: null, // Coming soon
      },
    },

    // Stats Configuration - Not used for spheres mode but kept for compatibility
    stats: [],

    // Status Tabs Configuration (imported from navigation)
    statusTabs: contactStatusTabs,
    defaultStatus: 'all',

    // Scope Filter Configuration (imported from navigation)
    getScopeOptions: getContactScopeOptions,
    defaultScope: contactDefaultScope,

    // Sort Options Configuration (imported from navigation)
    sortOptions: contactSortOptions,
    defaultSort: contactDefaultSort,

    // View Modes Configuration (imported from navigation)
    viewModes: contactViewModes,
    defaultViewMode: contactDefaultViewMode,

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'ContactCard',
      props: {
        showImage: true,
        imageField: 'avatar_url',
        showStatus: false,
        showActions: true,
        animationType: 'spring',
      }
    }
  },

  // ========================================
  // DETAIL PAGE CONFIGURATION
  // ========================================
  detail: {
    hero: {
      showImage: true,
      imageField: 'avatar_url',
      placeholderIcon: '👤',
      titleField: (contact) => `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
      statusField: null,
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
    ],
  },

  // ========================================
  // FORMS CONFIGURATION
  // ========================================
  forms: {
    create: {
      title: 'Add New Contact',
      fields: [
        { key: 'first_name', label: 'First Name', type: 'text', required: true },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'phone' },
        { key: 'street_address', label: 'Street Address', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'state', label: 'State', type: 'text' },
        { key: 'zip_code', label: 'ZIP Code', type: 'text' },
        { key: 'notes', label: 'Notes', type: 'textarea' }
      ]
    },
    edit: {
      title: 'Edit Contact',
      fields: [
        { key: 'first_name', label: 'First Name', type: 'text', required: true },
        { key: 'last_name', label: 'Last Name', type: 'text', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone', type: 'phone' },
        { key: 'street_address', label: 'Street Address', type: 'text' },
        { key: 'city', label: 'City', type: 'text' },
        { key: 'state', label: 'State', type: 'text' },
        { key: 'zip_code', label: 'ZIP Code', type: 'text' },
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
    export: true,
  },

  // ========================================
  // UTILITY FUNCTIONS
  // ========================================
  utils: {
    formatDisplay: (contact) => `${contact?.first_name || ''} ${contact?.last_name || ''}`.trim() || 'Unnamed Contact',
    getRoute: (id) => `/contacts/${id}`,
    sortBy: createSortFunction('contacts')
  }
});
