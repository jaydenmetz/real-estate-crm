import React, { useMemo } from 'react';
import { ListItemTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  CalendarToday,
  Schedule,
  EventAvailable,
  EventBusy,
} from '@mui/icons-material';
import { getStatusConfig } from '../../../../../constants/appointmentConfig';
import { formatDate } from '../../../../../utils/formatters';
import { getAppointmentDisplayName, getSubtitle } from '../../../../../utils/displayNameStrategies';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditAppointmentType,
  EditAppointmentDate,
  EditAppointmentTime,
  EditAppointmentLocation,
  EditAppointmentStatus,
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
// LIST VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate list config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} List configuration object
 */
const useAppointmentListConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: status.status_key === 'cancelled' ? Cancel : CheckCircle,
          color: status.color,
        }))
      : [
          { value: 'scheduled', label: 'Scheduled', icon: Schedule, color: '#3b82f6' },
          { value: 'confirmed', label: 'Confirmed', icon: EventAvailable, color: '#10b981' },
          { value: 'completed', label: 'Completed', icon: CheckCircle, color: '#6366f1' },
          { value: 'cancelled', label: 'Cancelled', icon: EventBusy, color: '#ef4444' },
          { value: 'no_show', label: 'No Show', icon: Cancel, color: '#f59e0b' },
        ];

    return {
      // Image/Left Section Configuration - Calendar icon with date
      image: {
        source: () => null, // No image, will show date section
        fallbackIcon: CalendarToday,
        width: 120,
        customRender: (appointment) => {
          const date = appointment.appointment_date || appointment.appointmentDate;
          const time = appointment.appointment_time || appointment.appointmentTime;
          const status = appointment.appointment_status || appointment.status || 'scheduled';
          const config = getStatusConfig(status);

          return {
            type: 'date-display',
            date,
            time,
            color: config.color,
          };
        },
      },

      // Status Chip Configuration (editable)
      status: {
        field: (apt) => apt.appointment_status || apt.status || 'scheduled',
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
        editor: EditAppointmentStatus,
        onSave: (appointment, newStatus) => {
          return { appointment_status: newStatus };
        },
      },

      // Title Configuration
      title: {
        field: (apt) => apt.title || getAppointmentDisplayName(apt) || 'Untitled Appointment',
        editable: false,
      },

      // Subtitle Configuration - Location (matches Card)
      subtitle: {
        formatter: (apt) => {
          // Use centralized subtitle strategy (full address) like Card
          return getSubtitle('appointment', apt) || apt.location || apt.first_stop_address || 'No location set';
        },
      },

      // Metrics Configuration - Matches AppointmentCard: + Stops, Duration, Start, End
      metrics: [
        // + Stops (editable)
        {
          label: '+ Stops',
          field: (apt) => {
            const stopCount = apt.stop_count || apt.stops?.length || 1;
            return Math.max(0, stopCount - 1);
          },
          formatter: (value) => String(value),
          color: '#3b82f6',
          editable: true,
          editor: EditStops,
          editorProps: (apt) => ({
            value: apt.stops || [],
            data: apt,
            excludeFirstStop: true,
          }),
          onSave: (apt, stops) => ({ stops }),
        },
        // Duration (calculated)
        {
          label: 'Duration',
          field: (apt) => getTotalDuration(apt),
          formatter: (value) => formatDuration(value),
          color: '#10b981',
          editable: false,
        },
        // Start date/time
        {
          label: 'Start',
          field: (apt) => {
            const date = apt.appointment_date || apt.date;
            const time = apt.appointment_time || apt.time;
            if (!date) return null;
            const dateStr = date ? formatDate(date, 'MMM d') : 'TBD';
            const timeStr = time ? formatTime(time) : '';
            return timeStr ? `${dateStr} ${timeStr}` : dateStr;
          },
          formatter: (value) => value || 'TBD',
          editable: true,
          editor: EditAppointmentDate,
          editorProps: (apt) => ({
            value: apt.appointment_date || apt.appointmentDate,
            data: apt,
          }),
          onSave: (apt, newDate) => ({ appointment_date: newDate }),
        },
        // End time (calculated)
        {
          label: 'End',
          field: (apt) => {
            const startTime = apt.appointment_time || apt.time;
            const duration = getTotalDuration(apt);
            if (!startTime) return 'TBD';
            const [hours, minutes] = String(startTime).split(':').map(Number);
            const startMinutes = hours * 60 + minutes;
            const endMinutes = startMinutes + duration;
            const endHours = Math.floor(endMinutes / 60) % 24;
            const endMins = endMinutes % 60;
            const spansToNextDay = endMinutes >= 24 * 60;
            const timeStr = formatTime(`${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`);
            return spansToNextDay ? `${timeStr} +1d` : timeStr;
          },
          formatter: (value) => value || 'TBD',
          editable: false,
        },

        // Attendees (editable) - in metrics row like Escrows
        {
          label: (apt) => {
            const attendees = apt.attendees || [];
            return attendees.length === 1 ? 'Attendee' : 'Attendees';
          },
          field: 'attendees',
          customRenderer: (apt, onEdit) => {
            const attendees = apt.attendees || apt.clients || [];
            return (
              <AttendeeCircles
                attendees={attendees}
                onEdit={onEdit}
                maxVisible={4}
                disableHover
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
        },
      ],

      // Quick Actions Configuration
      actions: {
        view: true,
        archive: true,
        restore: true,
        delete: true,
      },
    };
  }, [statuses]);
};

/**
 * AppointmentListItem - List view for appointments dashboard
 *
 * Uses ListItemTemplate for consistent list layout across the app.
 * Matches the design pattern of EscrowListItem.
 *
 * Layout:
 * - Left: Date/Time section with calendar icon
 * - Content: Title, Type chip, Location, Duration, Client
 * - Right: Status chip + Actions
 */
const AppointmentListItem = React.memo(({
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
  // Get database-driven statuses from context
  const { statuses } = useStatus();

  // Generate config with database statuses
  const config = useAppointmentListConfig(statuses);

  return (
    <ListItemTemplate
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

AppointmentListItem.displayName = 'AppointmentListItem';

export default AppointmentListItem;
