import React from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  Home as HomeIcon,
} from '@mui/icons-material';
import { LISTING_STATUS_COLORS } from '../../constants/listingConstants';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';

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
// LIST VIEW CONFIGURATION
// ============================================================================

const listingListConfig = {
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

    // Beginning Date
    {
      label: 'Beginning',
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

/**
 * ListingListItem - Horizontal list view for listings dashboard
 *
 * Now uses ListItemTemplate with inline configuration for better colocation.
 *
 * Reduced from 217 lines to ~160 lines by using ListItemTemplate (519 lines, reusable).
 *
 * Features preserved:
 * - Property image sidebar (200px wide)
 * - Days on market progress overlay
 * - Status chip
 * - Commission privacy toggle
 * - Quick actions menu
 */
const ListingListItem = React.memo(({
  listing,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  // Multi-select props
  isSelectable,
  isSelected,
  onSelect,
}) => {
  return (
    <ListItemTemplate
      data={listing}
      config={listingListConfig}
      onClick={onClick}
      onUpdate={onUpdate}
      onArchive={onArchive}
      onDelete={onDelete}
      onRestore={onRestore}
      isArchived={isArchived}
      isSelectable={isSelectable}
      isSelected={isSelected}
      onSelect={onSelect}
    />
  );
});

ListingListItem.displayName = 'ListingListItem';

export default ListingListItem;
