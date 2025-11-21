import React from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Home as HomeIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
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
// CARD VIEW CONFIGURATION
// ============================================================================

const escrowCardConfig = {
  // Image/Header Configuration
  image: {
    source: (escrow) => getBestPropertyImage(escrow),
    fallbackIcon: HomeIcon,
    aspectRatio: '3 / 2',
  },

  // Status Chip Configuration (top-left, editable)
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
    formatter: (escrow) => escrow.display_address || escrow.property_address, // Prefer display name, fallback to canonical
    editable: true,
    editor: EditPropertyAddress,
    onSave: (escrow, addressData) => {
      // addressData is the full object from EditAddress with all address components
      // Extract the individual fields to save to database
      // IMPORTANT: Never use addressData itself as fallback - it's the entire object!
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

  // Subtitle Configuration (city, state)
  subtitle: {
    formatter: (escrow) => {
      const parts = [];
      if (escrow.city) parts.push(escrow.city);
      if (escrow.state) parts.push(escrow.state);
      return parts.join(', ') || null;
    },
  },

  // Metrics Configuration (1x2 horizontal row - ONLY Price and Commission)
  metrics: [
    // Purchase Price (editable)
    {
      label: 'Price',
      field: 'purchase_price',
      formatter: (value) => formatCurrency(value),
      color: {
        primary: '#10b981',
        secondary: '#059669',
        bg: alpha('#10b981', 0.08),
      },
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
      color: {
        primary: '#6366f1',
        secondary: '#4f46e5',
        bg: alpha('#6366f1', 0.08),
      },
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
        icon: {
          show: 'Visibility',
          hide: 'VisibilityOff',
        },
      },
    },
  ],

  // Footer Configuration (Acceptance + Close dates + Progress)
  footer: {
    fields: [
      // Acceptance Date (editable)
      {
        label: 'Acceptance',
        field: 'acceptance_date',
        formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
        editable: true,
        editor: EditAcceptanceDate,
        onSave: (escrow, newDate) => {
          return { acceptance_date: newDate };
        },
        width: '33.33%',
      },

      // Close Date (editable)
      {
        label: 'Close',
        field: 'closing_date',
        formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
        editable: true,
        editor: EditClosingDate,
        onSave: (escrow, newDate) => {
          return { closing_date: newDate };
        },
        width: '33.33%',
      },
    ],

    progress: {
      formatter: (escrow) => {
        // Calculate checklist progress if available
        const totalTasks = escrow.checklist_total || 0;
        const completedTasks = escrow.checklist_completed || 0;

        if (totalTasks === 0) {
          return {
            label: 'Progress',
            value: 0,
            displayValue: '—',
            showBar: false,
          };
        }

        const percentage = Math.round((completedTasks / totalTasks) * 100);

        return {
          label: 'Progress',
          value: percentage,
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

/**
 * EscrowCard - Card view for escrows dashboard
 *
 * Now uses CardTemplate with inline configuration for better colocation.
 *
 * Reduced from 820 lines to ~280 lines by using CardTemplate (686 lines, reusable).
 *
 * Features preserved:
 * - Inline editors: price, commission, dates, address, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: 3 status options with icons
 * - Click vs drag: text selection support
 * - Quick actions: view, archive, restore, delete
 * - Progress bar: checklist completion percentage
 */
const EscrowCard = React.memo(({
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
    <CardTemplate
      data={escrow}
      config={escrowCardConfig}
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

EscrowCard.displayName = 'EscrowCard';

export default EscrowCard;
