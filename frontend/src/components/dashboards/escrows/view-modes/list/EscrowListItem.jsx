import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Home as HomeIcon,
} from '@mui/icons-material';
import { getStatusConfig } from '../../../../../constants/escrowConfig';
import { getBestPropertyImage } from '../../../../../utils/streetViewUtils';
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
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} List configuration object
 */
const useEscrowListConfig = (statuses) => {
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
      // Image/Left Section Configuration
      image: {
        source: (escrow) => getBestPropertyImage(escrow),
        fallbackIcon: HomeIcon,
        width: 200,
      },

      // Status Chip Configuration (editable)
      status: {
        field: 'status', // API returns 'status', not 'escrow_status'
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
        onSave: (escrow, newStatus) => {
          return { escrow_status: newStatus }; // But API expects 'escrow_status' for updates
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
            privacyLinked: true, // Links to master privacy toggle in stat card
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

        // Closing Date (editable) - Dynamic label based on status
        {
          label: (escrow) => {
            const status = escrow?.status?.toLowerCase(); // Use 'status' field
            if (status === 'closed') return 'Closed';
            if (status === 'cancelled') return 'Cancelled';
            return 'Closes'; // Active and default
          },
          field: 'closing_date',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: true,
          editor: EditClosingDate,
          onSave: (escrow, newDate) => {
            return { closing_date: newDate };
          },
        },

        // Client Contacts (editable) - Shows client contact avatars/initials
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
                maxVisible={6}
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
        },
      ],
    };
  }, [statuses]);
};

/**
 * EscrowListItem - Horizontal list view for escrows dashboard
 *
 * Now uses ListItemTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Reduced from 495 lines to ~220 lines by using ListItemTemplate (519 lines, reusable).
 *
 * Features preserved:
 * - Property image with progress bar overlay (200px wide)
 * - Inline editors: price, commission (with toggle), dates, address, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: dynamically populated from database
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
  // Get statuses from context
  const { statuses } = useStatus();

  // Generate config with database-driven status options
  const config = useEscrowListConfig(statuses);

  return (
    <ListItemTemplate
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

EscrowListItem.displayName = 'EscrowListItem';

export default EscrowListItem;
