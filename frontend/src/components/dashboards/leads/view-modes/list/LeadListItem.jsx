import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, FiberNew, Phone, Handshake } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, LinearProgress, alpha, useTheme } from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import { getStatusConfig, LEAD_SOURCE_LABELS } from '../../../../../constants/leadConfig';
import { formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditLeadName,
  EditLeadEmail,
  EditLeadPhone,
  EditLeadSource,
} from '../../editors';

// ============================================================================
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} List configuration object
 */
const useLeadListConfig = (statuses) => {
  const theme = useTheme();

  return useMemo(() => {
    // Transform database statuses into dropdown options
    // Fallback to hardcoded options if database statuses not loaded yet
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
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  right: 8,
                }}
              >
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

      // Status configuration
      status: {
        field: (lead) => lead.lead_status || lead.status || 'new',
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
        onSave: (lead, newStatus) => ({ lead_status: newStatus }),
      },

      // Title configuration (name + type chip)
      title: {
        field: (lead) => {
          const firstName = lead.firstName || lead.first_name || '';
          const lastName = lead.lastName || lead.last_name || '';
          return `${firstName} ${lastName}`.trim() || 'Unnamed Lead';
        },
        editable: true,
        editor: EditLeadName,
        editorProps: (lead) => ({
          value: `${lead.firstName || lead.first_name || ''} ${lead.lastName || lead.last_name || ''}`.trim(),
          data: lead,
        }),
        onSave: (lead, nameData) => ({
          first_name: nameData.first_name,
          last_name: nameData.last_name,
        }),
        customRenderer: (lead, onEdit) => {
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

      // Subtitle with contact info
      subtitle: {
        formatter: (lead) => {
          const parts = [];
          if (lead.email) parts.push(lead.email);
          if (lead.phone) parts.push(lead.phone);
          return parts.join(' | ');
        },
      },

      // Metrics row
      metrics: [
        // Source
        {
          label: 'Source',
          field: 'source',
          formatter: (value) => {
            if (!value) return '—';
            return LEAD_SOURCE_LABELS[value] || value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ');
          },
          editable: true,
          editor: EditLeadSource,
          editorProps: (lead) => ({
            value: lead.source || '',
            data: lead,
          }),
          onSave: (lead, newSource) => ({ source: newSource }),
        },

        // Created Date
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: false,
        },

        // Last Contact
        {
          label: 'Last Contact',
          field: 'last_contact',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: false,
          color: '#6366f1',
        },
      ],
    };
  }, [statuses, theme]);
};

/**
 * LeadListItem - Full-width horizontal list view for leads dashboard
 *
 * Now uses ListItemTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - Avatar with initials, status-colored gradient, and lead score
 * - Editable name with lead type chip
 * - Contact info (email, phone) in subtitle
 * - Metrics: Source, Created, Last Contact
 * - Status menu: dynamically populated from database
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 */
const LeadListItem = React.memo(({
  lead,
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
  // Get statuses from context (entity type is 'leads')
  const { statuses } = useStatus();

  // Filter to lead statuses only
  const leadStatuses = useMemo(() => {
    return statuses?.filter(s => s.entity_type === 'leads') || [];
  }, [statuses]);

  // Generate config with database-driven status options
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
