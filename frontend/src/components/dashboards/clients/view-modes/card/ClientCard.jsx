import React, { useMemo } from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  Person as PersonIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { formatCurrency } from '../../../../../utils/formatters';
import { getClientDisplayName, getSubtitle } from '../../../../../utils/displayNameStrategies';
import { useStatus } from '../../../../../contexts/StatusContext';
import { getStatusConfig } from '../../../../../constants/clientConfig';

// Import editor components
import {
  EditClientName,
  EditClientEmail,
  EditClientPhone,
  EditClientStatus,
  EditClientBudget,
  EditClientCommission,
  EditAgreementStartDate,
  EditAgreementEndDate,
  EditLeads,
} from '../../editors';

// Import LeadCircles component for footer
import { LeadCircles } from '../../../../common/ui/LeadCircles';

// Compact date formatter
const formatCompactDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <span style={{ whiteSpace: 'nowrap' }}>
      {month}
      <span style={{ fontSize: '0.7em', letterSpacing: '-0.5px' }}> </span>
      {day}
      <span style={{ fontSize: '0.6em' }}>, </span>
      {year}
    </span>
  );
};

// ============================================================================
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate card config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Card configuration object
 */
const useClientCardConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options
    // Database statuses: active, closed, expired, cancelled (lowercase)
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: status.status_key === 'cancelled' ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'active', label: 'Active', icon: CheckCircle, color: '#10b981' },
          { value: 'closed', label: 'Closed', icon: CheckCircle, color: '#3b82f6' },
          { value: 'expired', label: 'Expired', icon: CheckCircle, color: '#6b7280' },
          { value: 'cancelled', label: 'Cancelled', icon: Cancel, color: '#ef4444' },
        ];

    return {
      // Image/Header Configuration - Avatar placeholder for clients
      image: {
        source: (client) => client.avatar_url || client.avatarUrl || null,
        fallbackIcon: PersonIcon,
        aspectRatio: '3 / 2',
      },

      // Status Chip Configuration (top-left, editable)
      status: {
        field: (client) => client.client_status || client.status || 'active',
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
        onSave: (client, newStatus) => {
          return { client_status: newStatus };
        },
      },

      // Title Configuration (display_name with fallback to computed name, editable)
      title: {
        field: (client) => getClientDisplayName(client),
        editable: true,
        editor: EditClientName,
        onSave: (client, nameData) => {
          // nameData is an object from EditClientName with first_name, last_name, etc.
          // Handle both object (from EditClientName) and string (legacy) formats
          if (typeof nameData === 'object' && nameData !== null) {
            // Compute display_name from first and last name
            const displayName = `${nameData.first_name || ''} ${nameData.last_name || ''}`.trim();
            return {
              first_name: nameData.first_name,
              last_name: nameData.last_name,
              display_name: displayName || null, // Save computed display_name
              lead_id: nameData.lead_id, // If linking to a lead
            };
          }
          // Fallback: parse string into first/last (legacy support)
          const parts = String(nameData).trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || '';
          const displayName = `${firstName} ${lastName}`.trim();
          return {
            first_name: firstName,
            last_name: lastName,
            display_name: displayName || null,
          };
        },
      },

      // Subtitle Configuration (phone + email)
      subtitle: {
        formatter: (client) => getSubtitle('client', client) || 'No contact info',
      },

      // Metrics Configuration (2 columns - Target Price and Projected Commission)
      metrics: [
        // Target Price (editable) - renamed from Budget
        // When target price changes, auto-recalculate commission if type is percentage
        {
          label: 'Target Price',
          field: (client) => client.target_price || client.targetPrice || client.budget || 0,
          formatter: (value) => formatCurrency(value),
          color: {
            primary: '#10b981',
            secondary: '#059669',
            bg: alpha('#10b981', 0.08),
          },
          editable: true,
          editor: EditClientBudget, // Reuse budget editor, just with different label
          editorProps: (client) => ({
            value: client.target_price || client.targetPrice || client.budget || 0,
          }),
          onSave: (client, newTargetPrice) => {
            const updates = { target_price: newTargetPrice };

            // Auto-recalculate commission if type is percentage
            const commissionType = client.commission_type || client.commissionType || 'percentage';
            const commissionPercentage = client.commission_percentage || client.commissionPercentage;

            if (commissionType === 'percentage' && commissionPercentage) {
              const newCommission = (newTargetPrice * commissionPercentage) / 100;
              updates.projected_commission = newCommission;
            }

            return updates;
          },
        },

        // Projected Commission (editable) - renamed from Commission
        {
          label: 'Projected Commission',
          field: (client) => client.projected_commission || client.projectedCommission || client.commission || client.lifetime_value || 0,
          formatter: (value) => formatCurrency(value),
          color: {
            primary: '#06b6d4',
            secondary: '#0891b2',
            bg: alpha('#06b6d4', 0.08),
          },
          editable: true,
          editor: EditClientCommission,
          editorProps: (client) => ({
            value: client.projected_commission || client.projectedCommission || client.commission || client.lifetime_value || 0,
            commissionPercentage: client.commission_percentage || client.commissionPercentage,
            commissionType: client.commission_type || client.commissionType || 'percentage',
            budget: client.target_price || client.targetPrice || client.budget || 0, // Use target_price as base
          }),
          onSave: (client, updates) => {
            // updates contains: { commission, commission_percentage, commission_type }
            // Map to new field names
            return {
              projected_commission: updates.commission,
              commission_percentage: updates.commission_percentage,
              commission_type: updates.commission_type,
            };
          },
        },
      ],

      // Footer Configuration (Agreement dates + Leads)
      footer: {
        fields: [
          // Beginning Date (editable)
          {
            label: 'Beginning',
            field: (client) => client.agreement_start_date || client.agreementStartDate,
            formatter: (value) => formatCompactDate(value),
            editable: true,
            editor: EditAgreementStartDate,
            editorProps: (client) => ({
              value: client.agreement_start_date || client.agreementStartDate,
            }),
            onSave: (client, newDate) => {
              return { agreement_start_date: newDate };
            },
          },

          // Expiration Date with countdown (editable)
          {
            label: (client) => {
              const endDate = client.agreement_end_date || client.agreementEndDate;
              if (!endDate) return 'Expiration';
              const date = new Date(endDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              date.setHours(0, 0, 0, 0);
              const diffDays = Math.ceil((date - today) / (1000 * 60 * 60 * 24));

              if (diffDays < 0) return 'Expired';
              if (diffDays <= 30) return 'Expiring';
              return 'Expiration';
            },
            field: (client) => client.agreement_end_date || client.agreementEndDate,
            formatter: (value) => formatCompactDate(value),
            editable: true,
            editor: EditAgreementEndDate,
            editorProps: (client) => ({
              value: client.agreement_end_date || client.agreementEndDate,
              minDate: client.agreement_start_date || client.agreementStartDate,
            }),
            onSave: (client, newDate) => {
              return { agreement_end_date: newDate };
            },
          },

          // Lead Contacts (editable) - Shows lead contact avatars/initials
          {
            label: (client) => {
              const leads = client.leads || [];
              return leads.length > 1 ? 'Lead Contacts' : 'Lead Contact';
            },
            field: 'leads',
            customRenderer: (client, onEdit) => {
              const leads = client.leads || [];

              return (
                <LeadCircles
                  leads={leads}
                  onEdit={onEdit}
                  maxVisible={6}
                />
              );
            },
            editable: true,
            editor: EditLeads,
            editorProps: (client) => ({
              value: client.leads || [],
            }),
            onSave: (client, leadsData) => {
              // Convert lead objects to array of IDs for saving
              const leadIds = leadsData.map(l => l.id || l.lead_id);
              return { lead_ids: leadIds, leads: leadsData };
            },
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
 * ClientCard - Card view for clients dashboard
 *
 * Now uses CardTemplate with inline configuration for better colocation.
 * Reduced from 859 lines to ~280 lines by using CardTemplate.
 *
 * Features preserved:
 * - Inline editors: name, email, phone, status, budget
 * - Status menu: dynamically populated from database
 * - Click to navigate to detail page
 * - Quick actions: view, archive, restore, delete
 * - Lead circles in footer (like escrows has clients)
 */
const ClientCard = React.memo(({
  client,
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
  // Compatibility props (ignored)
  viewMode,
  index,
}) => {
  // Try to get statuses from context, but don't fail if not available
  let statuses = [];
  try {
    const statusContext = useStatus();
    statuses = statusContext?.statuses || [];
  } catch (e) {
    // StatusProvider not available - use defaults
  }

  // Generate config with database-driven status options
  const config = useClientCardConfig(statuses);

  return (
    <CardTemplate
      data={client}
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

ClientCard.displayName = 'ClientCard';

export default ClientCard;
