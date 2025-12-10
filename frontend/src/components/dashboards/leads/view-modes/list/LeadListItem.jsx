import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, FiberNew, Phone, Handshake } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, LinearProgress, alpha, useTheme } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { getStatusConfig, LEAD_SOURCE_LABELS } from '../../../../../constants/leadConfig';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { getLeadDisplayName, getSubtitle } from '../../../../../utils/displayNameStrategies';
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// ============================================================================
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config with database-driven status options
 * Matches LeadCard fields: Status, Name, Phone+Email, Target Price, Est. Commission, Created, Expires, Contacts
 */
const useLeadListConfig = (statuses) => {
  const theme = useTheme();

  return useMemo(() => {
    // Transform database statuses into dropdown options
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
      // Custom image section with avatar and score
      image: {
        width: 120,
        customRenderer: (lead) => {
          const firstName = lead.firstName || lead.first_name || '';
          const lastName = lead.lastName || lead.last_name || '';
          const initials = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase();
          const status = lead.lead_status || lead.status || 'new';
          const statusConfig = getStatusConfig(status);
          const leadScore = parseInt(lead.score) || 0;

          return (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
                position: 'relative',
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

              {/* Lead Score Badge */}
              <Box sx={{ position: 'absolute', bottom: 8, left: 8, right: 8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                  <TrendingUp sx={{ fontSize: 12, color: 'white' }} />
                  <Typography variant="caption" sx={{ fontSize: '0.65rem', color: 'white', fontWeight: 600 }}>
                    Score: {leadScore}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={leadScore}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${statusConfig.color} 0%, #10b981 100%)`,
                    },
                  }}
                />
              </Box>
            </Box>
          );
        },
      },

      // Status configuration (editable)
      status: {
        field: (lead) => lead.lead_status || lead.status || 'new',
        getConfig: (status) => {
          const config = getStatusConfig(status);
          return { label: config.label, color: config.color, bg: config.bg };
        },
        editable: true,
        options: statusOptions,
        onSave: (lead, newStatus) => ({ lead_status: newStatus }),
      },

      // Title configuration (name + type chip)
      title: {
        field: (lead) => getLeadDisplayName(lead),
        editable: false, // Match LeadCard - no inline name editing
        customRenderer: (lead) => {
          const firstName = lead.firstName || lead.first_name || '';
          const lastName = lead.lastName || lead.last_name || '';
          const fullName = `${firstName} ${lastName}`.trim() || 'Unnamed Lead';
          const type = lead.leadType || lead.lead_type || 'buyer';
          const status = lead.lead_status || lead.status || 'new';
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

      // Subtitle with contact info (phone + email)
      subtitle: {
        formatter: (lead) => getSubtitle('lead', lead) || 'No contact info',
      },

      // Metrics row - matches LeadCard: Target Price, Est. Commission
      metrics: [
        // Target Price (read-only like LeadCard)
        {
          label: 'Target Price',
          field: (lead) => lead.target_price || lead.budget || 0,
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          color: '#10b981',
          editable: false,
        },

        // Est. Commission (3% of target price, read-only like LeadCard)
        {
          label: 'Est. Commission',
          field: (lead) => {
            const targetPrice = lead.target_price || lead.budget || 0;
            const commissionRate = lead.commission_rate || 0.03;
            return targetPrice * commissionRate;
          },
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          color: '#6366f1',
          editable: false,
        },

        // Created Date (read-only like LeadCard)
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => formatCompactDate(value),
          editable: false,
        },

        // Expiration Date (read-only like LeadCard)
        {
          label: 'Expires',
          field: (lead) => lead.expiration_date || lead.expires_at,
          formatter: (value) => formatCompactDate(value),
          editable: false,
        },
      ],

      // Footer with Contacts (like LeadCard)
      footer: {
        fields: [
          {
            label: (lead) => {
              const contacts = lead.contacts || [];
              return contacts.length === 1 ? 'Contact' : 'Contacts';
            },
            field: 'contacts',
            customRenderer: (lead) => {
              const contacts = lead.contacts || [];
              // If no contacts, show the lead itself as a "contact"
              if (contacts.length === 0 && (lead.first_name || lead.last_name)) {
                const leadAsContact = [{
                  id: lead.id,
                  first_name: lead.first_name,
                  last_name: lead.last_name,
                  email: lead.email,
                  phone: lead.phone,
                }];
                return (
                  <ClientCircles
                    clients={{ buyers: leadAsContact, sellers: [] }}
                    representationType="buyer"
                    maxVisible={6}
                  />
                );
              }
              return (
                <ClientCircles
                  clients={{ buyers: contacts, sellers: [] }}
                  representationType="buyer"
                  maxVisible={6}
                />
              );
            },
            editable: false,
          },
        ],
      },
    };
  }, [statuses, theme]);
};

/**
 * LeadListItem - Full-width horizontal list view for leads dashboard
 *
 * Now matches LeadCard fields:
 * - Status (editable)
 * - Name + Type chip
 * - Phone + Email (subtitle)
 * - Target Price
 * - Est. Commission
 * - Created Date
 * - Expiration Date
 * - Contacts circles
 */
const LeadListItem = React.memo(({
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
  const config = useLeadListConfig(leadStatuses);

  return (
    <ListItemTemplate
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

LeadListItem.displayName = 'LeadListItem';

export default LeadListItem;
