/**
 * Example ViewMode Configuration
 *
 * This file demonstrates how to configure the generic ViewMode templates
 * for a specific entity (clients used as example).
 *
 * Instead of creating separate ClientCard, ClientListItem, and ClientTableRow
 * components (3 files, ~1,500+ lines), you create ONE config object (~150 lines).
 *
 * Usage:
 * import { CardTemplate } from '@/templates/Dashboard/view-modes';
 * import { clientCardConfig } from './config/viewModeConfig';
 *
 * <CardTemplate data={client} config={clientCardConfig} onClick={handleClick} />
 */

import { CLIENT_STATUS, CLIENT_STATUS_COLORS } from '../../../../constants/clientConfig';

// ============================================================================
// CARD VIEW CONFIGURATION
// ============================================================================

export const clientCardConfig = {
  // Avatar configuration
  avatar: {
    // Can use name fields to generate initials
    field: {
      firstNameFields: ['firstName', 'first_name'],
      lastNameFields: ['lastName', 'last_name']
    },
    // Or use an image field
    image: 'profile_image',
    // Fallback icon name if no image/name
    fallback: 'Person'
  },

  // Title field (main heading)
  title: {
    // Combine multiple fields
    transform: (_, data) => {
      const first = data.firstName || data.first_name || '';
      const last = data.lastName || data.last_name || '';
      return `${first} ${last}`.trim() || 'Unknown Client';
    },
    format: 'string'
  },

  // Subtitle field
  subtitle: {
    // Try multiple field paths (fallback)
    fields: ['email', 'client_email'],
    format: 'string'
  },

  // Status badge
  status: {
    field: 'client_status',
    colorMap: CLIENT_STATUS_COLORS
  },

  // Metrics grid (displays in 2-column grid inside card)
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
      format: 'currency'
    }
  ],

  // Footer items (below divider)
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

  // Quick actions menu
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
  // Same avatar config
  avatar: clientCardConfig.avatar,

  // Title
  title: clientCardConfig.title,

  // Subtitle
  subtitle: clientCardConfig.subtitle,

  // Status badge
  status: clientCardConfig.status,

  // Primary fields (main content area, left side)
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

  // Secondary fields (right side)
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

  // No sidebar for clients (used by appointments for date/time)
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

  // Default status for row styling (left border color)
  status: clientCardConfig.status,

  // Column definitions
  columns: [
    {
      // First column - name with avatar
      field: clientCardConfig.title,
      subtitle: clientCardConfig.subtitle, // Shows email below name
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
      isStatus: true, // Renders as chip
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

// ============================================================================
// APPOINTMENT-SPECIFIC EXAMPLE (with sidebar)
// ============================================================================

export const appointmentListConfig = {
  // Sidebar configuration (unique to appointments)
  sidebar: {
    width: 120,
    gradient: true, // Use gradient background
    fields: [
      {
        field: 'appointment_date',
        format: 'date',
        options: { dateFormat: 'MMM d' },
        variant: 'body2',
        bold: true,
        icon: 'CalendarToday'
      },
      {
        field: 'appointment_date',
        format: 'date',
        options: { dateFormat: 'yyyy' },
        variant: 'caption'
      },
      {
        field: 'appointment_time',
        format: 'string',
        variant: 'caption',
        icon: 'AccessTime'
      }
    ]
  },

  avatar: {
    field: {
      firstNameFields: ['client_first_name', 'firstName'],
      lastNameFields: ['client_last_name', 'lastName']
    }
  },

  title: {
    field: 'appointment_title'
  },

  subtitle: {
    field: 'appointment_type',
    format: 'titleCase'
  },

  status: {
    field: 'appointment_status',
    colorMap: {
      scheduled: '#3b82f6',
      confirmed: '#10b981',
      completed: '#6b7280',
      cancelled: '#ef4444',
      no_show: '#f59e0b'
    }
  },

  primaryFields: [
    {
      label: 'Location',
      field: 'location'
    },
    {
      label: 'Duration',
      field: 'duration',
      transform: (value) => `${value} minutes`
    }
  ],

  secondaryFields: [
    {
      label: 'Client',
      transform: (_, data) => {
        const first = data.client_first_name || '';
        const last = data.client_last_name || '';
        return `${first} ${last}`.trim();
      }
    }
  ],

  actions: {
    view: true,
    archive: true,
    delete: true
  }
};

// ============================================================================
// COMPUTED FIELD EXAMPLES
// ============================================================================

export const leadCardConfig = {
  avatar: {
    field: {
      firstNameFields: ['firstName', 'first_name'],
      lastNameFields: ['lastName', 'last_name']
    }
  },

  title: {
    transform: (_, data) => {
      const first = data.firstName || data.first_name || '';
      const last = data.lastName || data.last_name || '';
      return `${first} ${last}`.trim() || 'Unknown Lead';
    }
  },

  subtitle: {
    fields: ['email', 'lead_email']
  },

  status: {
    field: 'lead_status',
    colorMap: {
      new: '#3b82f6',
      contacted: '#10b981',
      qualified: '#f59e0b',
      unqualified: '#6b7280',
      converted: '#8b5cf6'
    }
  },

  metrics: [
    {
      label: 'Lead Score',
      field: 'lead_score',
      format: 'number'
    },
    {
      label: 'Interest Level',
      field: 'interest_level',
      format: 'titleCase'
    },
    {
      label: 'Budget',
      field: 'budget',
      format: 'currency'
    },
    {
      label: 'Days Since Contact',
      // Computed field from multiple sources
      transform: (_, data) => {
        if (!data.last_contact_date) return 'Never';
        const lastContact = new Date(data.last_contact_date);
        const today = new Date();
        const days = Math.floor((today - lastContact) / (1000 * 60 * 60 * 24));
        return `${days} days`;
      }
    }
  ],

  footer: [
    {
      label: 'Source',
      field: 'lead_source',
      format: 'titleCase'
    },
    {
      label: 'Created',
      field: 'created_at',
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    }
  ],

  actions: {
    view: true,
    archive: true,
    delete: true
  }
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/*
// Before (3 separate components, ~1,500+ lines total):
import ClientCard from './ClientCard';
import ClientListItem from './ClientListItem';
import ClientTableRow from './ClientTableRow';

<ClientCard client={client} onClick={handleClick} />
<ClientListItem client={client} onClick={handleClick} />
<ClientTableRow client={client} onClick={handleClick} />

// After (1 template + 3 configs, ~450 lines total):
import { CardTemplate, ListItemTemplate, TableRowTemplate } from '@/templates/Dashboard/view-modes';
import { clientCardConfig, clientListConfig, clientTableConfig } from './config/viewModeConfig';

<CardTemplate data={client} config={clientCardConfig} onClick={handleClick} />
<ListItemTemplate data={client} config={clientListConfig} onClick={handleClick} />
<TableRowTemplate data={client} config={clientTableConfig} onClick={handleClick} />

// Result: ~1,050 lines eliminated per entity (70% reduction)
// Across 5 entities: ~5,250 lines eliminated total
*/
