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
import { Home as HomeIcon, AttachMoney as AttachMoneyIcon, Bed as BedIcon, SquareFoot as SquareFootIcon } from '@mui/icons-material';
import { LISTING_STATUS_COLORS } from '../constants/listingConstants';
import { getBestPropertyImage } from '../../../../utils/streetViewUtils';
import { decodeHTMLEntities } from '../../../../utils/htmlUtils';

// ============================================================================
// CARD VIEW CONFIGURATION
// ============================================================================

export const listingCardConfig = {
  // Image/Header Configuration
  image: {
    source: (listing) => getBestPropertyImage(listing),
    fallbackIcon: HomeIcon,
    aspectRatio: '3 / 2',
  },

  // Status Chip Configuration (top-left)
  status: {
    field: 'listing_status',
    getConfig: (status) => {
      const config = LISTING_STATUS_COLORS[status] || LISTING_STATUS_COLORS.Active;
      return {
        label: status || 'Active',
        color: config.color,
        bg: config.bg,
      };
    },
  },

  // Title Configuration (display address with fallback, decode HTML entities)
  title: {
    field: (listing) => decodeHTMLEntities(
      listing.property_address_display || listing.property_address || listing.address || 'No Address'
    ),
  },

  // Subtitle Configuration (city, state, zip)
  subtitle: {
    formatter: (listing) => {
      const parts = [];
      if (listing.city) parts.push(listing.city);
      if (listing.state) parts.push(listing.state);
      if (listing.zip_code) parts.push(listing.zip_code);
      return parts.join(', ') || null;
    },
  },

  // Metrics Configuration (1x2 horizontal row - Price and Commission)
  metrics: [
    // Listing Price
    {
      label: 'Price',
      field: (listing) => listing.listing_price || listing.price || 0,
      formatter: (value) => `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: {
        primary: '#3b82f6',
        secondary: '#2563eb',
        bg: 'rgba(59, 130, 246, 0.08)',
      },
    },

    // Commission
    {
      label: 'Commission',
      field: (listing) => listing.commission_amount || listing.commission || 0,
      formatter: (value) => `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: {
        primary: '#10b981',
        secondary: '#059669',
        bg: 'rgba(16, 185, 129, 0.08)',
      },
    },
  ],

  // Footer Configuration (Property details + dates)
  footer: {
    fields: [
      // Bedrooms
      {
        label: 'Beds',
        field: 'bedrooms',
        formatter: (value) => value ? `${value} beds` : '—',
        width: '25%',
      },

      // Bathrooms
      {
        label: 'Baths',
        field: 'bathrooms',
        formatter: (value) => value ? `${value} baths` : '—',
        width: '25%',
      },

      // Square Feet
      {
        label: 'Sq Ft',
        field: 'square_feet',
        formatter: (value) => value ? `${value.toLocaleString()} sqft` : '—',
        width: '25%',
      },

      // Days on Market
      {
        label: 'DOM',
        field: 'days_on_market',
        formatter: (value) => value ? `${value} days` : '—',
        width: '25%',
      },

      // List Date
      {
        label: 'List Date',
        field: (listing) => listing.listing_date || listing.list_date,
        formatter: (value) => value ? format(parseISO(value), 'MMM d, yyyy') : '—',
        width: '50%',
      },

      // Expiration Date
      {
        label: 'Expiration',
        field: (listing) => listing.expiration_date || listing.expires,
        formatter: (value) => value ? format(parseISO(value), 'MMM d, yyyy') : '—',
        width: '50%',
      },
    ],
  },

  // Quick Actions Configuration
  actions: {
    view: true,
    archive: true,
    restore: true,
    delete: true,
  },
};

// ============================================================================
// LIST VIEW CONFIGURATION
// ============================================================================

export const listingListConfig = {
  // Image/Left Section Configuration
  image: {
    source: (listing) => getBestPropertyImage(listing),
    fallbackIcon: HomeIcon,
    width: 200,
  },

  // MLS Badge Overlay (top-left)
  badges: {
    topLeft: (listing) => listing.mls_number ? `MLS# ${listing.mls_number}` : null,
    bottomLeft: (listing) => {
      if (listing.days_on_market && listing.listing_status === 'Active') {
        return `${listing.days_on_market} day${listing.days_on_market !== 1 ? 's' : ''} on market`;
      }
      return null;
    },
  },

  // Status Chip Configuration
  status: {
    field: 'listing_status',
    getConfig: (status) => {
      const config = LISTING_STATUS_COLORS[status] || LISTING_STATUS_COLORS.Active;
      return {
        label: status || 'Active',
        color: config.color,
        bg: config.bg,
      };
    },
  },

  // Title - display address with fallback, decode HTML entities
  title: {
    field: (listing) => decodeHTMLEntities(
      listing.property_address_display || listing.property_address || listing.address || 'No Address'
    ),
  },

  // Subtitle - city, state, zip
  subtitle: {
    formatter: (listing) => {
      const parts = [];
      if (listing.city) parts.push(listing.city);
      if (listing.state) parts.push(listing.state);
      if (listing.zip_code) parts.push(listing.zip_code);
      return parts.join(', ') || null;
    },
  },

  // Metrics Configuration (horizontal row)
  // NOTE: Icons are ONLY supported in ListItemTemplate, NOT CardTemplate
  metrics: [
    {
      label: 'Price',
      field: (listing) => listing.listing_price || listing.price || 0,
      formatter: (value) => `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: {
        primary: '#3b82f6',
        secondary: '#2563eb',
        bg: 'rgba(59, 130, 246, 0.08)',
      },
    },
    {
      label: 'Beds/Baths',
      field: (listing) => {
        const beds = listing.bedrooms || '—';
        const baths = listing.bathrooms || '—';
        return `${beds}/${baths}`;
      },
      color: {
        primary: '#8b5cf6',
        secondary: '#7c3aed',
        bg: 'rgba(139, 92, 246, 0.08)',
      },
    },
    {
      label: 'Sqft',
      field: 'square_feet',
      formatter: (value) => value ? value.toLocaleString() : '—',
      color: {
        primary: '#f59e0b',
        secondary: '#d97706',
        bg: 'rgba(245, 158, 11, 0.08)',
      },
    },
    {
      label: 'Commission',
      field: (listing) => listing.commission_amount || listing.commission || 0,
      formatter: (value) => `$${parseFloat(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      color: {
        primary: '#10b981',
        secondary: '#059669',
        bg: 'rgba(16, 185, 129, 0.08)',
      },
    },
  ],
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
      field: (data) => decodeHTMLEntities(
        data.property_address_display || data.property_address || data.address || 'No Address'
      ),
      subtitle: (data) => {
        const parts = [];
        if (data.city) parts.push(data.city);
        if (data.state) parts.push(data.state);
        if (data.zip_code) parts.push(data.zip_code);
        return parts.join(', ') || null;
      },
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
