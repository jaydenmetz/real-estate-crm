import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, Person, Schedule } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { getStatusConfig } from '../../../../../constants/clientConfig';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components - same as ClientCard
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

// Compact date formatter (same as ClientCard)
const formatCompactDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} List configuration object
 */
const useClientListConfig = (statuses) => {
  const theme = useTheme();

  return useMemo(() => {
    // Transform database statuses into dropdown options
    // Fallback to hardcoded options if database statuses not loaded yet
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: status.status_key === 'cancelled' || status.status_key === 'expired' ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'active', label: 'Active', icon: Person, color: '#10b981' },
          { value: 'closed', label: 'Closed', icon: CheckCircle, color: '#3b82f6' },
          { value: 'expired', label: 'Expired', icon: Schedule, color: '#6b7280' },
          { value: 'cancelled', label: 'Cancelled', icon: Cancel, color: '#ef4444' },
        ];

    return {
      // Custom image section with avatar
      image: {
        width: 120,
        customRenderer: (client) => {
          const firstName = client.firstName || client.first_name || '';
          const lastName = client.lastName || client.last_name || '';
          const initials = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase();
          const status = client.client_status || client.status || 'active';
          const statusConfig = getStatusConfig(status);

          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
              }}
            >
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  background: `linear-gradient(135deg, ${statusConfig.color} 0%, ${alpha(statusConfig.color, 0.8)} 100%)`,
                  fontSize: '1.75rem',
                  fontWeight: 700,
                  border: '3px solid rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                {initials}
              </Avatar>
            </Box>
          );
        },
      },

      // Status configuration (editable)
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
        onSave: (client, newStatus) => ({ client_status: newStatus }),
      },

      // Title configuration (name + type chip, editable)
      title: {
        field: (client) => {
          const firstName = client.firstName || client.first_name || '';
          const lastName = client.lastName || client.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'Unnamed Client';
        },
        editable: true,
        editor: EditClientName,
        editorProps: (client) => ({
          value: `${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`.trim(),
          data: client,
        }),
        onSave: (client, nameData) => {
          // Handle both object (from EditClientName) and string formats
          if (typeof nameData === 'object' && nameData !== null) {
            const displayName = `${nameData.first_name || ''} ${nameData.last_name || ''}`.trim();
            return {
              first_name: nameData.first_name,
              last_name: nameData.last_name,
              display_name: displayName || null,
              lead_id: nameData.lead_id,
            };
          }
          const parts = String(nameData).trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || '';
          return { first_name: firstName, last_name: lastName };
        },
        customRenderer: (client, onEdit) => {
          const firstName = client.firstName || client.first_name || '';
          const lastName = client.lastName || client.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Client';
          const type = client.clientType || client.client_type || 'buyer';
          const status = client.client_status || client.status || 'active';
          const statusConfig = getStatusConfig(status);

          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1rem',
                  color: theme.palette.text.primary,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fullName}
              </Typography>
              <Chip
                label={type.charAt(0).toUpperCase() + type.slice(1)}
                size="small"
                sx={{
                  fontSize: 10,
                  fontWeight: 600,
                  height: 20,
                  background: alpha(statusConfig.color, 0.1),
                  color: statusConfig.color,
                }}
              />
            </Box>
          );
        },
      },

      // Subtitle with contact info
      subtitle: {
        formatter: (client) => {
          const parts = [];
          if (client.phone) parts.push(client.phone);
          if (client.email) parts.push(client.email);
          return parts.join(' • ');
        },
      },

      // Metrics row - matches ClientCard: Target Price, Projected Commission
      metrics: [
        // Target Price (editable) - renamed from Budget
        {
          label: 'Target Price',
          field: (client) => client.target_price || client.targetPrice || client.budget || 0,
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          color: '#10b981',
          editable: true,
          editor: EditClientBudget,
          editorProps: (client) => ({
            value: client.target_price || client.targetPrice || client.budget || 0,
            data: client,
          }),
          onSave: (client, newTargetPrice) => {
            const updates = { target_price: newTargetPrice };
            // Auto-recalculate commission if type is percentage
            const commissionType = client.commission_type || client.commissionType || 'percentage';
            const commissionPercentage = client.commission_percentage || client.commissionPercentage;
            if (commissionType === 'percentage' && commissionPercentage) {
              updates.projected_commission = (newTargetPrice * commissionPercentage) / 100;
            }
            return updates;
          },
        },

        // Projected Commission (editable)
        {
          label: 'Projected Commission',
          field: (client) => client.projected_commission || client.projectedCommission || client.commission || client.lifetime_value || 0,
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          color: '#06b6d4',
          editable: true,
          editor: EditClientCommission,
          editorProps: (client) => ({
            value: client.projected_commission || client.projectedCommission || client.commission || client.lifetime_value || 0,
            commissionPercentage: client.commission_percentage || client.commissionPercentage,
            commissionType: client.commission_type || client.commissionType || 'percentage',
            budget: client.target_price || client.targetPrice || client.budget || 0,
            data: client,
          }),
          onSave: (client, updates) => ({
            projected_commission: updates.commission,
            commission_percentage: updates.commission_percentage,
            commission_type: updates.commission_type,
          }),
        },

        // Beginning Date (editable)
        {
          label: 'Beginning',
          field: (client) => client.agreement_start_date || client.agreementStartDate,
          formatter: (value) => formatCompactDate(value),
          editable: true,
          editor: EditAgreementStartDate,
          editorProps: (client) => ({
            value: client.agreement_start_date || client.agreementStartDate,
            data: client,
          }),
          onSave: (client, newDate) => ({ agreement_start_date: newDate }),
        },

        // Expiration Date (editable)
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
            data: client,
          }),
          onSave: (client, newDate) => ({ agreement_end_date: newDate }),
        },
      ],

      // Footer with Lead Contacts
      footer: {
        fields: [
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
              data: client,
            }),
            onSave: (client, leadsData) => {
              const leadIds = leadsData.map(l => l.id || l.lead_id);
              return { lead_ids: leadIds, leads: leadsData };
            },
          },
        ],
      },
    };
  }, [statuses, theme]);
};

/**
 * ClientListItem - Full-width horizontal list view for clients dashboard
 *
 * Now matches ClientCard fields:
 * - Name (editable)
 * - Phone + Email (subtitle)
 * - Target Price (editable)
 * - Projected Commission (editable)
 * - Beginning Date (editable)
 * - Expiration Date (editable)
 * - Lead Contacts (editable)
 * - Status (editable)
 */
const ClientListItem = React.memo(({
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
}) => {
  // Get statuses from context (entity type is 'clients')
  const { statuses } = useStatus();

  // Filter to client statuses only
  const clientStatuses = useMemo(() => {
    return statuses?.filter(s => s.entity_type === 'clients') || [];
  }, [statuses]);

  // Generate config with database-driven status options
  const config = useClientListConfig(clientStatuses);

  return (
    <ListItemTemplate
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

ClientListItem.displayName = 'ClientListItem';

export default ClientListItem;
