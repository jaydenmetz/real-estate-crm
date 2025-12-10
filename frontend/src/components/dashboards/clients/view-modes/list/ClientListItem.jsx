import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, Person, Schedule } from '@mui/icons-material';
import { Avatar, Box, Typography, Chip, alpha, useTheme } from '@mui/material';
import { getStatusConfig, CLIENT_STATUS_CONFIG } from '../../../../../constants/clientConfig';
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

      // Status configuration
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

      // Title configuration (name + type chip)
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
        onSave: (client, nameData) => ({
          first_name: nameData.first_name,
          last_name: nameData.last_name,
        }),
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
          if (client.email) parts.push(client.email);
          if (client.phone) parts.push(client.phone);
          return parts.join(' | ');
        },
      },

      // Metrics row
      metrics: [
        // Budget
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
          color: '#10b981',
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
          field: (client) => client.last_contact || client.last_contactDate,
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: false,
          color: '#6366f1',
        },
      ],
    };
  }, [statuses, theme]);
};

/**
 * ClientListItem - Full-width horizontal list view for clients dashboard
 *
 * Now uses ListItemTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - Avatar with initials and status-colored gradient
 * - Editable name with client type chip
 * - Contact info (email, phone) in subtitle
 * - Metrics: Budget, Created, Last Contact
 * - Status menu: dynamically populated from database
 * - Click vs drag: text selection support
 * - Hover effects and transitions
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
