import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
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

// Import LeadCircles component for leads column
import { LeadCircles } from '../../../../common/ui/LeadCircles';

// Compact date formatter (same as ClientCard)
const formatCompactDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// TABLE VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate table config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Table configuration object
 */
const useClientTableConfig = (statuses) => {
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
      // Grid layout: 9 columns (Avatar+Name, Status, Target Price, Commission, Beginning, Expiration, Leads, Phone, Actions)
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px 1.2fr 80px',

      // Status config for row styling
      statusConfig: {
        getConfig: (client) => {
          const status = client.client_status || client.status || 'active';
          const config = getStatusConfig(status);
          return {
            color: config.color,
            bg: config.bg || config.cardBg,
          };
        },
      },

      // Column configurations - matches ClientCard fields
      columns: [
        // Avatar + Name (editable)
        {
          label: 'Client',
          field: (client) => {
            const firstName = client.firstName || client.first_name || '';
            const lastName = client.lastName || client.last_name || '';
            return `${firstName} ${lastName}`.trim() || 'Unnamed Client';
          },
          customRenderer: (client, onEdit) => {
            const firstName = client.firstName || client.first_name || '';
            const lastName = client.lastName || client.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Client';
            const initials = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase();
            const status = client.client_status || client.status || 'active';
            const type = client.clientType || client.client_type || 'buyer';
            const statusConfig = getStatusConfig(status);

            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    background: `linear-gradient(135deg, ${statusConfig.color} 0%, ${alpha(statusConfig.color, 0.8)} 100%)`,
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {initials}
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      color: theme.palette.text.primary,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {fullName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '0.7rem',
                      color: theme.palette.text.secondary,
                      display: 'block',
                    }}
                  >
                    {client.phone || client.email || ''}
                  </Typography>
                </Box>
              </Box>
            );
          },
          editable: true,
          editor: EditClientName,
          editorProps: (client) => ({
            value: `${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`.trim(),
            data: client,
          }),
          onSave: (client, nameData) => {
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
          align: 'left',
          bold: true,
          hoverColor: 'rgba(16, 185, 129, 0.08)',
        },

        // Status (editable)
        {
          label: 'Status',
          field: (client) => client.client_status || client.status || 'active',
          formatter: (status) => {
            const config = getStatusConfig(status);
            return config.label;
          },
          isStatus: true,
          editable: true,
          statusOptions: statusOptions,
          onSave: (client, newStatus) => ({ client_status: newStatus }),
          align: 'left',
        },

        // Target Price (editable)
        {
          label: 'Target Price',
          field: (client) => client.target_price || client.targetPrice || client.budget || 0,
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          editable: true,
          editor: EditClientBudget,
          editorProps: (client) => ({
            value: client.target_price || client.targetPrice || client.budget || 0,
            data: client,
          }),
          onSave: (client, newTargetPrice) => {
            const updates = { target_price: newTargetPrice };
            const commissionType = client.commission_type || client.commissionType || 'percentage';
            const commissionPercentage = client.commission_percentage || client.commissionPercentage;
            if (commissionType === 'percentage' && commissionPercentage) {
              updates.projected_commission = (newTargetPrice * commissionPercentage) / 100;
            }
            return updates;
          },
          align: 'left',
          bold: true,
          color: '#10b981',
          hoverColor: 'rgba(16, 185, 129, 0.08)',
        },

        // Projected Commission (editable)
        {
          label: 'Commission',
          field: (client) => client.projected_commission || client.projectedCommission || client.commission || client.lifetime_value || 0,
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
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
          align: 'left',
          bold: true,
          color: '#06b6d4',
          hoverColor: 'rgba(6, 182, 212, 0.08)',
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
          align: 'left',
        },

        // Expiration Date (editable)
        {
          label: (client) => {
            const endDate = client?.agreement_end_date || client?.agreementEndDate;
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
          align: 'left',
        },

        // Lead Contacts (editable)
        {
          label: 'Leads',
          field: 'leads',
          customRenderer: (client, onEdit) => {
            const leads = client.leads || [];
            return (
              <LeadCircles
                leads={leads}
                onEdit={onEdit}
                maxVisible={3}
                size="small"
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
          align: 'left',
        },

        // Phone (editable)
        {
          label: 'Phone',
          field: 'phone',
          formatter: (value) => value || '—',
          editable: true,
          editor: EditClientPhone,
          editorProps: (client) => ({
            value: client.phone || '',
            data: client,
          }),
          onSave: (client, newPhone) => ({ phone: newPhone }),
          align: 'left',
          color: theme.palette.text.secondary,
          hoverColor: alpha('#000', 0.05),
        },
      ],
    };
  }, [statuses, theme]);
};

/**
 * ClientTableRow - Compact table view for clients dashboard
 *
 * Now matches ClientCard fields:
 * - Name + Phone/Email (editable)
 * - Status (editable)
 * - Target Price (editable)
 * - Projected Commission (editable)
 * - Beginning Date (editable)
 * - Expiration Date (editable)
 * - Lead Contacts (editable)
 * - Phone (editable)
 */
const ClientTableRow = React.memo(({
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
  const config = useClientTableConfig(clientStatuses);

  return (
    <TableRowTemplate
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

ClientTableRow.displayName = 'ClientTableRow';

export default ClientTableRow;
