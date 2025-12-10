import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, Person, Schedule } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { getStatusConfig } from '../../../../../constants/clientConfig';
import { formatCurrency, formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditClientName,
  EditClientEmail,
  EditClientPhone,
  EditClientBudget,
} from '../../editors';

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
      // Grid layout: 8 columns (Avatar+Name, Email, Phone, Status, Budget, Created, Last Contact, Actions)
      gridTemplateColumns: 'auto 2fr 1.5fr 1.2fr 1fr 1fr 1fr 80px',

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

      // Column configurations
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
          editor: EditClientName,
          editorProps: (client) => ({
            value: `${client.firstName || client.first_name || ''} ${client.lastName || client.last_name || ''}`.trim(),
            data: client,
          }),
          onSave: (client, nameData) => ({
            first_name: nameData.first_name,
            last_name: nameData.last_name,
          }),
          align: 'left',
          bold: true,
          hoverColor: 'rgba(16, 185, 129, 0.08)',
        },

        // Email (editable)
        {
          label: 'Email',
          field: 'email',
          formatter: (value) => value || '—',
          editable: true,
          editor: EditClientEmail,
          editorProps: (client) => ({
            value: client.email || '',
            data: client,
          }),
          onSave: (client, newEmail) => ({ email: newEmail }),
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

        // Budget (editable)
        {
          label: 'Budget',
          field: (client) => parseFloat(client.budget || client.max_budget || 0),
          formatter: (value) => value > 0 ? formatCurrency(value) : '—',
          editable: true,
          editor: EditClientBudget,
          editorProps: (client) => ({
            value: client.budget || client.max_budget || 0,
            data: client,
          }),
          onSave: (client, newBudget) => ({ budget: newBudget, max_budget: newBudget }),
          align: 'left',
          bold: true,
          color: '#10b981',
          hoverColor: 'rgba(16, 185, 129, 0.08)',
        },

        // Created Date (read-only)
        {
          label: 'Created',
          field: 'created_at',
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: false,
          align: 'left',
        },

        // Last Contact (read-only)
        {
          label: 'Last Contact',
          field: (client) => client.last_contact || client.last_contactDate,
          formatter: (value) => value ? formatDate(value, 'MMM d') : '—',
          editable: false,
          align: 'left',
          color: '#6366f1',
        },
      ],
    };
  }, [statuses, theme]);
};

/**
 * ClientTableRow - Compact table view for clients dashboard
 *
 * Now uses TableRowTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - Grid layout with 8 columns (Avatar+Name, Email, Phone, Status, Budget, Created, Last Contact, Actions)
 * - Inline editors: name, email, phone, budget, status
 * - Avatar with initials and status-colored gradient
 * - Status menu: dynamically populated from database
 * - Click vs drag: text selection support
 * - Hover effects and transitions
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
