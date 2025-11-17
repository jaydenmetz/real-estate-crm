/**
 * Listings View Mode Configuration
 *
 * Configuration for CardTemplate, ListItemTemplate, and TableRowTemplate
 * to render listing data in different view modes.
 *
 * This single config file replaces:
 * - ListingCard.jsx (~130 lines)
 * - ListingListItem.jsx (~150 lines)
 * - ListingTableRow.jsx (~180 lines)
 * Total: ~460 lines → ~200 lines config (56% reduction)
 */

import { format, parseISO } from 'date-fns';
import { LISTING_STATUS_COLORS } from '../constants/listingConstants';

// ============================================================================
// CARD VIEW CONFIGURATION
// ============================================================================

export const listingCardConfig = {
  // No avatar for listings - use property image as background or thumbnail
  avatar: null,

  // Title - property address
  title: {
    fields: ['property_address', 'address'],
    format: 'string'
  },

  // Subtitle - MLS number
  subtitle: {
    field: 'mls_number',
    transform: (value) => value ? `MLS# ${value}` : null,
    format: 'string'
  },

  // Status badge
  status: {
    field: 'listing_status',
    colorMap: LISTING_STATUS_COLORS
  },

  // Metrics grid (property details)
  metrics: [
    {
      label: 'Price',
      fields: ['listing_price', 'price'],
      format: 'currency',
      options: {}
    },
    {
      label: 'Beds',
      field: 'bedrooms',
      transform: (value) => value ? `${value} beds` : '—',
      format: 'string'
    },
    {
      label: 'Baths',
      field: 'bathrooms',
      transform: (value) => value ? `${value} baths` : '—',
      format: 'string'
    },
    {
      label: 'Sq Ft',
      field: 'square_feet',
      format: 'number',
      transform: (value) => value ? `${value.toLocaleString()} sqft` : '—'
    },
    {
      label: 'DOM',
      field: 'days_on_market',
      transform: (value) => value ? `${value} days` : '—',
      format: 'string'
    },
    {
      label: 'Commission',
      fields: ['commission_amount', 'commission'],
      format: 'currency',
      options: {}
    }
  ],

  // Footer items
  footer: [
    {
      label: 'List Date',
      fields: ['listing_date', 'list_date'],
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    },
    {
      label: 'Expiration',
      fields: ['expiration_date', 'expires'],
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

export const listingListConfig = {
  // No traditional avatar - can use property image in sidebar
  avatar: null,

  // Title
  title: listingCardConfig.title,

  // Subtitle
  subtitle: {
    field: 'listing_type',
    format: 'titleCase'
  },

  // Status badge
  status: listingCardConfig.status,

  // Primary fields (main content area)
  primaryFields: [
    {
      label: 'MLS#',
      field: 'mls_number'
    },
    {
      label: 'Price',
      fields: ['listing_price', 'price'],
      format: 'currency',
      bold: true
    },
    {
      label: 'Property',
      transform: (_, data) => {
        const parts = [];
        if (data.bedrooms) parts.push(`${data.bedrooms} beds`);
        if (data.bathrooms) parts.push(`${data.bathrooms} baths`);
        if (data.square_feet) parts.push(`${data.square_feet.toLocaleString()} sqft`);
        return parts.join(' • ') || '—';
      }
    },
    {
      label: 'DOM',
      field: 'days_on_market',
      transform: (value) => value ? `${value} days` : '—'
    }
  ],

  // Secondary fields (right side)
  secondaryFields: [
    {
      label: 'List Date',
      fields: ['listing_date', 'list_date'],
      format: 'date',
      options: { dateFormat: 'MMM d, yyyy' }
    },
    {
      label: 'Commission',
      fields: ['commission_amount', 'commission'],
      format: 'currency'
    }
  ],

  // No sidebar for listings
  sidebar: null,

  // Actions
  actions: listingCardConfig.actions
};

// ============================================================================
// TABLE VIEW CONFIGURATION
// ============================================================================

export const listingTableConfig = {
  // Grid template for table columns
  gridTemplateColumns: '2fr 1.2fr 0.8fr 1fr 0.8fr 1fr 1fr 1fr 80px',

  // Status configuration for row styling
  statusConfig: {
    getConfig: (listing) => {
      const status = listing.listing_status || 'Active';
      const config = LISTING_STATUS_COLORS[status] || LISTING_STATUS_COLORS.Active;
      return {
        color: config.color,
        bg: config.bg
      };
    }
  },

  // Column definitions
  columns: [
    {
      label: 'Property',
      field: 'property_address',
      subtitle: (data) => data.mls_number ? `MLS# ${data.mls_number}` : null,
      align: 'left',
      bold: true
    },
    {
      label: 'Price',
      field: (data) => data.listing_price || data.price || 0,
      formatter: (value) => `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      align: 'right',
      bold: true
    },
    {
      label: 'Beds/Baths',
      field: (data) => {
        const beds = data.bedrooms || '—';
        const baths = data.bathrooms || '—';
        return `${beds}/${baths}`;
      },
      align: 'center'
    },
    {
      label: 'Sqft',
      field: 'square_feet',
      formatter: (value) => value ? value.toLocaleString() : '—',
      align: 'right'
    },
    {
      label: 'DOM',
      field: 'days_on_market',
      formatter: (value) => value || '—',
      align: 'center'
    },
    {
      label: 'Status',
      field: 'listing_status',
      formatter: (value) => value || 'Active',
      isStatus: true,
      align: 'center'
    },
    {
      label: 'List Date',
      field: (data) => data.listing_date || data.list_date,
      formatter: (value) => value ? format(parseISO(value), 'MMM d, yyyy') : '—',
      align: 'right'
    },
    {
      label: 'Commission',
      field: (data) => data.commission_amount || data.commission || 0,
      formatter: (value) => `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      align: 'right'
    }
  ]
};
