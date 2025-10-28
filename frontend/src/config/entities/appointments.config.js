/**
 * Appointments Entity Configuration
 *
 * Complete configuration for the appointments entity including:
 * - Dashboard layout and stats
 * - Detail page widgets and sections
 * - Forms and validation
 * - API endpoints
 * - Permissions
 */

import { createEntityConfig } from './base.config';
import { api } from '../../services/api.service';

export const appointmentsConfig = createEntityConfig({
  // ========================================
  // ENTITY METADATA
  // ========================================
  entity: {
    name: 'appointment',
    namePlural: 'appointments',
    label: 'Appointment',
    labelPlural: 'Appointments',
    icon: 'CalendarMonth',
    color: '#9c27b0',
    colorGradient: {
      start: '#9c27b0',
      end: '#ba68c8'
    }
  },

  // ========================================
  // API CONFIGURATION
  // ========================================
  api: {
    baseEndpoint: '/appointments',
    getAll: (params) => api.appointmentsAPI.getAll(params),
    getById: (id) => api.appointmentsAPI.getById(id),
    create: (data) => api.appointmentsAPI.create(data),
    update: (id, data) => api.appointmentsAPI.update(id, data),
    delete: (id) => api.appointmentsAPI.delete(id),
    endpoints: {
      list: '/appointments',
      get: '/appointments/:id',
      create: '/appointments',
      update: '/appointments/:id',
      delete: '/appointments/:id',
      stats: '/appointments/stats'
    },
    idField: 'id',
    queryParams: {
      status: 'status',
      scope: 'scope',
      sortBy: 'sortBy',
      sortOrder: 'sortOrder',
      page: 'page',
      limit: 'limit',
      startDate: 'startDate',
      endDate: 'endDate'
    }
  },

  // ========================================
  // DASHBOARD CONFIGURATION
  // ========================================
  dashboard: {
    // Hero Card Configuration
    hero: {
      dateRangeFilters: ['1D', '1M', '1Y', 'YTD', 'Custom'],
      defaultDateRange: '1M',
      showYearSelector: true,
      ctaButtons: [
        { label: 'New Appointment', action: 'create', icon: 'Add' },
        { label: 'Analytics', action: 'analytics', icon: 'Assessment' }
      ]
    },

    // Stats Configuration
    stats: [
      // Scheduled Tab Stats
      {
        id: 'total_scheduled',
        label: 'TOTAL APPOINTMENTS',
        calculation: (_data, helpers) => helpers.countByStatus('scheduled'),
        format: 'number',
        icon: 'CalendarMonth',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['scheduled']
      },
      {
        id: 'scheduled_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.status;
            const appointmentDate = new Date(item.appointment_date);
            return status?.toLowerCase() === 'scheduled' && appointmentDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['scheduled']
      },
      {
        id: 'upcoming_week',
        label: 'UPCOMING THIS WEEK',
        calculation: (data) => {
          const now = new Date();
          const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          return data.filter(item => {
            const status = item.status;
            const appointmentDate = new Date(item.appointment_date);
            return status?.toLowerCase() === 'scheduled' &&
                   appointmentDate >= now &&
                   appointmentDate <= weekEnd;
          }).length;
        },
        format: 'number',
        icon: 'EventAvailable',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['scheduled']
      },
      {
        id: 'today_appointments',
        label: 'TODAY\'S APPOINTMENTS',
        calculation: (data) => {
          const today = new Date().toDateString();
          return data.filter(item => {
            const status = item.status;
            const appointmentDate = new Date(item.appointment_date).toDateString();
            return status?.toLowerCase() === 'scheduled' && appointmentDate === today;
          }).length;
        },
        format: 'number',
        icon: 'Event',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['scheduled']
      },

      // Completed Tab Stats
      {
        id: 'total_completed',
        label: 'TOTAL APPOINTMENTS',
        calculation: (_data, helpers) => helpers.countByStatus('completed'),
        format: 'number',
        icon: 'CheckCircle',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['completed']
      },
      {
        id: 'completed_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.status;
            const appointmentDate = new Date(item.appointment_date);
            return status?.toLowerCase() === 'completed' && appointmentDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['completed']
      },
      {
        id: 'showings_count',
        label: 'SHOWINGS',
        calculation: (data) => {
          return data.filter(item => {
            const status = item.status;
            const type = item.appointment_type;
            return status?.toLowerCase() === 'completed' && type?.toLowerCase() === 'showing';
          }).length;
        },
        format: 'number',
        icon: 'Home',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['completed']
      },
      {
        id: 'meetings_count',
        label: 'MEETINGS',
        calculation: (data) => {
          return data.filter(item => {
            const status = item.status;
            const type = item.appointment_type;
            return status?.toLowerCase() === 'completed' && type?.toLowerCase() === 'meeting';
          }).length;
        },
        format: 'number',
        icon: 'People',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['completed']
      },

      // Cancelled Tab Stats
      {
        id: 'total_cancelled',
        label: 'TOTAL APPOINTMENTS',
        calculation: (_data, helpers) => helpers.countByStatus('cancelled'),
        format: 'number',
        icon: 'EventBusy',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },
      {
        id: 'cancelled_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const status = item.status;
            const updatedDate = new Date(item.updated_at || item.updatedAt);
            return status?.toLowerCase() === 'cancelled' && updatedDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Cancel',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },
      {
        id: 'cancellation_rate',
        label: 'CANCELLATION RATE',
        calculation: (data) => {
          const totalAppointments = data.length;
          const cancelledCount = data.filter(item =>
            item.status?.toLowerCase() === 'cancelled'
          ).length;
          return totalAppointments > 0 ? ((cancelledCount / totalAppointments) * 100).toFixed(1) : 0;
        },
        format: 'percent',
        icon: 'PercentIcon',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },
      {
        id: 'rescheduled_count',
        label: 'RESCHEDULED',
        calculation: (data) => {
          return data.filter(item => {
            const status = item.status;
            return status?.toLowerCase() === 'rescheduled';
          }).length;
        },
        format: 'number',
        icon: 'Update',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['cancelled']
      },

      // All Appointments Tab Stats
      {
        id: 'total_appointments',
        label: 'TOTAL APPOINTMENTS',
        calculation: (data) => data.length,
        format: 'number',
        icon: 'Dashboard',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'appointments_this_month',
        label: 'TOTAL THIS MONTH\'S',
        calculation: (data) => {
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return data.filter(item => {
            const appointmentDate = new Date(item.appointment_date);
            return appointmentDate >= monthStart;
          }).length;
        },
        format: 'number',
        icon: 'Schedule',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'completion_rate',
        label: 'COMPLETION RATE',
        calculation: (data) => {
          const completed = data.filter(item => item.status?.toLowerCase() === 'completed').length;
          const total = data.length;
          return total > 0 ? ((completed / total) * 100).toFixed(1) : 0;
        },
        format: 'percent',
        icon: 'CheckCircle',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      },
      {
        id: 'avg_per_week',
        label: 'AVG PER WEEK',
        calculation: (data) => {
          const now = new Date();
          const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
          const recentAppointments = data.filter(item => {
            const appointmentDate = new Date(item.appointment_date);
            return appointmentDate >= fourWeeksAgo;
          });
          return Math.round(recentAppointments.length / 4);
        },
        format: 'number',
        icon: 'TrendingUp',
        color: '#9c27b0',
        backgroundColor: null,
        textColor: '#fff',
        valueColor: null,
        visibleWhen: ['all']
      }
    ],

    // Status Tabs Configuration
    statusTabs: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' },
      { value: 'all', label: 'All Appointments' },
      { value: 'archived', label: 'Archived' }
    ],
    defaultStatus: 'scheduled',

    // Scope Filter Configuration
    getScopeOptions: (user) => {
      if (!user) {
        return [
          { value: 'my', label: 'My Appointments' },
          { value: 'team', label: 'Team Appointments' },
          { value: 'broker', label: 'Broker Appointments' }
        ];
      }

      const firstName = user.firstName || user.first_name || 'My';
      const lastName = user.lastName || user.last_name || '';
      const fullName = lastName ? `${firstName} ${lastName}` : (user.username || firstName);
      const teamName = user.teamName || user.team_name || 'Team';
      const brokerName = user.brokerName || user.broker_name || 'Broker';

      return [
        {
          value: 'my',
          label: `${firstName}'s Appointments`,
          fullLabel: fullName
        },
        {
          value: 'team',
          label: `${teamName}'s Appointments`,
          fullLabel: teamName
        },
        {
          value: 'broker',
          label: `${brokerName}'s Appointments`,
          fullLabel: brokerName
        }
      ];
    },
    defaultScope: 'my',

    // Sort Options Configuration
    sortOptions: [
      { value: 'appointment_date', label: 'Date' },
      { value: 'created_at', label: 'Created' },
      { value: 'updated_at', label: 'Updated' },
      { value: 'title', label: 'Title' },
      { value: 'appointment_type', label: 'Type' }
    ],
    defaultSort: 'appointment_date',

    // View Modes Configuration
    viewModes: [
      { value: 'grid', label: 'Grid', icon: 'GridView' },
      { value: 'list', label: 'List', icon: 'ViewList' },
      { value: 'calendar', label: 'Calendar', icon: 'CalendarMonth' }
    ],
    defaultViewMode: 'grid',

    // Archive Configuration
    showArchive: true,
    archiveLabel: 'Archive',

    // Card Configuration
    card: {
      component: 'AppointmentCard',
      props: {
        showStatus: true,
        showActions: true,
        showDate: true,
        showTime: true,
        showLocation: true,
        showClient: true
      }
    }
  },

  // ========================================
  // UTILS
  // ========================================
  utils: {
    sortBy: (data, field, order) => {
      return [...data].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Handle null/undefined values
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;

        // Date comparison
        if (field === 'appointment_date' || field === 'created_at' || field === 'updated_at') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        // String comparison
        if (typeof aVal === 'string') {
          return order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        // Number comparison
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      });
    },

    formatters: {
      date: (value) => {
        if (!value) return 'N/A';
        return new Date(value).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      },
      time: (value) => {
        if (!value) return 'N/A';
        return new Date(`1970-01-01T${value}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
      },
      status: (value) => {
        const statusMap = {
          'scheduled': 'Scheduled',
          'completed': 'Completed',
          'cancelled': 'Cancelled',
          'rescheduled': 'Rescheduled'
        };
        return statusMap[value?.toLowerCase()] || value;
      }
    }
  }
});

export default appointmentsConfig;
