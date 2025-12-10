import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
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
  EditSellers,
} from '../../editors';

// Import ClientCircles component for sellers column
import { ClientCircles } from '../../../../common/ui/ClientCircles';

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
// TABLE VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate table config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Table configuration object
 */
const useListingTableConfig = (statuses) => {
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
  // Grid Layout (9 columns - added Sellers)
  gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 100px 0.8fr 80px',

  // Column Definitions
  columns: [
    // Property Address (with city, state subtitle, editable)
    {
      label: 'Property',
      field: (listing) => listing.display_address || listing.property_address || 'No Address',
      subtitle: (listing) => {
        const parts = [];
        if (listing.city) parts.push(listing.city);
        if (listing.state) parts.push(listing.state);
        return parts.join(', ') || 'Location TBD';
      },
      image: {
        source: (listing) => getBestPropertyImage(listing),
        fallbackIcon: HomeIcon,
      },
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

    // Status (editable dropdown)
    {
      label: 'Status',
      field: 'listing_status',
      formatter: (status) => {
        const config = getStatusConfig(status);
        return {
          label: config.label,
          color: config.color,
          bg: config.bg,
        };
      },
      editable: true,
      statusOptions: statusOptions,
      onSave: (listing, newStatus) => {
        return { listing_status: newStatus };
      },
    },

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
        const status = listing?.listing_status?.toLowerCase();
        if (status === 'closed') return 'Closed';
        if (status === 'cancelled') return 'Cancelled';
        if (status === 'expired') return 'Expired';
        if (status === 'withdrawn') return 'Withdrawn';
        return 'Expires'; // active, active_under_contract, pending, and default
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

    // Sellers (Client Contacts)
    {
      label: 'Sellers',
      field: 'sellers',
      customRenderer: (listing, onEdit) => {
        const sellers = listing.sellers || [];
        return (
          <ClientCircles
            clients={{ buyers: [], sellers: sellers }}
            representationType="seller"
            onEdit={onEdit}
            maxVisible={3}
            size="small"
          />
        );
      },
      editable: true,
      editor: EditSellers,
      editorProps: (listing) => ({
        value: listing.sellers || [],
      }),
      onSave: (listing, sellersData) => {
        const sellerIds = sellersData.map(s => s.id || s.client_id);
        return { seller_ids: sellerIds, sellers: sellersData };
      },
      align: 'left',
    },

    // Progress (placeholder for future)
    {
      label: 'Progress',
      field: () => 0,
      formatter: (value) => `${value}%`,
      color: (value) => {
        if (value >= 75) return '#10b981'; // Green
        if (value >= 50) return '#3b82f6'; // Blue
        if (value >= 25) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
      },
    },
  ],

  // Quick Actions Configuration
  actions: {
    view: true,
    archive: true,
    restore: true,
    delete: true,
  },
    };
  }, [statuses]);
};

/**
 * ListingTableRow - Table row view for listings dashboard
 *
 * Uses TableRowTemplate with inline configuration for consistency.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - 8 columns: Property, Status, Price, Commission, Listed, Expires, Progress, Actions
 * - Inline editors for all editable fields
 * - Commission toggle: show/hide with privacy masking
 * - Database-driven status options
 * - minDate validation for expiration date
 * - Property thumbnail with fallback icon
 * - Compact table layout optimized for scanning
 */
const ListingTableRow = React.memo(({
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
  const config = useListingTableConfig(statuses);

  return (
    <TableRowTemplate
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

ListingTableRow.displayName = 'ListingTableRow';

export default ListingTableRow;
