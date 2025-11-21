import React from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Home as HomeIcon,
} from '@mui/icons-material';
import { getStatusConfig } from '../../../../../constants/escrowConfig';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';

// Import editor components
import {
  EditPurchasePrice,
  EditCommissionAmount,
  EditAcceptanceDate,
  EditClosingDate,
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
// LIST VIEW CONFIGURATION
// ============================================================================

const escrowListConfig = {
  // Image/Left Section Configuration
  image: {
    source: (escrow) => getBestPropertyImage(escrow),
    fallbackIcon: HomeIcon,
    width: 200,
  },

  // Progress Bar Overlay
  progress: {
    getValue: (escrow) => {
      const totalTasks = escrow.checklist_total || 0;
      const completedTasks = escrow.checklist_completed || 0;
      if (totalTasks === 0) return 0;
      return Math.round((completedTasks / totalTasks) * 100);
    },
    getColor: (escrow) => {
      const config = getStatusConfig(escrow.escrow_status);
      return config.bg;
    },
  },

  // Status Chip Configuration (editable)
  status: {
    field: 'escrow_status',
    getConfig: (status) => {
      const config = getStatusConfig(status);
      return {
        label: config.label,
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
        value: 'closed',
        label: 'Closed',
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
    onSave: (escrow, newStatus) => {
      return { escrow_status: newStatus };
    },
  },

  // Title Configuration (address, editable)
  title: {
    field: (escrow) => escrow.display_address || escrow.property_address, // Prefer display name, fallback to canonical
    editable: true,
    editor: EditPropertyAddress,
    onSave: (escrow, addressData) => {
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

  // Subtitle Configuration (city, state, zip - SEPARATE from title for ListItemTemplate)
  subtitle: {
    formatter: (escrow) => {
      const parts = [];
      if (escrow.city) parts.push(escrow.city);
      if (escrow.state) parts.push(escrow.state);
      if (escrow.zip_code) parts.push(escrow.zip_code);
      return parts.join(', ') || 'Location TBD';
    },
  },

  // Metrics Configuration (horizontal row)
  metrics: [
    // Purchase Price (editable)
    {
      label: 'Price',
      field: 'purchase_price',
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditPurchasePrice,
      onSave: (escrow, newPrice) => {
        return { purchase_price: newPrice };
      },
    },

    // Commission (editable with toggle)
    {
      label: 'Commission',
      field: (escrow) => escrow.my_commission || escrow.gross_commission || 0,
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditCommissionAmount,
      // Pass additional props needed by EditCommissionAmount
      editorProps: (escrow) => ({
        value: escrow.my_commission || escrow.gross_commission || 0,
        // Normalize commission percentage: parseFloat removes trailing zeros
        // Use null if no percentage stored (allows placeholder to show)
        commissionPercentage: escrow.commission_percentage !== null && escrow.commission_percentage !== undefined
          ? parseFloat(escrow.commission_percentage)
          : null,
        commissionType: escrow.commission_type || 'percentage',
        purchasePrice: escrow.purchase_price || 0,
      }),
      onSave: (escrow, updates) => {
        // EditCommissionAmount returns { my_commission, commission_percentage, commission_type }
        return {
          my_commission: updates.my_commission || updates,
          commission_percentage: updates.commission_percentage,
          commission_type: updates.commission_type,
        };
      },
      toggle: {
        maskFn: maskCommission,
      },
    },

    // Acceptance Date (editable)
    {
      label: 'Acceptance',
      field: 'acceptance_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      editable: true,
      editor: EditAcceptanceDate,
      onSave: (escrow, newDate) => {
        return { acceptance_date: newDate };
      },
    },

    // Closing Date (editable)
    {
      label: 'Closing',
      field: 'closing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      editable: true,
      editor: EditClosingDate,
      onSave: (escrow, newDate) => {
        return { closing_date: newDate };
      },
    },
  ],
};

/**
 * EscrowListItem - Horizontal list view for escrows dashboard
 *
 * Now uses ListItemTemplate with inline configuration for better colocation.
 *
 * Reduced from 495 lines to ~220 lines by using ListItemTemplate (519 lines, reusable).
 *
 * Features preserved:
 * - Property image with progress bar overlay (200px wide)
 * - Inline editors: price, commission (with toggle), dates, address, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 3 status options with icons
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 */
const EscrowListItem = React.memo(({
  escrow,
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
      data={escrow}
      config={escrowListConfig}
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

EscrowListItem.displayName = 'EscrowListItem';

export default EscrowListItem;
