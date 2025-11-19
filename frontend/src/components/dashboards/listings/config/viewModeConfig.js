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
import { formatCurrency } from '../../../../utils/formatters';

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
  // title: {
  //   field: (listing) => decodeHTMLEntities(
  //     listing.display_address || listing.property_address || listing.address || 'No Address'
  //   ),
  // },

  // Subtitle Configuration (city, state, zip)
  // subtitle: {
  //   formatter: (listing) => {
  //     const parts = [];
  //     if (listing.city) parts.push(listing.city);
  //     if (listing.state) parts.push(listing.state);
  //     if (listing.zip_code) parts.push(listing.zip_code);
  //     return parts.join(', ') || null;
  //   },
  // },

  // Metrics Configuration (1x2 horizontal row - Price and Commission)
  // TEMPORARILY DISABLED FOR DEBUGGING
  // metrics: [
  //   // Listing Price (API field is 'list_price', not 'listing_price')
  //   {
  //     label: 'Price',
  //     field: 'list_price',
  //     formatter: (value) => formatCurrency(value),
  //     color: {
  //       primary: '#3b82f6',
  //       secondary: '#2563eb',
  //       bg: 'rgba(59, 130, 246, 0.08)',
  //     },
  //   },

  //   // Commission (calculated from percentage * price)
  //   // Database stores percentages (3.00 = 3%), not dollar amounts
  //   {
  //     label: 'Commission',
  //     field: (listing) => {
  //       const price = listing.list_price || 0;
  //       const percentage = listing.total_commission || 0;
  //       return (price * percentage) / 100;
  //     },
  //     formatter: (value) => formatCurrency(value),
  //     color: {
  //       primary: '#10b981',
  //       secondary: '#059669',
  //       bg: 'rgba(16, 185, 129, 0.08)',
  //     },
  //   },
  // ],

  // Footer Configuration (Property details + dates)
  // footer: {
  //   fields: [
  //     // Bedrooms
  //     {
  //       label: 'Beds',
  //       field: 'bedrooms',
  //       formatter: (value) => value ? `${value} beds` : '—',
  //       width: '25%',
  //     },

  //     // Bathrooms
  //     {
  //       label: 'Baths',
  //       field: 'bathrooms',
  //       formatter: (value) => value ? `${value} baths` : '—',
  //       width: '25%',
  //     },

  //     // Square Feet
  //     {
  //       label: 'Sq Ft',
  //       field: 'square_feet',
  //       formatter: (value) => value ? `${value.toLocaleString()} sqft` : '—',
  //       width: '25%',
  //     },

  //     // Days on Market
  //     {
  //       label: 'DOM',
  //       field: 'days_on_market',
  //       formatter: (value) => value ? `${value} days` : '—',
  //       width: '25%',
  //     },

  //     // List Date
  //     {
  //       label: 'List Date',
  //       field: (listing) => listing.listing_date || listing.list_date,
  //       formatter: (value) => value ? format(parseISO(value), 'MMM d, yyyy') : '—',
  //       width: '50%',
  //     },

  //     // Expiration Date
  //     {
  //       label: 'Expiration',
  //       field: (listing) => listing.expiration_date || listing.expires,
  //       formatter: (value) => value ? format(parseISO(value), 'MMM d, yyyy') : '—',
  //       width: '50%',
  //     },
  //   ],
  // },

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

// LIST VIEW - TEMPORARILY MINIMAL FOR DEBUGGING
export const listingListConfig = {
  // Image/Left Section Configuration
  image: {
    source: (listing) => getBestPropertyImage(listing),
    fallbackIcon: HomeIcon,
    width: 200,
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

  // Column definitions - TEMPORARILY MINIMAL FOR DEBUGGING
  columns: [
    {
      label: 'Status',
      field: 'listing_status',
      formatter: (value) => value || 'Active',
      isStatus: true,
      align: 'center'
    }
  ]
};
