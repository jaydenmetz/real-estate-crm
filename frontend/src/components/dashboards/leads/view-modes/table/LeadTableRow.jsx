import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, FiberNew, Phone, Handshake } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, LinearProgress, alpha, useTheme } from '@mui/material';
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
// TABLE VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate table config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Table configuration object
 */
const useLeadTableConfig = (statuses) => {
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
      // Grid layout: 8 columns (Avatar+Name, Email, Phone, Status, Source, Score, Created, Actions)
      gridTemplateColumns: 'auto 2fr 1.5fr 1.2fr 1fr 1fr 1fr 80px',

      // Status config for row styling
      statusConfig: {
        getConfig: (lead) => {
          const status = lead.lead_status || lead.status || 'new';
          const config = getStatusConfig(status);
          return {
            color: config.color,
            bg: config.bg,
          };
        },
      },

      // Column configurations
      columns: [
        // Avatar + Name (editable)
        {
          label: 'Lead',
          field: (lead) => {
            const firstName = lead.firstName || lead.first_name || '';
            const lastName = lead.lastName || lead.last_name || '';
            return `${firstName} ${lastName}`.trim() || 'Unnamed Lead';
          },
          customRenderer: (lead, onEdit) => {
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
                  <Chip
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    size="small"
                    sx={{
                      fontSize: 9,
                      fontWeight: 600,
                      height: 18,
                      mt: 0.5,
                      background: alpha(statusConfig.color, 0.1),
                      color: statusConfig.color,
                    }}
                  />
                </Box>
              </Box>
            );
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
          align: 'left',
          bold: true,
          hoverColor: 'rgba(59, 130, 246, 0.08)',
        },

        // Email (editable)
        {
          label: 'Email',
          field: 'email',
          formatter: (value) => value || '—',
          editable: true,
          editor: EditLeadEmail,
          editorProps: (lead) => ({
            value: lead.email || '',
            data: lead,
          }),
          onSave: (lead, newEmail) => ({ email: newEmail }),
          align: 'left',
          color: theme.palette.text.secondary,
          hoverColor: alpha('#000', 0.05),
        },

        // Phone (editable)
        {
          label: 'Phone',
          field: 'phone',
          formatter: (value) => value || '—',
          editable: true,
          editor: EditLeadPhone,
          editorProps: (lead) => ({
            value: lead.phone || '',
            data: lead,
          }),
          onSave: (lead, newPhone) => ({ phone: newPhone }),
          align: 'left',
          color: theme.palette.text.secondary,
          hoverColor: alpha('#000', 0.05),
        },

        // Status (editable)
        {
          label: 'Status',
          field: (lead) => lead.lead_status || lead.status || 'new',
          formatter: (status) => {
            const config = getStatusConfig(status);
            return config.label;
          },
          isStatus: true,
          editable: true,
          statusOptions: statusOptions,
          onSave: (lead, newStatus) => ({ lead_status: newStatus }),
          align: 'left',
        },

        // Source (editable)
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
          align: 'left',
          hoverColor: alpha('#000', 0.05),
        },

        // Lead Score (custom renderer with progress bar)
        {
          label: 'Score',
          field: (lead) => parseInt(lead.score) || 0,
          customRenderer: (lead, onEdit) => {
            const leadScore = parseInt(lead.score) || 0;

            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.85rem', color: '#6366f1' }}>
                  {leadScore}
                </Typography>
                <Box sx={{ flex: 1, minWidth: 30 }}>
                  <LinearProgress
                    variant="determinate"
                    value={leadScore}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: alpha('#6366f1', 0.1),
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: '#6366f1',
                      },
                    }}
                  />
                </Box>
              </Box>
            );
          },
          editable: false, // Score is typically calculated, not manually edited
          align: 'left',
        },

        // Created Date (read-only)
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
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
 * Now uses TableRowTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - Grid layout with 8 columns (Avatar+Name, Email, Phone, Status, Source, Score, Created, Actions)
 * - Inline editors: name, email, phone, source, status
 * - Avatar with initials and status-colored gradient
 * - Lead score with progress bar visualization
 * - Status menu: dynamically populated from database
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 */
const LeadTableRow = React.memo(({
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
