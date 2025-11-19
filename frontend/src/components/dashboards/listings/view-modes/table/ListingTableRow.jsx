import React from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Pending,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { LISTING_STATUS_COLORS } from '../../constants/listingConstants';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';

// Import editor components
import {
  EditListPrice,
  EditCommissionAmount,
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
// TABLE VIEW CONFIGURATION
// ============================================================================

const listingTableConfig = {
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
    // Property Address (editable, with subtitle)
    {
      label: 'Property',
      field: (listing) => listing.display_address || listing.property_address || 'No Address',
      subtitle: (listing) => {
        if (listing.city && listing.state) {
          return `${listing.city}, ${listing.state}${listing.zip_code ? ' ' + listing.zip_code : ''}`;
        }
        return 'Location TBD';
      },
      editable: true,
      editor: EditPropertyAddress,
      editorProps: (listing) => ({
        value: listing.display_address || listing.property_address,
        canonicalValue: listing.property_address,
        data: listing,
      }),
      onSave: (listing, addressData) => addressData,
      align: 'left',
      bold: true,
      hoverColor: 'rgba(16, 185, 129, 0.08)',
    },

    // Status (editable)
    {
      label: 'Status',
      field: 'listing_status',
      formatter: (status) => status || 'Active',
      isStatus: true,
      editable: true,
      statusOptions: [
        {
          value: 'Coming Soon',
          label: 'Coming Soon',
          icon: HourglassEmpty,
          color: '#3b82f6',
        },
        {
          value: 'Active',
          label: 'Active',
          icon: CheckCircle,
          color: '#10b981',
        },
        {
          value: 'Pending',
          label: 'Pending',
          icon: Pending,
          color: '#f59e0b',
        },
        {
          value: 'Sold',
          label: 'Sold',
          icon: CheckCircle,
          color: '#6366f1',
        },
        {
          value: 'Expired',
          label: 'Expired',
          icon: Cancel,
          color: '#ef4444',
        },
        {
          value: 'Cancelled',
          label: 'Cancelled',
          icon: Cancel,
          color: '#ef4444',
        },
        {
          value: 'Withdrawn',
          label: 'Withdrawn',
          icon: Cancel,
          color: '#6b7280',
        },
      ],
      onSave: (listing, newStatus) => {
        return { listing_status: newStatus };
      },
      align: 'left',
    },

    // List Price (editable)
    {
      label: 'Price',
      field: 'list_price',
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditListPrice,
      onSave: (listing, newPrice) => {
        return { list_price: newPrice };
      },
      align: 'left',
      bold: true,
      color: '#10b981',
      hoverColor: 'rgba(16, 185, 129, 0.08)',
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
      editor: EditCommissionAmount,
      editorProps: (listing) => ({
        value: (listing.list_price || 0) * (listing.total_commission || 0) / 100,
        commissionPercentage: listing.total_commission !== null && listing.total_commission !== undefined
          ? parseFloat(listing.total_commission)
          : null,
        commissionType: listing.commission_type || 'percentage',
        listPrice: listing.list_price || 0,
      }),
      onSave: (listing, updates) => {
        return {
          total_commission: updates.total_commission || updates.commission_percentage,
          commission_type: updates.commission_type,
        };
      },
      toggle: {
        maskFn: maskCommission,
      },
      align: 'left',
      bold: true,
      color: '#6366f1',
      hoverColor: 'rgba(99, 102, 241, 0.08)',
    },

    // Beginning Date (editable)
    {
      label: 'Beginning',
      field: 'listing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
      editable: true,
      editor: EditListingDate,
      onSave: (listing, newDate) => {
        return { listing_date: newDate };
      },
      align: 'left',
      hoverColor: alpha('#000', 0.05),
    },

    // Expiration Date (editable)
    {
      label: 'Expires',
      field: 'expiration_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
      editable: true,
      editor: EditExpirationDate,
      onSave: (listing, newDate) => {
        return { expiration_date: newDate };
      },
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

/**
 * ListingTableRow - Compact table view for listings dashboard
 *
 * Now uses TableRowTemplate with inline configuration for better colocation.
 *
 * Reduced from 152 lines to ~260 lines by using TableRowTemplate (460 lines, reusable).
 *
 * Features preserved:
 * - Grid layout with 8 columns (Property, Status, Price, Commission, Listed, Expires, DOM, Actions)
 * - Inline editors: address, status, price, commission (with toggle), dates
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 7 status options with icons
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 * - QuickActionsMenu
 *
 * Matches escrows inline editing pattern for consistency.
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
  return (
    <TableRowTemplate
      data={listing}
      config={listingTableConfig}
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
