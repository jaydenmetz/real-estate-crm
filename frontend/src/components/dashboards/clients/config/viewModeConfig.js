/**
 * Clients View Mode Configuration
 *
 * Configuration for CardTemplate, ListItemTemplate, and TableRowTemplate
 * to render client data in different view modes.
 */

import { CLIENT_STATUS_COLORS } from '../constants/clientConstants';

// ============================================================================
// CARD VIEW CONFIGURATION
// ============================================================================

export const clientCardConfig = {
  // Avatar with client name initials
  avatar: {
    field: {
      firstNameFields: ['firstName', 'first_name'],
      lastNameFields: ['lastName', 'last_name']
    },
    image: null, // No profile images for now
  },

  // Title - full name
  title: {
    transform: (_, data) => {
      const first = data.firstName || data.first_name || '';
      const last = data.lastName || data.last_name || '';
      return `${first} ${last}`.trim() || 'Unknown Client';
    },
  },

  // Subtitle - email
  subtitle: {
    fields: ['email', 'client_email'],
  },

  // Status badge
  status: {
    field: 'client_status',
    colorMap: CLIENT_STATUS_COLORS
  },

  // Metrics grid
  metrics: [
    {
      label: 'Client Type',
      field: 'client_type',
      format: 'titleCase'
    },
    {
      label: 'Lead Source',
      field: 'lead_source',
      format: 'titleCase'
    },
    {
      label: 'Phone',
      field: 'phone',
      format: 'phone'
    },
    {
      label: 'Budget',
      field: 'budget',
      format: 'currency',
      options: {}
    }
  ],

  // Footer items
  footer: [
    {
      label: 'Created',
      field: 'created_at',
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    },
    {
      label: 'Last Contact',
      field: 'last_contact_date',
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    }
  ],

  // Quick actions
  actions: {
    view: true,
    archive: true,
    restore: true,
    delete: true
  }
};

// ============================================================================
// LIST VIEW CONFIGURATION
// ============================================================================

export const clientListConfig = {
  // Same avatar
  avatar: clientCardConfig.avatar,

  // Title
  title: clientCardConfig.title,

  // Subtitle
  subtitle: clientCardConfig.subtitle,

  // Status
  status: clientCardConfig.status,

  // Primary fields
  primaryFields: [
    {
      label: 'Phone',
      field: 'phone',
      format: 'phone'
    },
    {
      label: 'Client Type',
      field: 'client_type',
      format: 'titleCase'
    },
    {
      label: 'Budget',
      field: 'budget',
      format: 'currency',
      bold: true
    }
  ],

  // Secondary fields
  secondaryFields: [
    {
      label: 'Created',
      field: 'created_at',
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    },
    {
      label: 'Last Contact',
      field: 'last_contact_date',
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    }
  ],

  // No sidebar
  sidebar: null,

  // Actions
  actions: clientCardConfig.actions
};

// ============================================================================
// TABLE VIEW CONFIGURATION
// ============================================================================

export const clientTableConfig = {
  // Avatar in first column
  avatar: clientCardConfig.avatar,

  // Status for row styling
  status: clientCardConfig.status,

  // Columns
  columns: [
    {
      // Name with email subtitle
      field: clientCardConfig.title,
      subtitle: clientCardConfig.subtitle,
      align: 'left',
      width: 250,
      bold: true
    },
    {
      field: 'client_type',
      format: 'titleCase',
      align: 'left',
      width: 120
    },
    {
      field: 'phone',
      format: 'phone',
      align: 'left',
      width: 150
    },
    {
      field: 'budget',
      format: 'currency',
      align: 'right',
      width: 120,
      bold: true
    },
    {
      field: 'client_status',
      isStatus: true,
      statusColorMap: CLIENT_STATUS_COLORS,
      align: 'center',
      width: 120
    },
    {
      field: 'created_at',
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' },
      align: 'right',
      width: 120
    }
  ],

  // Actions
  actions: clientCardConfig.actions
};
