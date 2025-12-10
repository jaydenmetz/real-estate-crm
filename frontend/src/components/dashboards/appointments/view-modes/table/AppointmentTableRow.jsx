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
  EditStops,
  EditAttendees,
} from '../../editors';

// Import AttendeeCircles component
import { AttendeeCircles } from '../../../../common/ui/AttendeeCircles';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format duration in minutes
 */
const formatDuration = (minutes) => {
  if (!minutes) return '30 min';
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format appointment time for display (12-hour format)
 */
const formatTime = (time) => {
  if (!time) return '';
  if (time.includes && (time.includes('AM') || time.includes('PM'))) return time;
  const [hours, minutes] = String(time).split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Calculate total duration from all stops
 */
const getTotalDuration = (appointment) => {
  if (appointment.stops && appointment.stops.length > 0) {
    return appointment.stops.reduce((sum, stop) => sum + (stop.estimated_duration || 30), 0);
  }
  return appointment.duration || 30;
};

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
      // Grid layout: 10 columns (Title+Type, Status, +Stops, Duration, Start, End, Location, Attendees, Actions)
      gridTemplateColumns: '2fr 1fr 70px 80px 1fr 80px 1.2fr 100px 80px',

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

        // + Stops (editable)
        {
          label: '+ Stops',
          field: (apt) => {
            const stopCount = apt.stop_count || apt.stops?.length || 1;
            return Math.max(0, stopCount - 1);
          },
          formatter: (value) => String(value),
          editable: true,
          editor: EditStops,
          editorProps: (apt) => ({
            value: apt.stops || [],
            data: apt,
            excludeFirstStop: true,
          }),
          onSave: (apt, stops) => ({ stops }),
          align: 'left',
          bold: true,
          color: '#3b82f6',
        },

        // Duration (calculated)
        {
          label: 'Duration',
          field: (apt) => getTotalDuration(apt),
          formatter: (value) => formatDuration(value),
          editable: false,
          align: 'left',
          color: '#10b981',
        },

        // Start date/time (editable)
        {
          label: 'Start',
          field: (apt) => {
            const date = apt.appointment_date || apt.date;
            const time = apt.appointment_time || apt.time;
            if (!date) return '—';
            const dateStr = formatDate(date, 'MMM d');
            const timeStr = time ? formatTime(time) : '';
            return timeStr ? `${dateStr} ${timeStr}` : dateStr;
          },
          formatter: (value) => value || '—',
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

        // End time (calculated)
        {
          label: 'End',
          field: (apt) => {
            const startTime = apt.appointment_time || apt.time;
            const duration = getTotalDuration(apt);
            if (!startTime) return '—';
            const [hours, minutes] = String(startTime).split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + duration;
            const endHours = Math.floor(endMinutes / 60) % 24;
            const endMins = endMinutes % 60;
            const spansToNextDay = endMinutes >= 24 * 60;
            const timeStr = formatTime(`${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`);
            return spansToNextDay ? `${timeStr} +1d` : timeStr;
          },
          formatter: (value) => value || '—',
          editable: false,
          align: 'left',
        },

        // Location (editable)
        {
          label: 'Location',
          field: (apt) => apt.location || apt.first_stop_address,
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

        // Attendees (editable)
        {
          label: 'Attendees',
          field: 'attendees',
          customRenderer: (apt, onEdit) => {
            const attendees = apt.attendees || [];
            return (
              <AttendeeCircles
                attendees={attendees}
                onEdit={onEdit}
                maxVisible={3}
                size="small"
              />
            );
          },
          editable: true,
          editor: EditAttendees,
          editorProps: (apt) => ({
            value: apt.attendees || [],
            data: apt,
          }),
          onSave: (apt, attendees) => ({ attendees }),
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
