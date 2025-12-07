import { alpha } from '@mui/material';

/**
 * Appointment Constants - Centralized Configuration
 * All appointment-related constants, statuses, and configurations in one place.
 * Follows the same pattern as escrowConfig.js, clientConfig.js, and listingConfig.js
 */

// ========================================
// STATUS CONSTANTS
// Uses lowercase_snake_case keys (database-driven)
// Categories: active (3), won (1), lost (2) = 6 total statuses
// ========================================

export const APPOINTMENT_STATUS = {
  // Active category (3 statuses)
  SCHEDULED: 'scheduled',
  CONFIRMED: 'confirmed',
  RESCHEDULED: 'rescheduled',
  // Won category (1 status)
  COMPLETED: 'completed',
  // Lost category (2 statuses)
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUS.SCHEDULED]: 'Scheduled',
  [APPOINTMENT_STATUS.CONFIRMED]: 'Confirmed',
  [APPOINTMENT_STATUS.RESCHEDULED]: 'Rescheduled',
  [APPOINTMENT_STATUS.COMPLETED]: 'Completed',
  [APPOINTMENT_STATUS.CANCELLED]: 'Cancelled',
  [APPOINTMENT_STATUS.NO_SHOW]: 'No-Show'
};

export const APPOINTMENT_STATUS_COLORS = {
  [APPOINTMENT_STATUS.SCHEDULED]: '#3b82f6',
  [APPOINTMENT_STATUS.CONFIRMED]: '#10b981',
  [APPOINTMENT_STATUS.RESCHEDULED]: '#8b5cf6',
  [APPOINTMENT_STATUS.COMPLETED]: '#6366f1',
  [APPOINTMENT_STATUS.CANCELLED]: '#ef4444',
  [APPOINTMENT_STATUS.NO_SHOW]: '#dc2626'
};

/**
 * Appointment status configurations with full styling
 * Created once and reused - prevents object creation on every render
 * 6 statuses across 3 categories: active (3), won (1), lost (2)
 */
export const APPOINTMENT_STATUS_CONFIG = {
  // Active category (3 statuses)
  'scheduled': {
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'schedule',
    label: 'Scheduled',
    category: 'active'
  },
  'confirmed': {
    color: '#10b981',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'check_circle',
    label: 'Confirmed',
    category: 'active'
  },
  'rescheduled': {
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#8b5cf6', 0.2)}`,
    icon: 'event_repeat',
    label: 'Rescheduled',
    category: 'active'
  },
  // Won category (1 status)
  'completed': {
    color: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6366f1', 0.2)}`,
    icon: 'task_alt',
    label: 'Completed',
    category: 'won'
  },
  // Lost category (2 statuses)
  'cancelled': {
    color: '#ef4444',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'cancel',
    label: 'Cancelled',
    category: 'lost'
  },
  'no_show': {
    color: '#dc2626',
    bg: 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(185,28,28,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#dc2626', 0.2)}`,
    icon: 'person_off',
    label: 'No-Show',
    category: 'lost'
  }
};

// ========================================
// APPOINTMENT TYPES (4 core types)
// ========================================

export const APPOINTMENT_TYPES = {
  LOAN_PRE_APPROVAL: 'loan_pre_approval',
  BUYER_CONSULTATION: 'buyer_consultation',
  LISTING_PRESENTATION: 'listing_presentation',
  SHOWING: 'showing',
};

export const APPOINTMENT_TYPE_LABELS = {
  [APPOINTMENT_TYPES.LOAN_PRE_APPROVAL]: 'Loan Pre-Approval',
  [APPOINTMENT_TYPES.BUYER_CONSULTATION]: 'Buyer Consultation',
  [APPOINTMENT_TYPES.LISTING_PRESENTATION]: 'Listing Presentation',
  [APPOINTMENT_TYPES.SHOWING]: 'Showing',
};

// ========================================
// MEETING MODES (In Person vs Virtual)
// ========================================

export const MEETING_MODES = {
  IN_PERSON: 'in_person',
  VIRTUAL: 'virtual',
};

export const MEETING_MODE_LABELS = {
  [MEETING_MODES.IN_PERSON]: 'In Person',
  [MEETING_MODES.VIRTUAL]: 'Virtual',
};

// Virtual meeting sub-types
export const VIRTUAL_MEETING_TYPES = {
  PHONE_CALL: 'phone_call',
  VIDEO_CALL: 'video_call',
  OTHER: 'other',
};

export const VIRTUAL_MEETING_TYPE_LABELS = {
  [VIRTUAL_MEETING_TYPES.PHONE_CALL]: 'Phone Call',
  [VIRTUAL_MEETING_TYPES.VIDEO_CALL]: 'Video Call',
  [VIRTUAL_MEETING_TYPES.OTHER]: 'Other',
};

// ========================================
// PRIORITY LEVELS
// ========================================

export const APPOINTMENT_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const APPOINTMENT_PRIORITY_LABELS = {
  [APPOINTMENT_PRIORITY.HIGH]: 'High Priority',
  [APPOINTMENT_PRIORITY.MEDIUM]: 'Medium Priority',
  [APPOINTMENT_PRIORITY.LOW]: 'Low Priority'
};

export const APPOINTMENT_PRIORITY_COLORS = {
  [APPOINTMENT_PRIORITY.HIGH]: '#ef4444',
  [APPOINTMENT_PRIORITY.MEDIUM]: '#f59e0b',
  [APPOINTMENT_PRIORITY.LOW]: '#10b981'
};

// ========================================
// DURATION & REMINDER OPTIONS
// ========================================

export const APPOINTMENT_DURATION_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
  { value: 180, label: '3 hours' },
  { value: 240, label: '4 hours' }
];

export const APPOINTMENT_REMINDER_OPTIONS = [
  { value: 0, label: 'No reminder' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 120, label: '2 hours before' },
  { value: 1440, label: '1 day before' },
  { value: 2880, label: '2 days before' }
];

// ========================================
// LOCATION TYPES
// ========================================

export const APPOINTMENT_LOCATION_TYPES = {
  PROPERTY: 'property',
  OFFICE: 'office',
  COFFEE_SHOP: 'coffee_shop',
  PHONE: 'phone',
  VIDEO: 'video',
  OTHER: 'other'
};

export const APPOINTMENT_LOCATION_TYPE_LABELS = {
  [APPOINTMENT_LOCATION_TYPES.PROPERTY]: 'Property Address',
  [APPOINTMENT_LOCATION_TYPES.OFFICE]: 'Office',
  [APPOINTMENT_LOCATION_TYPES.COFFEE_SHOP]: 'Coffee Shop',
  [APPOINTMENT_LOCATION_TYPES.PHONE]: 'Phone Call',
  [APPOINTMENT_LOCATION_TYPES.VIDEO]: 'Video Call',
  [APPOINTMENT_LOCATION_TYPES.OTHER]: 'Other Location'
};

// ========================================
// FILTERS & SORTING
// ========================================

export const APPOINTMENT_FILTERS = {
  STATUS: 'status',
  TYPE: 'appointmentType',
  PRIORITY: 'priority',
  DATE_RANGE: 'dateRange',
  AGENT: 'agentId',
  CLIENT: 'clientId',
  SEARCH: 'search'
};

export const APPOINTMENT_SORT_OPTIONS = [
  { value: 'appointment_date', label: 'Date & Time' },
  { value: 'created_at', label: 'Created Date' },
  { value: 'title', label: 'Title (A-Z)' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' }
];

export const APPOINTMENT_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table',
  CALENDAR: 'calendar'
};

// ========================================
// VALIDATION RULES
// ========================================

export const APPOINTMENT_VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 200
  },
  appointmentDate: {
    required: true,
    futureDate: false // Allow past dates for logging completed appointments
  },
  appointmentTime: {
    required: true
  },
  duration: {
    min: 15,
    max: 480 // 8 hours
  },
  location: {
    required: false,
    maxLength: 500
  },
  notes: {
    maxLength: 5000
  }
};

// ========================================
// DEFAULT VALUES
// ========================================

export const APPOINTMENT_DEFAULT_VALUES = {
  status: APPOINTMENT_STATUS.SCHEDULED,
  appointmentType: APPOINTMENT_TYPES.SHOWING,
  priority: APPOINTMENT_PRIORITY.MEDIUM,
  duration: 60, // 1 hour default
  reminder: 60, // 1 hour before default
  locationType: APPOINTMENT_LOCATION_TYPES.PROPERTY,
  notes: '',
  participants: []
};

// ========================================
// DATE RANGE PRESETS
// ========================================

export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  THIS_WEEK: 'thisWeek',
  NEXT_WEEK: 'nextWeek',
  THIS_MONTH: 'thisMonth',
  NEXT_MONTH: 'nextMonth',
  CUSTOM: 'custom'
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGE_PRESETS.TODAY]: 'Today',
  [DATE_RANGE_PRESETS.TOMORROW]: 'Tomorrow',
  [DATE_RANGE_PRESETS.THIS_WEEK]: 'This Week',
  [DATE_RANGE_PRESETS.NEXT_WEEK]: 'Next Week',
  [DATE_RANGE_PRESETS.THIS_MONTH]: 'This Month',
  [DATE_RANGE_PRESETS.NEXT_MONTH]: 'Next Month',
  [DATE_RANGE_PRESETS.CUSTOM]: 'Custom Range'
};

// ========================================
// GENERAL CONSTANTS
// ========================================

export const APPOINTMENT_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_VIEW_MODE: APPOINTMENT_VIEW_MODES.GRID,
  SEARCH_DEBOUNCE_MS: 300,
  CACHE_TTL_MS: 30000, // 30 seconds
  MAX_BULK_SELECTION: 100,
  EXPORT_FORMATS: ['csv', 'excel', 'pdf', 'ical'],
  MAX_NOTES_LENGTH: 5000,
  MAX_PARTICIPANTS: 20,
  MIN_APPOINTMENT_DURATION: 15, // minutes
  MAX_APPOINTMENT_DURATION: 480 // 8 hours
};

// ========================================
// TIME SLOTS & BUSINESS HOURS
// ========================================

export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00'
];

export const BUSINESS_HOURS = {
  start: '08:00',
  end: '20:00',
  timezone: 'America/Los_Angeles' // Default PST
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Get status config with fallback to scheduled
 * @param {string} status - Appointment status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  return APPOINTMENT_STATUS_CONFIG[status] || APPOINTMENT_STATUS_CONFIG.scheduled;
};

/**
 * Get appointment status config (alias for getStatusConfig)
 * @param {string} status - Appointment status
 * @returns {object} Status configuration
 */
export const getAppointmentStatusConfig = (status) => {
  return APPOINTMENT_STATUS_CONFIG[status] || APPOINTMENT_STATUS_CONFIG.scheduled;
};
