/**
 * Listings View Mode Configuration
 *
 * Configuration for CardTemplate, ListItemTemplate, and TableRowTemplate
 * to render listing data in different view modes.
 *
 * Based on escrows viewModeConfig structure.
 */

import {
  CheckCircle,
  Cancel,
  Home as HomeIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { LISTING_STATUS_COLORS } from '../constants/listingConstants';
import { getBestPropertyImage } from '../../../../utils/streetViewUtils';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

// Import editor components (for future inline editing)
// import {
//   EditListPrice,
//   EditCommissionAmount,
//   EditListingDate,
//   EditPropertyAddress,
// } from '../editors';

// ============================================================================
// COMMISSION MASKING (for privacy toggle)
// ============================================================================

const maskCommission = (value) => {
  const absValue = Math.abs(value || 0);
  if (absValue >= 100000) return '$***,***';
  if (absValue >= 10000) return '$**,***';
  if (absValue >= 1000) return '$*,***';
  if (absValue >= 100) return '$***';
  if (absValue >= 10) return '$**';
  return '$*';
};

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

  // Title Configuration (address)
  title: {
    field: (listing) => listing.display_address || listing.property_address || 'No Address',
  },

  // Subtitle Configuration (city, state)
  subtitle: {
    formatter: (listing) => {
      const parts = [];
      if (listing.city) parts.push(listing.city);
      if (listing.state) parts.push(listing.state);
      return parts.join(', ') || null;
    },
  },

  // Metrics Configuration (1x2 horizontal row - ONLY Price and Commission)
  metrics: [
    // List Price
    {
      label: 'Price',
      field: 'list_price',
      formatter: (value) => formatCurrency(value),
      color: {
        primary: '#10b981',
        secondary: '#059669',
        bg: alpha('#10b981', 0.08),
      },
    },

    // Commission (calculated from percentage * price)
    {
      label: 'Commission',
      field: (listing) => {
        const price = listing.list_price || 0;
        const percentage = listing.total_commission || 0;
        return (price * percentage) / 100;
      },
      formatter: (value) => formatCurrency(value),
      color: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        bg: alpha('#6366f1', 0.08),
      },
      toggle: {
        maskFn: maskCommission,
        icon: {
          show: 'Visibility',
          hide: 'VisibilityOff',
        },
      },
    },
  ],

  // Footer Configuration (List Date + Expiration Date + Progress)
  footer: {
    fields: [
      // List Date
      {
        label: 'Listed',
        field: 'listing_date',
        formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
        width: '33.33%',
      },

      // Expiration Date
      {
        label: 'Expires',
        field: 'expiration_date',
        formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
        width: '33.33%',
      },
    ],

    progress: {
      formatter: (listing) => {
        // Calculate days on market as progress indicator
        const dom = listing.days_on_market || 0;

        if (dom === 0) {
          return {
            label: 'DOM',
            value: 0,
            displayValue: 'New',
            showBar: false,
          };
        }

        return {
          label: 'DOM',
          value: Math.min(dom, 365), // Cap at 365 for visualization
          displayValue: `${dom} days`,
          showBar: true,
        };
      },
      width: '30%',
    },
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

  // Progress Bar Overlay (days on market)
  progress: {
    getValue: (listing) => {
      const dom = listing.days_on_market || 0;
      return Math.min(dom, 365); // Cap at 365
    },
    getColor: (listing) => {
      const config = LISTING_STATUS_COLORS[listing.listing_status] || LISTING_STATUS_COLORS.Active;
      return config.bg;
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

  // Title Configuration (address)
  title: {
    field: (listing) => listing.display_address || listing.property_address || 'No Address',
  },

  // Subtitle Configuration (location)
  subtitle: {
    formatter: (listing) => {
      const parts = [];
      if (listing.city) parts.push(listing.city);
      if (listing.state) parts.push(listing.state);
      if (listing.zip_code) parts.push(listing.zip_code);
      return parts.join(', ') || 'Location TBD';
    },
  },

  // Metrics Configuration (horizontal row)
  metrics: [
    // List Price
    {
      label: 'Price',
      field: 'list_price',
      formatter: (value) => formatCurrency(value),
    },

    // Commission (calculated from percentage)
    {
      label: 'Commission',
      field: (listing) => {
        const price = listing.list_price || 0;
        const percentage = listing.total_commission || 0;
        return (price * percentage) / 100;
      },
      formatter: (value) => formatCurrency(value),
      toggle: {
        maskFn: maskCommission,
      },
    },

    // List Date
    {
      label: 'Listed',
      field: 'listing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
    },

    // Expiration Date
    {
      label: 'Expires',
      field: 'expiration_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
    },
  ],
};

// ============================================================================
// TABLE VIEW CONFIGURATION
// ============================================================================

export const listingTableConfig = {
  // Grid layout: 8 columns with responsive widths
  gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr 80px',

  // Status config for row styling
  statusConfig: {
    getConfig: (listing) => {
      const config = LISTING_STATUS_COLORS[listing.listing_status] || LISTING_STATUS_COLORS.Active;
      return {
        color: config.color,
        bg: config.bg,
      };
    },
  },

  // Column configurations
  columns: [
    // Property Address (with subtitle)
    {
      label: 'Property',
      field: (listing) => listing.display_address || listing.property_address || 'No Address',
      subtitle: (listing) => {
        if (listing.city && listing.state) {
          return `${listing.city}, ${listing.state}${listing.zip_code ? ' ' + listing.zip_code : ''}`;
        }
        return 'Location TBD';
      },
      align: 'left',
      bold: true,
      hoverColor: 'rgba(16, 185, 129, 0.08)',
    },

    // Status
    {
      label: 'Status',
      field: 'listing_status',
      formatter: (status) => status || 'Active',
      isStatus: true,
      align: 'left',
    },

    // List Price
    {
      label: 'Price',
      field: 'list_price',
      formatter: (value) => formatCurrency(value),
      align: 'left',
      bold: true,
      color: '#10b981',
      hoverColor: 'rgba(16, 185, 129, 0.08)',
    },

    // Commission (calculated)
    {
      label: 'Commission',
      field: (listing) => {
        const price = listing.list_price || 0;
        const percentage = listing.total_commission || 0;
        return (price * percentage) / 100;
      },
      formatter: (value) => formatCurrency(value),
      toggle: {
        maskFn: maskCommission,
      },
      align: 'left',
      bold: true,
      color: '#6366f1',
      hoverColor: 'rgba(99, 102, 241, 0.08)',
    },

    // List Date
    {
      label: 'Listed',
      field: 'listing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
      align: 'left',
      hoverColor: alpha('#000', 0.05),
    },

    // Expiration Date
    {
      label: 'Expires',
      field: 'expiration_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
      align: 'left',
      hoverColor: alpha('#000', 0.05),
    },

    // Days on Market
    {
      label: 'DOM',
      field: 'days_on_market',
      formatter: (value) => value ? `${value}` : '0',
      align: 'center',
      bold: true,
      color: (listing) => {
        const config = LISTING_STATUS_COLORS[listing.listing_status] || LISTING_STATUS_COLORS.Active;
        return config.color;
      },
    },
  ],
};

export default listingCardConfig;
