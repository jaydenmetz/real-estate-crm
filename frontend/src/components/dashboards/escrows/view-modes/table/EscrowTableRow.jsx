import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { getStatusConfig } from '../../../../../constants/escrowConfig';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditPurchasePrice,
  EditCommissionAmount,
  EditAcceptanceDate,
  EditClosingDate,
  EditPropertyAddress,
  EditClients,
} from '../../editors';

// Import ClientCircles component
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
const useEscrowTableConfig = (statuses) => {
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
          { value: 'Closed', label: 'Closed', icon: CheckCircle, color: '#3b82f6' },
          { value: 'Cancelled', label: 'Cancelled', icon: Cancel, color: '#ef4444' },
        ];

    return {
      // Grid layout: 8 columns with responsive widths (Property, Status, Price, Commission, Acceptance, Closing, Clients, Actions)
      gridTemplateColumns: '2fr 1fr 1fr 1.2fr 1fr 1fr 1.2fr 80px',

      // Status config for row styling
      statusConfig: {
        getConfig: (escrow) => {
          const config = getStatusConfig(escrow.status); // Use 'status' field
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
          field: (escrow) => escrow.display_address || escrow.property_address || 'No Address',
          subtitle: (escrow) => {
            if (escrow.city && escrow.state) {
              return `${escrow.city}, ${escrow.state}${escrow.zip_code ? ' ' + escrow.zip_code : ''}`;
            }
            return 'Location TBD';
          },
          editable: true,
          editor: EditPropertyAddress,
          editorProps: (escrow) => ({
            value: escrow.display_address || escrow.property_address,
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
          field: 'status', // API returns 'status', not 'escrow_status'
          formatter: (status) => getStatusConfig(status).label,
          isStatus: true,
          editable: true,
          statusOptions: statusOptions,
          onSave: (escrow, newStatus) => {
            return { escrow_status: newStatus }; // But API expects 'escrow_status' for updates
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
            const updates = { purchase_price: newPrice };

            // If commission is percentage-based, recalculate my_commission
            if (escrow.commission_type === 'percentage' && escrow.commission_percentage) {
              const percentage = parseFloat(escrow.commission_percentage);
              updates.my_commission = (parseFloat(newPrice) * percentage) / 100;
            }

            return updates;
          },
          align: 'left',
          bold: true,
          color: '#10b981',
          hoverColor: 'rgba(16, 185, 129, 0.08)',
        },

        // Commission (editable with toggle)
        {
          label: 'Commission',
          field: (escrow) => escrow.my_commission || escrow.gross_commission || 0,
          formatter: (value) => formatCurrency(value),
          editable: true,
          editor: EditCommissionAmount,
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
            return {
              my_commission: updates.my_commission || updates,
              commission_percentage: updates.commission_percentage,
              commission_type: updates.commission_type,
            };
          },
          toggle: {
            maskFn: maskCommission,
            privacyLinked: true, // Links to master privacy toggle in stat card
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

        // Closing Date (editable) - Dynamic label based on status
        {
          label: (escrow) => {
            const status = escrow?.status?.toLowerCase(); // Use 'status' field
            if (status === 'closed') return 'Closed';
            if (status === 'cancelled') return 'Cancelled';
            return 'Closes'; // Active and default
          },
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

        // Clients (editable) - Shows client contact avatars/initials
        {
          label: (escrow) => {
            const clients = escrow.clients || { buyers: [], sellers: [] };
            const totalClients = (clients.buyers?.length || 0) + (clients.sellers?.length || 0);
            return totalClients === 1 ? 'Client' : 'Clients';
          },
          field: 'clients',
          customRenderer: (escrow, onEdit) => {
            const clients = escrow.clients || { buyers: [], sellers: [] };
            const representationType = escrow.representation_type || 'buyer';

            return (
              <ClientCircles
                clients={clients}
                representationType={representationType}
                onEdit={onEdit}
                maxVisible={4}
                size="small"
                disableHover // Template provides hover
              />
            );
          },
          editable: true,
          editor: EditClients,
          editorProps: (escrow) => {
            const clients = escrow.clients || { buyers: [], sellers: [] };
            const representationType = escrow.representation_type || 'buyer';

            return {
              values: {
                buyerClients: clients.buyers || [],
                sellerClients: clients.sellers || [],
                representationType: representationType,
              },
              showRepresentationType: true,
            };
          },
          onSave: (escrow, clientsData) => {
            return {
              clients: {
                buyers: clientsData.buyerClients || [],
                sellers: clientsData.sellerClients || [],
              },
              representation_type: clientsData.representationType,
            };
          },
          align: 'left',
        },
      ],
    };
  }, [statuses]);
};

/**
 * EscrowTableRow - Compact table view for escrows dashboard
 *
 * Now uses TableRowTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Reduced from 374 lines to ~240 lines by using TableRowTemplate (460 lines, reusable).
 *
 * Features preserved:
 * - Grid layout with 8 columns (Property, Status, Price, Commission, Acceptance, Closing, Progress, Actions)
 * - Inline editors: address, price, commission (with toggle), dates, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: dynamically populated from database
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 * - QuickActionsMenu
 */
const EscrowTableRow = React.memo(({
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
  // Get statuses from context
  const { statuses } = useStatus();

  // Generate config with database-driven status options
  const config = useEscrowTableConfig(statuses);

  return (
    <TableRowTemplate
      data={escrow}
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

EscrowTableRow.displayName = 'EscrowTableRow';

export default EscrowTableRow;
