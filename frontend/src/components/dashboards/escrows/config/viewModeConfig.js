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

// Import editor components (barrel export)
import {
  EditPurchasePrice,
  EditCommissionAmount,
  EditAcceptanceDate,
  EditClosingDate,
  EditPropertyAddress,
} from '../editors';

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
      field: (escrow) => escrow.commission_amount || escrow.gross_commission || 0,
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
        value: escrow.commission_amount || escrow.gross_commission || 0,
        commissionPercentage: escrow.commission_percentage || 3,
        commissionType: escrow.commission_type || 'percentage',
        purchasePrice: escrow.purchase_price || 0,
      }),
      onSave: (escrow, updates) => {
        // EditCommissionAmount returns { my_commission, commission_percentage, commission_type }
        return {
          commission_amount: updates.my_commission || updates,
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

// ============================================================================
// LIST VIEW CONFIGURATION
// ============================================================================

export const escrowListConfig = {
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
    field: 'property_address',
    editable: true,
    editor: EditPropertyAddress,
    onSave: (escrow, newAddress) => {
      return { property_address: newAddress };
    },
  },

  // Subtitle Configuration (location)
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
      field: (escrow) => escrow.commission_amount || escrow.gross_commission || 0,
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditCommissionAmount,
      // Pass additional props needed by EditCommissionAmount
      editorProps: (escrow) => ({
        value: escrow.commission_amount || escrow.gross_commission || 0,
        commissionPercentage: escrow.commission_percentage || 3,
        commissionType: escrow.commission_type || 'percentage',
        purchasePrice: escrow.purchase_price || 0,
      }),
      onSave: (escrow, updates) => {
        // EditCommissionAmount returns { my_commission, commission_percentage, commission_type }
        return {
          commission_amount: updates.my_commission || updates,
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

// ============================================================================
// TABLE VIEW CONFIGURATION
// ============================================================================

export const escrowTableConfig = {
  // Grid layout: 8 columns with responsive widths
  gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 0.8fr 80px',

  // Status config for row styling
  statusConfig: {
    getConfig: (escrow) => {
      const config = getStatusConfig(escrow.escrow_status);
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
      field: (escrow) => escrow.property_address_display || escrow.property_address || 'No Address',
      subtitle: (escrow) => {
        if (escrow.city && escrow.state) {
          return `${escrow.city}, ${escrow.state}${escrow.zip_code ? ' ' + escrow.zip_code : ''}`;
        }
        return 'Location TBD';
      },
      editable: true,
      editor: EditPropertyAddress,
      editorProps: (escrow) => ({
        value: escrow.property_address_display || escrow.property_address,
        canonicalValue: escrow.property_address,
        data: escrow,
      }),
      onSave: (escrow, addressData) => addressData,
      align: 'left',
      bold: true,
      hoverColor: 'rgba(16, 185, 129, 0.08)',
    },

    // Status (editable)
    {
      label: 'Status',
      field: 'escrow_status',
      formatter: (status) => getStatusConfig(status).label,
      isStatus: true,
      editable: true,
      statusOptions: [
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
      align: 'left',
    },

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
      align: 'left',
      bold: true,
      color: '#10b981',
      hoverColor: 'rgba(16, 185, 129, 0.08)',
    },

    // Commission (editable with toggle)
    {
      label: 'Commission',
      field: (escrow) => escrow.commission_amount || escrow.gross_commission || 0,
      formatter: (value) => formatCurrency(value),
      editable: true,
      editor: EditCommissionAmount,
      editorProps: (escrow) => ({
        value: escrow.commission_amount || escrow.gross_commission || 0,
        commissionPercentage: escrow.commission_percentage || 3,
        commissionType: escrow.commission_type || 'percentage',
        purchasePrice: escrow.purchase_price || 0,
      }),
      onSave: (escrow, updates) => {
        return {
          commission_amount: updates.my_commission || updates,
          commission_percentage: updates.commission_percentage,
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
      align: 'left',
      hoverColor: alpha('#000', 0.05),
    },

    // Closing Date (editable)
    {
      label: 'Closing',
      field: 'closing_date',
      formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
      editable: true,
      editor: EditClosingDate,
      onSave: (escrow, newDate) => {
        return { closing_date: newDate };
      },
      align: 'left',
      hoverColor: alpha('#000', 0.05),
    },

    // Progress (read-only)
    {
      label: 'Progress',
      field: (escrow) => {
        const totalTasks = escrow.checklist_total || 0;
        const completedTasks = escrow.checklist_completed || 0;
        if (totalTasks === 0) return 0;
        return Math.round((completedTasks / totalTasks) * 100);
      },
      formatter: (value) => `${value}%`,
      align: 'center',
      bold: true,
      color: (escrow) => getStatusConfig(escrow.escrow_status).color,
    },
  ],
};

export default escrowCardConfig;
