import React, { useMemo } from 'react';
import { CardTemplate } from '../../../../../templates/Dashboard/view-modes';
import {
  CheckCircle,
  Cancel,
  CalendarToday,
  Schedule,
  EventAvailable,
  EventBusy,
  Pending,
  Route,
  Timer,
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { getStatusConfig, APPOINTMENT_STATUS } from '../../../../../constants/appointmentConfig';
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

import {
  APPOINTMENT_TYPE_LABELS,
  MEETING_MODES,
  VIRTUAL_MEETING_TYPE_LABELS,
} from '../../../../../constants/appointmentConfig';

/**
 * Format appointment type for display
 */
const formatAppointmentType = (type) => {
  if (!type) return 'Showing';
  // Use labels from config if available
  if (APPOINTMENT_TYPE_LABELS[type]) {
    return APPOINTMENT_TYPE_LABELS[type];
  }
  return type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ');
};

/**
 * Get primary attendee display name
 */
const getPrimaryAttendeeName = (attendees) => {
  if (!attendees || attendees.length === 0) return null;
  // Find primary attendee first
  const primary = attendees.find(a => a.is_primary);
  if (primary) return primary.display_name;
  // Fall back to first attendee
  return attendees[0]?.display_name || null;
};

/**
 * Format appointment time for display (12-hour format)
 */
const formatTime = (time) => {
  if (!time) return '';
  // If it's already a formatted string like "4:00 PM", return it
  if (time.includes && (time.includes('AM') || time.includes('PM'))) return time;
  // If it's 24-hour format, convert to 12-hour
  const [hours, minutes] = String(time).split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format date without year
 */
const formatDateNoYear = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${month} ${day}`;
};

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
 * Get icon for status
 */
const getStatusIcon = (status) => {
  const icons = {
    scheduled: Schedule,
    confirmed: EventAvailable,
    in_progress: Pending,
    completed: CheckCircle,
    cancelled: Cancel,
    no_show: EventBusy,
    rescheduled: Schedule,
    archived: Cancel,
  };
  return icons[status?.toLowerCase()] || Schedule;
};

/**
 * Get first stop address for subtitle
 */
const getFirstStopAddress = (appointment) => {
  // If we have stops array with at least one stop
  if (appointment.stops && appointment.stops.length > 0) {
    const firstStop = appointment.stops[0];
    const parts = [
      firstStop.location_address,
      firstStop.city,
      firstStop.state,
      firstStop.zip_code,
    ].filter(Boolean);
    return parts.join(', ') || null;
  }
  // Fall back to first_stop_address from API aggregation
  if (appointment.first_stop_address) {
    return appointment.first_stop_address;
  }
  // Fall back to legacy location field
  return appointment.location || null;
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
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate card config with database-driven status options
 *
 * NEW LAYOUT (per user spec):
 * - Title: "Appt Type - Contact Display Name"
 * - Subtitle: Initial location (Street Address, City, State, Zip)
 * - Metrics: Stops count (left) + Duration (right)
 * - Footer: Start date + time, End date, Attendees with circles
 *
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Card configuration object
 */
const useAppointmentCardConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options
    const statusOptions = statuses && statuses.length > 0
      ? statuses.map((status) => ({
          value: status.status_key,
          label: status.label,
          icon: getStatusIcon(status.status_key),
          color: status.color,
        }))
      : [
          { value: 'scheduled', label: 'Scheduled', icon: Schedule, color: '#3b82f6' },
          { value: 'confirmed', label: 'Confirmed', icon: EventAvailable, color: '#10b981' },
          { value: 'completed', label: 'Completed', icon: CheckCircle, color: '#6366f1' },
          { value: 'cancelled', label: 'Cancelled', icon: Cancel, color: '#ef4444' },
        ];

    return {
      // Image/Header Configuration
      image: {
        source: null, // No image for appointments
        fallbackIcon: CalendarToday,
        aspectRatio: '3 / 2',
        fallbackGradient: 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)',
      },

      // Status Chip Configuration (top-left, editable)
      status: {
        field: (appointment) => appointment.appointment_status || appointment.status || 'scheduled',
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
        onSave: (appointment, newStatus) => {
          return { appointment_status: newStatus };
        },
      },

      // Title Configuration: Use display_name or compute from appointment type + attendee
      title: {
        field: (appointment) => {
          // First check for custom display_name
          if (appointment.display_name) {
            return appointment.display_name;
          }
          // Fall back to computed: "Appt Type - Contact Display Name"
          const type = formatAppointmentType(appointment.appointment_type || appointment.type);
          const attendeeName = getPrimaryAttendeeName(appointment.attendees);

          if (attendeeName) {
            return `${type} - ${attendeeName}`;
          }
          // Fall back to legacy client_name if no attendees yet
          if (appointment.client_name || appointment.clientName) {
            return `${type} - ${appointment.client_name || appointment.clientName}`;
          }
          return type;
        },
        editable: true,
        editor: EditAppointmentType,
        editorProps: (appointment) => ({
          appointmentType: appointment.appointment_type || appointment.type || 'showing',
          meetingMode: appointment.meeting_mode || 'in_person',
          virtualMeetingType: appointment.virtual_meeting_type || 'video_call',
          displayName: appointment.display_name || '',
          initialStop: appointment.stops?.[0] || {
            location_address: appointment.location || appointment.first_stop_address || '',
            city: '',
            state: '',
            zip_code: '',
          },
        }),
        onSave: (appointment, data) => {
          // EditAppointmentType returns { appointment_type, meeting_mode, virtual_meeting_type, location data }
          const updates = {
            appointment_type: data.appointment_type || data.appointmentType,
            meeting_mode: data.meeting_mode || data.meetingMode,
            virtual_meeting_type: data.virtual_meeting_type || data.virtualMeetingType,
            display_name: data.display_name || data.displayName || '',
          };

          // Update or create first stop with initial location (only for in-person)
          if (data.meeting_mode === 'in_person' && (data.location_address || data.location)) {
            const existingStops = appointment.stops || [];
            const firstStop = existingStops[0] || { stop_order: 0, estimated_duration: 30 };

            updates.stops = [
              {
                ...firstStop,
                location_address: data.location_address || data.location,
                city: data.city || '',
                state: data.state || '',
                zip_code: data.zip_code || '',
                latitude: data.latitude || null,
                longitude: data.longitude || null,
              },
              ...existingStops.slice(1),
            ];
          }

          return updates;
        },
      },

      // Subtitle Configuration: Full address using displayNameStrategies
      subtitle: {
        formatter: (appointment) => {
          // For virtual meetings, show the virtual type
          if (appointment.meeting_mode === 'virtual') {
            const virtualType = appointment.virtual_meeting_type || 'video_call';
            return VIRTUAL_MEETING_TYPE_LABELS[virtualType] || 'Virtual Meeting';
          }
          // For in-person, use centralized subtitle strategy (full address)
          return getSubtitle('appointment', appointment) || getFirstStopAddress(appointment) || 'No location set';
        },
        editable: true,
        editor: EditAppointmentType,
        editorProps: (appointment) => ({
          appointmentType: appointment.appointment_type || appointment.type || 'showing',
          meetingMode: appointment.meeting_mode || 'in_person',
          virtualMeetingType: appointment.virtual_meeting_type || 'video_call',
          displayName: appointment.display_name || '',
          initialStop: appointment.stops?.[0] || {
            location_address: appointment.location || appointment.first_stop_address || '',
            city: '',
            state: '',
            zip_code: '',
          },
        }),
        onSave: (appointment, data) => {
          // Same logic as title onSave
          const updates = {
            appointment_type: data.appointment_type || data.appointmentType,
            meeting_mode: data.meeting_mode || data.meetingMode,
            virtual_meeting_type: data.virtual_meeting_type || data.virtualMeetingType,
            display_name: data.display_name || data.displayName || '',
          };

          if (data.meeting_mode === 'in_person' && (data.location_address || data.location)) {
            const existingStops = appointment.stops || [];
            const firstStop = existingStops[0] || { stop_order: 0, estimated_duration: 30 };

            updates.stops = [
              {
                ...firstStop,
                location_address: data.location_address || data.location,
                city: data.city || '',
                state: data.state || '',
                zip_code: data.zip_code || '',
                latitude: data.latitude || null,
                longitude: data.longitude || null,
              },
              ...existingStops.slice(1),
            ];
          }

          return updates;
        },
      },

      // Metrics Configuration: Additional Stops (left) + Duration (right)
      metrics: [
        // Additional stops count (editable) - excludes first stop which is the initial location
        {
          label: '+ Stops',
          field: (appointment) => {
            // Count additional stops (excluding first one)
            const stopCount = appointment.stop_count || appointment.stops?.length || 1;
            return Math.max(0, stopCount - 1);  // Exclude first stop
          },
          formatter: (value) => String(value),
          color: {
            primary: '#3b82f6',
            secondary: '#2563eb',
            bg: alpha('#3b82f6', 0.08),
          },
          icon: Route,
          editable: true,
          editor: EditStops,
          editorProps: (appointment) => ({
            value: appointment.stops || [],
            data: appointment,
            excludeFirstStop: true,  // Only manage additional stops
          }),
          onSave: (appointment, stops) => {
            return { stops };
          },
        },

        // Duration (calculated from all stops)
        {
          label: 'Duration',
          field: (appointment) => getTotalDuration(appointment),
          formatter: (value) => formatDuration(value),
          color: {
            primary: '#10b981',
            secondary: '#059669',
            bg: alpha('#10b981', 0.08),
          },
          icon: Timer,
          editable: false, // Duration is calculated from stops
        },
      ],

      // Footer Configuration: Start date/time + End date + Attendees
      footer: {
        fields: [
          // Start date + time (no year)
          {
            label: 'Start',
            field: (appointment) => {
              const date = appointment.appointment_date || appointment.date;
              const time = appointment.appointment_time || appointment.time;
              if (!date) return null;
              return { date, time };
            },
            formatter: (value) => {
              if (!value) return 'TBD';
              const dateStr = formatDateNoYear(value.date);
              const timeStr = value.time ? formatTime(value.time) : '';
              return timeStr ? `${dateStr} ${timeStr}` : dateStr;
            },
            editable: true,
            editor: EditAppointmentDate,
            onSave: (appointment, newDate) => {
              return { appointment_date: newDate };
            },
          },

          // End date (no year) - calculated from start + duration
          {
            label: 'End',
            field: (appointment) => {
              const startDate = appointment.appointment_date || appointment.date;
              const startTime = appointment.appointment_time || appointment.time;
              const duration = getTotalDuration(appointment);

              if (!startDate || !startTime) return null;

              // Calculate end time
              const [hours, minutes] = String(startTime).split(':').map(Number);
              const startMinutes = hours * 60 + minutes;
              const endMinutes = startMinutes + duration;

              const endHours = Math.floor(endMinutes / 60) % 24;
              const endMins = endMinutes % 60;

              // Check if appointment spans to next day
              const spansToNextDay = endMinutes >= 24 * 60;

              return {
                date: startDate,
                time: `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`,
                spansToNextDay,
              };
            },
            formatter: (value) => {
              if (!value) return 'TBD';
              const timeStr = formatTime(value.time);
              if (value.spansToNextDay) {
                return `${timeStr} +1d`;
              }
              return timeStr;
            },
            editable: false, // End time is calculated
          },

          // Attendees with circles (editable)
          {
            label: 'Attendees',
            field: 'attendees',
            customRenderer: (appointment, onEdit) => {
              const attendees = appointment.attendees || [];
              return (
                <AttendeeCircles
                  attendees={attendees}
                  onEdit={onEdit}
                  maxVisible={4}
                />
              );
            },
            editable: true,
            editor: EditAttendees,
            editorProps: (appointment) => ({
              value: appointment.attendees || [],
              data: appointment,
            }),
            onSave: (appointment, attendees) => {
              return { attendees };
            },
          },
        ],
      },

      // Badges Configuration (show Today/Soon badges)
      badges: {
        enabled: true,
        getCustomBadge: (appointment) => {
          const dateField = appointment.appointment_date || appointment.date;
          if (!dateField) return null;

          const appointmentDate = new Date(dateField);
          const today = new Date();
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);

          // Check if today
          if (appointmentDate.toDateString() === today.toDateString()) {
            return {
              label: 'TODAY',
              color: '#ef4444',
              animate: true,
            };
          }

          // Check if tomorrow or within 24 hours
          const hoursUntil = (appointmentDate - today) / (1000 * 60 * 60);
          if (hoursUntil > 0 && hoursUntil <= 24) {
            return {
              label: 'SOON',
              color: '#f59e0b',
            };
          }

          return null;
        },
      },

      // Relative Time Configuration
      relativeTime: {
        enabled: true,
        field: (appointment) => appointment.appointment_date || appointment.date,
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
 * AppointmentCard - Card view for appointments dashboard
 *
 * NEW LAYOUT (per user specification):
 * - Title: "Appt Type - Contact Display Name"
 * - Subtitle: Initial location (full address)
 * - Metrics: Stops count (editable, opens multi-stop editor) + Duration
 * - Footer: Start date/time (no year), End time, Attendees with circles
 *
 * Features:
 * - Multi-stop appointments with individual scheduling
 * - Multiple attendees (clients, leads) with visual circles
 * - Inline editors for all fields
 * - Status menu dynamically populated from database
 * - Today/Soon badges for upcoming appointments
 * - End time calculated from start + total duration
 */
const AppointmentCard = React.memo(({
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
  // Get statuses from context
  const { statuses } = useStatus();

  // Generate config with database-driven status options
  const config = useAppointmentCardConfig(statuses);

  return (
    <CardTemplate
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

AppointmentCard.displayName = 'AppointmentCard';

export default AppointmentCard;
