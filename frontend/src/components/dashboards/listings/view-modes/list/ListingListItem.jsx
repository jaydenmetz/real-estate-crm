import React from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Home as HomeIcon,
} from '@mui/icons-material';
import { LISTING_STATUS_COLORS } from '../../constants/listingConstants';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';

// Import editor components
import {
  EditListedPrice,
  EditListingCommission,
  EditListingDate,
  EditExpirationDate,
} from '../../editors';

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

  // Progress Bar Overlay (placeholder for future)
  progress: {
    getValue: (listing) => 0,
    getColor: (listing) => {
      const config = LISTING_STATUS_COLORS[listing.listing_status] || LISTING_STATUS_COLORS.Active;
      return config.bg;
    },
  },

  // Status Chip Configuration (editable)
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
    editable: true,
    options: [
      {
        value: 'active',
        label: 'Active',
        icon: CheckCircle,
        color: '#10b981',
      },
      {
        value: 'pending',
        label: 'Pending',
        icon: CheckCircle,
        color: '#f59e0b',
      },
      {
        value: 'sold',
        label: 'Sold',
        icon: CheckCircle,
        color: '#3b82f6',
      },
      {
        value: 'cancelled',
        label: 'Cancelled',
        icon: Cancel,
        color: '#ef4444',
      },
    ],
    onSave: (listing, newStatus) => {
      return { listing_status: newStatus };
    },
  },

  // Title Configuration (address)
  title: {
    field: (listing) => listing.display_address || listing.property_address || 'No Address',
  },

  // Subtitle Configuration (city, state - SEPARATE from title for ListItemTemplate)
  subtitle: {
    formatter: (listing) => {
      const parts = [];
      if (listing.city) parts.push(listing.city);
      if (listing.state) parts.push(listing.state);
      return parts.join(', ') || 'Location TBD';
    },
  },

  // Metrics Configuration (horizontal row: Price, Commission, Listed Date, Expiration Date)
  metrics: [
    // List Price (editable)
    {
      label: 'Price',
      field: 'list_price',
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditListedPrice,
      onSave: (listing, newPrice) => {
        return { list_price: newPrice };
      },
    },

    // Commission (editable with toggle)
    {
      label: 'Commission',
      field: (listing) => {
        const price = listing.list_price || 0;
        const percentage = listing.total_commission || 0;
        return (price * percentage) / 100;
      },
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditListingCommission,
      editorProps: (listing) => ({
        value: (listing.list_price || 0) * (listing.total_commission || 0) / 100,
        commissionPercentage: listing.total_commission !== null && listing.total_commission !== undefined
          ? parseFloat(listing.total_commission)
          : null,
        commissionType: listing.commission_type || 'percentage',
        purchasePrice: listing.list_price || 0,
      }),
      onSave: (listing, updates) => {
        return {
          my_commission: updates.my_commission || updates,
          total_commission: updates.commission_percentage,
          commission_type: updates.commission_type,
        };
      },
      toggle: {
        maskFn: maskCommission,
      },
    },

    // Listing Date (editable)
    {
      label: 'Listed',
      field: 'listing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      editable: true,
      editor: EditListingDate,
      onSave: (listing, newDate) => {
        return { listing_date: newDate };
      },
    },

    // Expiration Date (editable with minDate validation)
    {
      label: 'Expires',
      field: 'expiration_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      editable: true,
      editor: EditExpirationDate,
      editorProps: (listing) => ({
        minDate: listing.listing_date, // Prevent expiration before listing date
      }),
      onSave: (listing, newDate) => {
        return { expiration_date: newDate };
      },
    },
  ],
};

/**
 * ListingListItem - Horizontal list view for listings dashboard
 *
 * Uses ListItemTemplate with inline configuration for consistency.
 *
 * Features:
 * - Property image with progress bar overlay (200px wide)
 * - Inline editors: price, commission (with toggle), dates, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 4 status options with icons
 * - Click vs drag: text selection support
 * - Hover effects and transitions
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
