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
import { getAppointmentDisplayName } from '../../../../../utils/displayNameStrategies';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditAppointmentType,
  EditAppointmentDate,
  EditAppointmentTime,
  EditAppointmentLocation,
  EditAppointmentStatus,
} from '../../editors';

// Import AttendeeCircles component
import { AttendeeCircles } from '../../../../common/ui/AttendeeCircles';

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

      // Subtitle Configuration
      subtitle: {
        formatter: (apt) => {
          const type = apt.appointment_type || apt.appointmentType || 'showing';
          return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
        },
      },

      // Metrics Configuration
      metrics: [
        // Location
        {
          label: 'Location',
          field: 'location',
          formatter: (value) => value || 'No location set',
          editable: true,
          editor: EditAppointmentLocation,
          onSave: (apt, newValue) => ({ location: newValue }),
        },
        // Duration
        {
          label: 'Duration',
          field: (apt) => apt.duration || 60,
          formatter: (value) => `${value} min`,
          editable: false,
        },
        // Client
        {
          label: 'Client',
          field: (apt) => apt.client_name || apt.clientName || '',
          formatter: (value) => value || 'No client',
          editable: false,
        },
      ],

      // Footer Configuration - Attendees
      footer: {
        fields: [
          {
            label: 'Attendees',
            field: (apt) => apt.attendees || apt.clients || [],
            formatter: (value, apt) => {
              if (!value || value.length === 0) return null;
              return (
                <AttendeeCircles
                  attendees={value}
                  maxVisible={4}
                />
              );
            },
            editable: false,
          },
        ],
      },

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
