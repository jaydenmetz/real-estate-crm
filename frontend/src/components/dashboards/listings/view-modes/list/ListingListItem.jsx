import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Home as HomeIcon,
} from '@mui/icons-material';
import { getStatusConfig } from '../../../../../constants/listingConfig';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditListedPrice,
  EditListingCommission,
  EditListingDate,
  EditExpirationDate,
  EditPropertyAddress,
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
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} List configuration object
 */
const useListingListConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options
    // Fallback to hardcoded options if database statuses not loaded yet
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: status.status_key === 'Cancelled' ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'Active', label: 'Active', icon: CheckCircle, color: '#10b981' },
          { value: 'Pending', label: 'Pending', icon: CheckCircle, color: '#f59e0b' },
          { value: 'Closed', label: 'Closed', icon: CheckCircle, color: '#6366f1' },
          { value: 'Expired', label: 'Expired', icon: CheckCircle, color: '#94a3b8' },
          { value: 'Cancelled', label: 'Cancelled', icon: Cancel, color: '#ef4444' },
        ];

    return {
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
      const config = getStatusConfig(listing.listing_status);
      return config.bg;
    },
  },

  // Status Chip Configuration (editable)
  status: {
    field: 'listing_status',
    getConfig: (status) => {
      const config = getStatusConfig(status);
      return {
        label: config.label,
        color: config.color,
        bg: config.bg,
      };
    },
    editable: true,
    options: statusOptions,
    onSave: (listing, newStatus) => {
      return { listing_status: newStatus };
    },
  },

  // Title Configuration (address, editable)
  title: {
    field: (listing) => listing.display_address || listing.property_address || 'No Address',
    editable: true,
    editor: EditPropertyAddress,
    onSave: (listing, addressData) => {
      // addressData is the full object from EditAddress with all address components
      // Extract the individual fields to save to database
      return {
        property_address: addressData.property_address || '',
        display_address: addressData.property_address_display || addressData.display_address || addressData.property_address || '',
        city: addressData.city || '',
        state: addressData.state || '',
        zip_code: addressData.zip_code || '',
        county: addressData.county || '',
        latitude: addressData.latitude || null,
        longitude: addressData.longitude || null,
      };
    },
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
        // For listings, we save to listingCommission (camelCase for backend columnMap)
        // Backend maps listingCommission → listing_commission
        return {
          listingCommission: updates.commission_percentage,
          commissionType: updates.commission_type,
        };
      },
      toggle: {
        maskFn: maskCommission,
      },
    },

    // Listing Date (editable)
    {
      label: 'Beginning',
      field: 'listing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      editable: true,
      editor: EditListingDate,
      onSave: (listing, newDate) => {
        return { listing_date: newDate };
      },
    },

    // Expiration Date (editable with minDate validation) - Dynamic label based on status
    {
      label: (listing) => {
        const status = listing?.listing_status;
        if (status === 'Closed') return 'Closed';
        if (status === 'Cancelled') return 'Cancelled';
        if (status === 'Expired') return 'Expired';
        if (status === 'Withdrawn') return 'Withdrawn';
        return 'Expires'; // Active, Active Under Contract, Pending, and default
      },
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
  }, [statuses]);
};

/**
 * ListingListItem - Horizontal list view for listings dashboard
 *
 * Uses ListItemTemplate with inline configuration for consistency.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - Property image with progress bar overlay (200px wide)
 * - Inline editors: price, commission (with toggle), dates, status
 * - Commission toggle: show/hide with privacy masking
 * - Database-driven status options
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
  // Get statuses from context
  const { statuses } = useStatus();

  // Generate config with database-driven status options
  const config = useListingListConfig(statuses);

  return (
    <ListItemTemplate
      data={listing}
      config={config}
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
