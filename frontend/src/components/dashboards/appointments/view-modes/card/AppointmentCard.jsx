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
} from '@mui/icons-material';
import { alpha } from '@mui/material';
import { getStatusConfig, APPOINTMENT_STATUS } from '../../../../../constants/appointmentConfig';
import { formatDate } from '../../../../../utils/formatters';
import { useStatus } from '../../../../../contexts/StatusContext';

// Import editor components
import {
  EditAppointmentTitle,
  EditAppointmentDate,
  EditAppointmentTime,
  EditAppointmentLocation,
  EditAppointmentStatus,
} from '../../editors';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format appointment time for display
 */
const formatTime = (time) => {
  if (!time) return 'TBD';
  // If it's already a formatted string like "4:00 PM", return it
  if (time.includes('AM') || time.includes('PM')) return time;
  // If it's 24-hour format, convert to 12-hour
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

/**
 * Format duration in minutes
 */
const formatDuration = (minutes) => {
  if (!minutes) return '';
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

// ============================================================================
// CARD VIEW CONFIGURATION HOOK
// ============================================================================

/**
 * Hook to generate card config with database-driven status options
 * @param {Array} statuses - Status array from StatusContext
 * @returns {Object} Card configuration object
 */
const useAppointmentCardConfig = (statuses) => {
  return useMemo(() => {
    // Transform database statuses into dropdown options
    // Fallback to hardcoded options if database statuses not loaded yet
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

      // Title Configuration (appointment title/purpose, editable)
      title: {
        field: (appointment) => appointment.title || appointment.purpose || 'Untitled Appointment',
        editable: true,
        editor: EditAppointmentTitle,
        onSave: (appointment, newTitle) => {
          return { title: newTitle };
        },
      },

      // Subtitle Configuration (appointment type)
      subtitle: {
        formatter: (appointment) => {
          const type = appointment.appointment_type || appointment.type || 'showing';
          return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
        },
      },

      // Metrics Configuration (Date + Time in horizontal row)
      metrics: [
        // Date
        {
          label: 'Date',
          field: (appointment) => appointment.appointment_date || appointment.date,
          formatter: (value) => value ? formatDate(value, 'MMM d, yyyy') : 'TBD',
          color: {
            primary: '#3b82f6',
            secondary: '#2563eb',
            bg: alpha('#3b82f6', 0.08),
          },
          editable: true,
          editor: EditAppointmentDate,
          onSave: (appointment, newDate) => {
            return { appointment_date: newDate };
          },
        },

        // Time
        {
          label: 'Time',
          field: (appointment) => appointment.appointment_time || appointment.time,
          formatter: (value) => formatTime(value),
          color: {
            primary: '#10b981',
            secondary: '#059669',
            bg: alpha('#10b981', 0.08),
          },
          editable: true,
          editor: EditAppointmentTime,
          onSave: (appointment, newTime) => {
            return { appointment_time: newTime };
          },
        },
      ],

      // Footer Configuration (Duration + Location + Client)
      footer: {
        fields: [
          // Duration
          {
            label: 'Duration',
            field: 'duration',
            formatter: (value) => formatDuration(value) || '30 min',
          },

          // Location (editable)
          {
            label: 'Location',
            field: 'location',
            formatter: (value) => value || 'TBD',
            editable: true,
            editor: EditAppointmentLocation,
            onSave: (appointment, newLocation) => {
              return { location: newLocation };
            },
            truncate: true,
            maxWidth: 150,
          },

          // Client
          {
            label: 'Client',
            field: (appointment) => appointment.client_name || appointment.clientName,
            formatter: (value) => value || '—',
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
 * Now uses CardTemplate with inline configuration for better colocation.
 * Now uses database-driven status options from StatusContext.
 *
 * Reduced from 780+ lines to ~240 lines by using CardTemplate.
 *
 * Features:
 * - Inline editors: title, date, time, location, status
 * - Status menu: dynamically populated from database
 * - Today/Soon badges for upcoming appointments
 * - Relative time display
 * - Click vs drag: text selection support
 * - Quick actions: view, archive, restore, delete
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
