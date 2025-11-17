/**
 * Escrows View Mode Configuration
 *
 * Configuration for CardTemplate, ListItemTemplate, and TableRowTemplate
 * to render escrow data in different view modes WITH FULL EDITING.
 *
 * This config enables EscrowCard to reduce from 820 lines to ~150 lines
 * while preserving ALL inline editing capabilities.
 */

import {
  CheckCircle,
  Cancel,
  Hourglass,
  Home as HomeIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { getStatusConfig } from '../../../../constants/escrowConfig';
import { getBestPropertyImage } from '../../../../utils/streetViewUtils';
import { formatCurrency, formatDate } from '../../../../utils/formatters';

// Import editor components
import { EditPurchasePrice } from '../editors/EditPurchasePrice';
import { EditCommissionAmount } from '../editors/EditCommissionAmount';
import { EditAcceptanceDate } from '../editors/EditAcceptanceDate';
import { EditClosingDate } from '../editors/EditClosingDate';
import { EditPropertyAddress } from '../editors/EditPropertyAddress';

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

export const escrowCardConfig = {
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
    field: 'property_address',
    editable: true,
    editor: EditPropertyAddress,
    onSave: (escrow, newAddress) => {
      return { property_address: newAddress };
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

  // Metrics Configuration (2x2 grid with price and commission)
  metrics: [
    // Purchase Price (top-left, editable)
    {
      label: 'Purchase Price',
      field: 'purchase_price',
      formatter: (value) => formatCurrency(value),
      color: {
        primary: '#3b82f6',
        secondary: '#60a5fa',
        bg: alpha('#3b82f6', 0.1),
      },
      editable: true,
      editor: EditPurchasePrice,
      onSave: (escrow, newPrice) => {
        return { purchase_price: newPrice };
      },
    },

    // Commission (top-right, editable with toggle)
    {
      label: 'Your Commission',
      field: (escrow) => escrow.commission_amount || escrow.gross_commission || 0,
      formatter: (value) => formatCurrency(value),
      color: {
        primary: '#10b981',
        secondary: '#34d399',
        bg: alpha('#10b981', 0.1),
      },
      editable: true,
      editor: EditCommissionAmount,
      onSave: (escrow, newCommission) => {
        return { commission_amount: newCommission };
      },
      toggle: {
        maskFn: maskCommission,
        icon: {
          show: 'Visibility',
          hide: 'VisibilityOff',
        },
      },
    },

    // Acceptance Date (bottom-left, editable)
    {
      label: 'Acceptance',
      field: 'acceptance_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      color: {
        primary: '#8b5cf6',
        secondary: '#a78bfa',
        bg: alpha('#8b5cf6', 0.1),
      },
      editable: true,
      editor: EditAcceptanceDate,
      onSave: (escrow, newDate) => {
        return { acceptance_date: newDate };
      },
    },

    // Closing Date (bottom-right, editable)
    {
      label: 'Closing',
      field: 'closing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
      color: {
        primary: '#f59e0b',
        secondary: '#fbbf24',
        bg: alpha('#f59e0b', 0.1),
      },
      editable: true,
      editor: EditClosingDate,
      onSave: (escrow, newDate) => {
        return { closing_date: newDate };
      },
    },
  ],

  // Footer Configuration (with progress bar)
  footer: {
    fields: [
      {
        label: 'Days to Close',
        field: (escrow) => {
          if (!escrow.closing_date) return null;
          const closingDate = new Date(escrow.closing_date);
          const today = new Date();
          const diffTime = closingDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays;
        },
        formatter: (days) => {
          if (days === null) return '—';
          if (days < 0) return `${Math.abs(days)} days overdue`;
          if (days === 0) return 'Today';
          if (days === 1) return '1 day';
          return `${days} days`;
        },
        editable: false,
        width: '40%',
      },

      {
        label: 'Transaction',
        field: 'transaction_type',
        formatter: (value) => {
          if (!value) return '—';
          return value.charAt(0).toUpperCase() + value.slice(1);
        },
        editable: false,
        width: '30%',
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

// ============================================================================
// LIST VIEW CONFIGURATION
// ============================================================================

export const escrowListConfig = {
  // TODO: Implement when ListItemTemplate is enhanced
  // Will use similar structure but optimized for horizontal layout
};

// ============================================================================
// TABLE VIEW CONFIGURATION
// ============================================================================

export const escrowTableConfig = {
  // TODO: Implement when TableRowTemplate is enhanced
  // Will define column configurations with inline editing
};

export default escrowCardConfig;
