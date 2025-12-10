import React, { useMemo } from 'react';
import { TableRowTemplate } from '../../../../../templates/Dashboard/view-modes';
import { CheckCircle, Cancel, Schedule, EventRepeat } from '@mui/icons-material';
import { alpha, Chip, Box, Typography, useTheme } from '@mui/material';
import { getStatusConfig, APPOINTMENT_TYPE_LABELS } from '../../../../../constants/appointmentConfig';
import { formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditAppointmentTitle,
  EditAppointmentType,
  EditAppointmentDate,
  EditAppointmentTime,
  EditAppointmentStatus,
  EditAppointmentLocation,
} from '../../editors';

// ============================================================================
// TABLE VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate table config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Table configuration object
 */
const useAppointmentTableConfig = (statuses) => {
  const theme = useTheme();

  return useMemo(() => {
    // Transform database statuses into dropdown options
    // Fallback to hardcoded options if database statuses not loaded yet
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: status.status_key === 'cancelled' || status.status_key === 'no_show' ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'scheduled', label: 'Scheduled', icon: Schedule, color: '#3b82f6' },
          { value: 'confirmed', label: 'Confirmed', icon: CheckCircle, color: '#10b981' },
          { value: 'rescheduled', label: 'Rescheduled', icon: EventRepeat, color: '#8b5cf6' },
          { value: 'completed', label: 'Completed', icon: CheckCircle, color: '#6366f1' },
          { value: 'cancelled', label: 'Cancelled', icon: Cancel, color: '#ef4444' },
          { value: 'no_show', label: 'No-Show', icon: Cancel, color: '#dc2626' },
        ];

    return {
      // Grid layout: 7 columns (Title+Type, Date, Time, Location, Client, Status, Actions)
      gridTemplateColumns: '2fr 1fr 1fr 1.5fr 1fr 1fr 80px',

      // Status config for row styling
      statusConfig: {
        getConfig: (appointment) => {
          const status = appointment.appointment_status || appointment.status || 'scheduled';
          const config = getStatusConfig(status);
          return {
            color: config.color,
            bg: config.bg,
          };
        },
      },

      // Column configurations
      columns: [
        // Title + Type (editable)
        {
          label: 'Appointment',
          field: (apt) => apt.title || 'Untitled Appointment',
          customRenderer: (apt, onEdit) => {
            const type = apt.appointmentType || apt.appointment_type || 'showing';
            const status = apt.appointment_status || apt.status || 'scheduled';
            const statusConfig = getStatusConfig(status);
            const typeLabel = APPOINTMENT_TYPE_LABELS[type] || type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');

            return (
              <Box sx={{ minWidth: 0 }}>
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
                  {apt.title || 'Untitled Appointment'}
                </Typography>
                <Chip
                  label={typeLabel}
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
            );
          },
          editable: true,
          editor: EditAppointmentTitle,
          editorProps: (apt) => ({
            value: apt.title || '',
            data: apt,
          }),
          onSave: (apt, newTitle) => ({ title: newTitle }),
          align: 'left',
          bold: true,
          hoverColor: 'rgba(59, 130, 246, 0.08)',
        },

        // Date (editable)
        {
          label: 'Date',
          field: (apt) => apt.appointment_date || apt.appointmentDate,
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : '—',
          editable: true,
          editor: EditAppointmentDate,
          editorProps: (apt) => ({
            value: apt.appointment_date || apt.appointmentDate,
            data: apt,
          }),
          onSave: (apt, newDate) => ({ appointment_date: newDate }),
          align: 'left',
          hoverColor: alpha('#000', 0.05),
        },

        // Time (editable)
        {
          label: 'Time',
          field: (apt) => apt.appointment_time || apt.appointmentTime,
          formatter: (value) => value || '—',
          editable: true,
          editor: EditAppointmentTime,
          editorProps: (apt) => ({
            value: apt.appointment_time || apt.appointmentTime,
            data: apt,
          }),
          onSave: (apt, newTime) => ({ appointment_time: newTime }),
          align: 'left',
          hoverColor: alpha('#000', 0.05),
        },

        // Location (editable)
        {
          label: 'Location',
          field: (apt) => apt.location,
          formatter: (value) => value || '—',
          editable: true,
          editor: EditAppointmentLocation,
          editorProps: (apt) => ({
            value: apt.location || '',
            data: apt,
          }),
          onSave: (apt, newLocation) => ({ location: newLocation }),
          align: 'left',
          color: theme.palette.text.secondary,
          hoverColor: alpha('#000', 0.05),
        },

        // Client (read-only for now)
        {
          label: 'Client',
          field: (apt) => apt.client_name || apt.clientName,
          formatter: (value) => value || '—',
          editable: false,
          align: 'left',
          color: theme.palette.text.secondary,
        },

        // Status (editable)
        {
          label: 'Status',
          field: (apt) => apt.appointment_status || apt.status || 'scheduled',
          formatter: (status) => {
            const config = getStatusConfig(status);
            return config.label;
          },
          isStatus: true,
          editable: true,
          statusOptions: statusOptions,
          onSave: (apt, newStatus) => ({ appointment_status: newStatus }),
          align: 'left',
        },
      ],
    };
  }, [statuses, theme]);
};

/**
 * AppointmentTableRow - Compact table view for appointments dashboard
 *
 * Now uses TableRowTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Features:
 * - Grid layout with 7 columns (Title+Type, Date, Time, Location, Client, Status, Actions)
 * - Inline editors: title, date, time, location, status
 * - Status menu: dynamically populated from database
 * - Click vs drag: text selection support
 * - Hover effects and transitions
 * - QuickActionsMenu
 */
const AppointmentTableRow = React.memo(({
  appointment,
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
  // Get statuses from context (entity type is 'appointments')
  const { statuses } = useStatus();

  // Filter to appointment statuses only
  const appointmentStatuses = useMemo(() => {
    return statuses?.filter(s => s.entity_type === 'appointments') || [];
  }, [statuses]);

  // Generate config with database-driven status options
  const config = useAppointmentTableConfig(appointmentStatuses);

  return (
    <TableRowTemplate
      data={appointment}
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

AppointmentTableRow.displayName = 'AppointmentTableRow';

export default AppointmentTableRow;
