import React, { useMemo } from 'react';
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
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate card config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Card configuration object
 */
const useEscrowCardConfig = (statuses) => {
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
      // Image/Header Configuration
      image: {
        source: (escrow) => getBestPropertyImage(escrow),
        fallbackIcon: HomeIcon,
        aspectRatio: '3 / 2',
      },

      // Status Chip Configuration (top-left, editable)
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

      // Subtitle Configuration (city, state, zip)
      subtitle: {
        formatter: (escrow) => {
          const parts = [];
          if (escrow.city) parts.push(escrow.city);
          if (escrow.state) parts.push(escrow.state);
          if (escrow.zip_code) parts.push(escrow.zip_code);
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
            onToggle: (escrow, newToggleState) => {
              // newToggleState is true when showing, false when hiding
              // show_commission in database is true when showing
              return { show_commission: newToggleState };
            },
          },
        },
      ],

      // Footer Configuration (Acceptance + Close dates + Progress)
      footer: {
        fields: [
          // Acceptance Date (editable) - auto width based on content
          {
            label: 'Acceptance',
            field: 'acceptance_date',
            formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
            editable: true,
            editor: EditAcceptanceDate,
            onSave: (escrow, newDate) => {
              return { acceptance_date: newDate };
            },
            // No width - let flexbox auto-size based on content
          },

          // Close Date (editable) - Dynamic label based on status, auto width
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
            // No width - let flexbox auto-size based on content
          },

          // Clients (editable) - Shows client avatars/initials
          {
            label: (escrow) => {
              const clients = escrow.clients || { buyers: [], sellers: [] };
              const totalClients = (clients.buyers?.length || 0) + (clients.sellers?.length || 0);
              return totalClients === 1 ? 'Client' : 'Clients';
            },
            field: 'clients',
            customRenderer: (escrow, onEdit) => {
              const clients = escrow.clients || { buyers: [], sellers: [] };
              // Use representation_type from escrow data (defaults to 'buyer' if not set)
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

              // Always use combined mode (show representation type selector + clients)
              // This matches the New Escrow Modal experience
              return {
                values: {
                  buyerClients: clients.buyers || [],
                  sellerClients: clients.sellers || [],
                  representationType: representationType,
                },
                showRepresentationType: true, // Always show representation type selector
              };
            },
            onSave: (escrow, clientsData) => {
              // clientsData from combined mode: { buyerClients, sellerClients, representationType }
              return {
                clients: {
                  buyers: clientsData.buyerClients || [],
                  sellers: clientsData.sellerClients || [],
                },
                representation_type: clientsData.representationType,
              };
            },
            // No width - takes remaining space after date columns
          },
        ],
      },

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
 * EscrowCard - Card view for escrows dashboard
 *
 * Now uses CardTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Reduced from 820 lines to ~280 lines by using CardTemplate (686 lines, reusable).
 *
 * Features preserved:
 * - Inline editors: price, commission, dates, address, status
 * - Commission toggle: show/hide with privacy masking
 * - Status menu: dynamically populated from database
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
  // Privacy control
  disableMasterPrivacy = false, // Set to true in preview mode
}) => {
  // Get statuses from context
  const { statuses } = useStatus();

  // Debug: Log statuses to see what we're getting
  console.log('[EscrowCard] statuses:', statuses);

  // Generate config with database-driven status options
  const config = useEscrowCardConfig(statuses);

  // Debug: Log the generated options
  console.log('[EscrowCard] config.status.options:', config.status.options);

  return (
    <CardTemplate
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
      disableMasterPrivacy={disableMasterPrivacy}
    />
  );
});

EscrowCard.displayName = 'EscrowCard';

export default EscrowCard;
