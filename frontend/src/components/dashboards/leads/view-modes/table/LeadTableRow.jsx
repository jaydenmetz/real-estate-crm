import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, FiberNew, Phone, Handshake } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, LinearProgress, alpha, useTheme } from '@mui/material';
import { getStatusConfig } from '../../../../../constants/leadConfig';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { getLeadDisplayName } from '../../../../../utils/displayNameStrategies';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components - same as LeadCard
import {
  EditLeadName,
  EditLeadEmail,
  EditLeadPhone,
  EditLeadSource,
  EditLeadStatus,
} from '../../editors';

// Import ClientCircles for contacts display (like LeadCard)
import { ClientCircles } from '../../../../common/ui/ClientCircles';

// Compact date formatter (same as LeadCard)
const formatCompactDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// ============================================================================
// TABLE VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate table config with database-driven status options
 * Matches LeadCard fields: Status, Name, Target Price, Est. Commission, Created, Expires, Contacts
 */
const useLeadTableConfig = (statuses) => {
  const theme = useTheme();

  return useMemo(() => {
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: ['rejected', 'unresponsive', 'unqualified', 'competing'].includes(status.status_key) ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'new', label: 'New', icon: FiberNew, color: '#3b82f6' },
          { value: 'contacted', label: 'Contacted', icon: Phone, color: '#8b5cf6' },
          { value: 'met', label: 'Met', icon: Handshake, color: '#f59e0b' },
          { value: 'under_contract', label: 'Under Contract', icon: CheckCircle, color: '#10b981' },
          { value: 'closed', label: 'Closed', icon: CheckCircle, color: '#059669' },
          { value: 'competing', label: 'Competing', icon: Cancel, color: '#ef4444' },
          { value: 'rejected', label: 'Rejected', icon: Cancel, color: '#dc2626' },
          { value: 'unresponsive', label: 'Unresponsive', icon: Cancel, color: '#6b7280' },
          { value: 'deferred', label: 'Deferred', icon: Cancel, color: '#f59e0b' },
          { value: 'unqualified', label: 'Unqualified', icon: Cancel, color: '#9ca3af' },
        ];

    return {
      // Grid layout: 9 columns (Avatar+Name, Status, Target Price, Commission, Created, Expires, Contacts, Score, Actions)
      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 100px 80px 80px',

      statusConfig: {
        getConfig: (lead) => {
          const status = lead.lead_status || lead.status || 'new';
          const config = getStatusConfig(status);
          return { color: config.color, bg: config.bg };
        },
      },

      columns: [
        // Avatar + Name (read-only like LeadCard)
        {
          label: 'Lead',
          field: (lead) => getLeadDisplayName(lead),
          customRenderer: (lead) => {
            const firstName = lead.firstName || lead.first_name || '';
            const lastName = lead.lastName || lead.last_name || '';
            const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Lead';
            const initials = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase();
            const status = lead.lead_status || lead.status || 'new';
            const type = lead.leadType || lead.lead_type || 'buyer';
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
                    sx={{ fontSize: '0.7rem', color: theme.palette.text.secondary, display: 'block' }}
                  >
                    {lead.phone || lead.email || ''}
                  </Typography>
                </Box>
              </Box>
            );
          },
          editable: false, // Match LeadCard
          align: 'left',
          bold: true,
        },

        // Status (editable)
        {
          label: 'Status',
          field: (lead) => lead.lead_status || lead.status || 'new',
          formatter: (status) => getStatusConfig(status).label,
          isStatus: true,
          editable: true,
          statusOptions: statusOptions,
          onSave: (lead, newStatus) => ({ lead_status: newStatus }),
          align: 'left',
        },

        // Target Price (read-only like LeadCard)
        {
          label: 'Target Price',
          field: (lead) => lead.target_price || lead.budget || 0,
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          editable: false,
          align: 'left',
          bold: true,
          color: '#10b981',
        },

        // Est. Commission (read-only like LeadCard)
        {
          label: 'Commission',
          field: (lead) => {
            const targetPrice = lead.target_price || lead.budget || 0;
            const commissionRate = lead.commission_rate || 0.03;
            return targetPrice * commissionRate;
          },
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          editable: false,
          align: 'left',
          bold: true,
          color: '#6366f1',
        },

        // Created Date (read-only like LeadCard)
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => formatCompactDate(value),
          editable: false,
          align: 'left',
        },

        // Expiration Date (read-only like LeadCard)
        {
          label: 'Expires',
          field: (lead) => lead.expiration_date || lead.expires_at,
          formatter: (value) => formatCompactDate(value),
          editable: false,
          align: 'left',
        },

        // Contacts (read-only like LeadCard)
        {
          label: 'Contacts',
          field: 'contacts',
          customRenderer: (lead) => {
            const contacts = lead.contacts || [];
            if (contacts.length === 0 && (lead.first_name || lead.last_name)) {
              const leadAsContact = [{
                id: lead.id,
                first_name: lead.first_name,
                last_name: lead.last_name,
              }];
              return (
                <ClientCircles
                  clients={{ buyers: leadAsContact, sellers: [] }}
                  representationType="buyer"
                  maxVisible={3}
                  size="small"
                />
              );
            }
            return (
              <ClientCircles
                clients={{ buyers: contacts, sellers: [] }}
                representationType="buyer"
                maxVisible={3}
                size="small"
              />
            );
          },
          editable: false,
          align: 'left',
        },

        // Lead Score (read-only)
        {
          label: 'Score',
          field: (lead) => parseInt(lead.score) || 0,
          customRenderer: (lead) => {
            const leadScore = parseInt(lead.score) || 0;
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#6366f1' }}>
                  {leadScore}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 20 }}>
                  <LinearProgress
                    variant="determinate"
                    value={leadScore}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha('#6366f1', 0.1),
                      '& .MuiLinearProgress-bar': { backgroundColor: '#6366f1' },
                    }}
                  />
                </Box>
              </Box>
            );
          },
          editable: false,
          align: 'left',
        },
      ],
    };
  }, [statuses, theme]);
};

/**
 * LeadTableRow - Compact table view for leads dashboard
 *
 * Now matches LeadCard fields:
 * - Name + Phone/Email
 * - Status (editable)
 * - Target Price
 * - Est. Commission
 * - Created Date
 * - Expiration Date
 * - Contacts circles
 * - Score
 */
const LeadTableRow = React.memo(({
  lead,
  onClick,
  onUpdate,
  onArchive,
  onDelete,
  onRestore,
  isArchived = false,
  isSelectable,
  isSelected,
  onSelect,
}) => {
  const { statuses } = useStatus();
  const leadStatuses = useMemo(() => statuses?.filter(s => s.entity_type === 'leads') || [], [statuses]);
  const config = useLeadTableConfig(leadStatuses);

  return (
    <TableRowTemplate
      data={lead}
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

LeadTableRow.displayName = 'LeadTableRow';

export default LeadTableRow;
