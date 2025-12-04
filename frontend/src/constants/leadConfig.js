/**
 * Lead Configuration
 * Centralized constants and configuration for the leads module
 *
 * This file consolidates all lead-related constants from the local dashboard
 * constants folder to align with the escrows dashboard architecture pattern.
 *
 * Primary color: Green (#10b981) - representing growth and nurturing
 */

import { alpha } from '@mui/material';

// ============================================================================
// STATUS DEFINITIONS
// ============================================================================

export const LEAD_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  QUALIFIED: 'qualified',
  NURTURING: 'nurturing',
  CONVERTED: 'converted',
  UNQUALIFIED: 'unqualified',
  DEAD: 'dead',
  ARCHIVED: 'archived'
};

export const LEAD_STATUS_LABELS = {
  [LEAD_STATUS.NEW]: 'New',
  [LEAD_STATUS.CONTACTED]: 'Contacted',
  [LEAD_STATUS.QUALIFIED]: 'Qualified',
  [LEAD_STATUS.NURTURING]: 'Nurturing',
  [LEAD_STATUS.CONVERTED]: 'Converted',
  [LEAD_STATUS.UNQUALIFIED]: 'Unqualified',
  [LEAD_STATUS.DEAD]: 'Dead',
  [LEAD_STATUS.ARCHIVED]: 'Archived'
};

export const LEAD_STATUS_COLORS = {
  [LEAD_STATUS.NEW]: '#3b82f6',       // Blue - fresh opportunity
  [LEAD_STATUS.CONTACTED]: '#8b5cf6', // Purple - engaged
  [LEAD_STATUS.QUALIFIED]: '#10b981', // Green - qualified
  [LEAD_STATUS.NURTURING]: '#f59e0b', // Amber - in progress
  [LEAD_STATUS.CONVERTED]: '#6366f1', // Indigo - success
  [LEAD_STATUS.UNQUALIFIED]: '#ef4444', // Red - not fit
  [LEAD_STATUS.DEAD]: '#6b7280',      // Gray - inactive
  [LEAD_STATUS.ARCHIVED]: '#9ca3af'   // Light gray - archived
};

/**
 * Enhanced status configuration with full styling (matches escrowConfig pattern)
 */
export const LEAD_STATUS_CONFIG = {
  'new': {
    color: '#3b82f6',
    bg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'fiber_new',
    label: 'New'
  },
  'contacted': {
    color: '#8b5cf6',
    bg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#8b5cf6', 0.2)}`,
    icon: 'phone',
    label: 'Contacted'
  },
  'qualified': {
    color: '#10b981',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'verified',
    label: 'Qualified'
  },
  'nurturing': {
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#f59e0b', 0.2)}`,
    icon: 'spa',
    label: 'Nurturing'
  },
  'converted': {
    color: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6366f1', 0.2)}`,
    icon: 'celebration',
    label: 'Converted'
  },
  'unqualified': {
    color: '#ef4444',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'block',
    label: 'Unqualified'
  },
  'dead': {
    color: '#6b7280',
    bg: 'linear-gradient(135deg, rgba(107,114,128,0.08) 0%, rgba(75,85,99,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6b7280', 0.2)}`,
    icon: 'do_not_disturb',
    label: 'Dead'
  },
  'archived': {
    color: '#9ca3af',
    bg: 'linear-gradient(135deg, rgba(156,163,175,0.08) 0%, rgba(107,114,128,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#9ca3af', 0.2)}`,
    icon: 'archive',
    label: 'Archived'
  }
};

// ============================================================================
// LEAD SOURCES
// ============================================================================

export const LEAD_SOURCES = {
  WEBSITE: 'website',
  REFERRAL: 'referral',
  SOCIAL_MEDIA: 'social_media',
  ZILLOW: 'zillow',
  REALTOR_COM: 'realtor_com',
  TRULIA: 'trulia',
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  GOOGLE_ADS: 'google_ads',
  OPEN_HOUSE: 'open_house',
  COLD_CALL: 'cold_call',
  EMAIL_CAMPAIGN: 'email_campaign',
  NETWORKING: 'networking',
  WALK_IN: 'walk_in',
  OTHER: 'other'
};

export const LEAD_SOURCE_LABELS = {
  [LEAD_SOURCES.WEBSITE]: 'Website',
  [LEAD_SOURCES.REFERRAL]: 'Referral',
  [LEAD_SOURCES.SOCIAL_MEDIA]: 'Social Media',
  [LEAD_SOURCES.ZILLOW]: 'Zillow',
  [LEAD_SOURCES.REALTOR_COM]: 'Realtor.com',
  [LEAD_SOURCES.TRULIA]: 'Trulia',
  [LEAD_SOURCES.FACEBOOK]: 'Facebook',
  [LEAD_SOURCES.INSTAGRAM]: 'Instagram',
  [LEAD_SOURCES.GOOGLE_ADS]: 'Google Ads',
  [LEAD_SOURCES.OPEN_HOUSE]: 'Open House',
  [LEAD_SOURCES.COLD_CALL]: 'Cold Call',
  [LEAD_SOURCES.EMAIL_CAMPAIGN]: 'Email Campaign',
  [LEAD_SOURCES.NETWORKING]: 'Networking',
  [LEAD_SOURCES.WALK_IN]: 'Walk-In',
  [LEAD_SOURCES.OTHER]: 'Other'
};

// ============================================================================
// LEAD TYPES
// ============================================================================

export const LEAD_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  BOTH: 'both',
  RENTER: 'renter',
  INVESTOR: 'investor'
};

export const LEAD_TYPE_LABELS = {
  [LEAD_TYPES.BUYER]: 'Buyer',
  [LEAD_TYPES.SELLER]: 'Seller',
  [LEAD_TYPES.BOTH]: 'Buyer & Seller',
  [LEAD_TYPES.RENTER]: 'Renter',
  [LEAD_TYPES.INVESTOR]: 'Investor'
};

// ============================================================================
// PRIORITY LEVELS
// ============================================================================

export const LEAD_PRIORITY = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold'
};

export const LEAD_PRIORITY_LABELS = {
  [LEAD_PRIORITY.HOT]: 'Hot Lead',
  [LEAD_PRIORITY.WARM]: 'Warm Lead',
  [LEAD_PRIORITY.COLD]: 'Cold Lead'
};

export const LEAD_PRIORITY_COLORS = {
  [LEAD_PRIORITY.HOT]: '#ef4444',
  [LEAD_PRIORITY.WARM]: '#f59e0b',
  [LEAD_PRIORITY.COLD]: '#3b82f6'
};

// ============================================================================
// QUALIFICATION STAGES
// ============================================================================

export const LEAD_QUALIFICATION_STAGES = {
  INITIAL_CONTACT: 'initial_contact',
  NEEDS_ASSESSMENT: 'needs_assessment',
  BUDGET_VERIFIED: 'budget_verified',
  PRE_APPROVED: 'pre_approved',
  READY_TO_BUY: 'ready_to_buy',
  NOT_QUALIFIED: 'not_qualified'
};

export const LEAD_QUALIFICATION_LABELS = {
  [LEAD_QUALIFICATION_STAGES.INITIAL_CONTACT]: 'Initial Contact',
  [LEAD_QUALIFICATION_STAGES.NEEDS_ASSESSMENT]: 'Needs Assessment',
  [LEAD_QUALIFICATION_STAGES.BUDGET_VERIFIED]: 'Budget Verified',
  [LEAD_QUALIFICATION_STAGES.PRE_APPROVED]: 'Pre-Approved',
  [LEAD_QUALIFICATION_STAGES.READY_TO_BUY]: 'Ready to Buy',
  [LEAD_QUALIFICATION_STAGES.NOT_QUALIFIED]: 'Not Qualified'
};

// ============================================================================
// FILTERS & SORTING
// ============================================================================

export const LEAD_FILTERS = {
  STATUS: 'status',
  SOURCE: 'source',
  TYPE: 'leadType',
  PRIORITY: 'priority',
  QUALIFICATION: 'qualificationStage',
  DATE_RANGE: 'dateRange',
  AGENT: 'agentId',
  SEARCH: 'search'
};

export const LEAD_SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'last_contact', label: 'Last Contact' },
  { value: 'name', label: 'Name (A-Z)' },
  { value: 'priority', label: 'Priority' },
  { value: 'score', label: 'Lead Score' }
];

export const LEAD_VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
  TABLE: 'table'
};

// ============================================================================
// DATE RANGE PRESETS
// ============================================================================

export const DATE_RANGE_PRESETS = {
  TODAY: 'today',
  THIS_WEEK: 'thisWeek',
  THIS_MONTH: 'thisMonth',
  LAST_30_DAYS: 'last30Days',
  LAST_90_DAYS: 'last90Days',
  THIS_YEAR: 'thisYear',
  CUSTOM: 'custom'
};

export const DATE_RANGE_LABELS = {
  [DATE_RANGE_PRESETS.TODAY]: 'Today',
  [DATE_RANGE_PRESETS.THIS_WEEK]: 'This Week',
  [DATE_RANGE_PRESETS.THIS_MONTH]: 'This Month',
  [DATE_RANGE_PRESETS.LAST_30_DAYS]: 'Last 30 Days',
  [DATE_RANGE_PRESETS.LAST_90_DAYS]: 'Last 90 Days',
  [DATE_RANGE_PRESETS.THIS_YEAR]: 'This Year',
  [DATE_RANGE_PRESETS.CUSTOM]: 'Custom Range'
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const LEAD_VALIDATION_RULES = {
  firstName: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  lastName: {
    required: true,
    minLength: 1,
    maxLength: 100
  },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255
  },
  phone: {
    required: false,
    pattern: /^\+?[1-9]\d{1,14}$/,
    maxLength: 20
  },
  source: {
    required: true
  },
  notes: {
    maxLength: 5000
  }
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const LEAD_DEFAULT_VALUES = {
  status: LEAD_STATUS.NEW,
  leadType: LEAD_TYPES.BUYER,
  priority: LEAD_PRIORITY.WARM,
  source: LEAD_SOURCES.OTHER,
  qualificationStage: LEAD_QUALIFICATION_STAGES.INITIAL_CONTACT,
  score: 0,
  notes: '',
  tags: []
};

// ============================================================================
// LEAD SCORING
// ============================================================================

export const LEAD_SCORE_RANGES = [
  { min: 0, max: 20, label: 'Very Low', color: '#6b7280' },
  { min: 21, max: 40, label: 'Low', color: '#3b82f6' },
  { min: 41, max: 60, label: 'Medium', color: '#f59e0b' },
  { min: 61, max: 80, label: 'High', color: '#10b981' },
  { min: 81, max: 100, label: 'Very High', color: '#ef4444' }
];

export const LEAD_ENGAGEMENT_ACTIONS = [
  { value: 'email_open', label: 'Email Opened', points: 5 },
  { value: 'email_click', label: 'Email Link Clicked', points: 10 },
  { value: 'website_visit', label: 'Website Visit', points: 5 },
  { value: 'property_view', label: 'Property Viewed', points: 15 },
  { value: 'form_submit', label: 'Form Submitted', points: 20 },
  { value: 'phone_call', label: 'Phone Call', points: 25 },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', points: 30 },
  { value: 'meeting_attended', label: 'Meeting Attended', points: 35 }
];

// ============================================================================
// NURTURE CAMPAIGNS
// ============================================================================

export const LEAD_NURTURE_CAMPAIGNS = {
  FIRST_TIME_BUYER: 'first_time_buyer',
  LUXURY_BUYER: 'luxury_buyer',
  INVESTOR: 'investor',
  SELLER_GUIDE: 'seller_guide',
  MARKET_UPDATE: 'market_update'
};

export const LEAD_NURTURE_CAMPAIGN_LABELS = {
  [LEAD_NURTURE_CAMPAIGNS.FIRST_TIME_BUYER]: 'First-Time Buyer Guide',
  [LEAD_NURTURE_CAMPAIGNS.LUXURY_BUYER]: 'Luxury Home Buyer',
  [LEAD_NURTURE_CAMPAIGNS.INVESTOR]: 'Investment Property Guide',
  [LEAD_NURTURE_CAMPAIGNS.SELLER_GUIDE]: 'Home Seller Guide',
  [LEAD_NURTURE_CAMPAIGNS.MARKET_UPDATE]: 'Market Updates'
};

// ============================================================================
// CONSTANTS
// ============================================================================

export const LEAD_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_VIEW_MODE: LEAD_VIEW_MODES.GRID,
  SEARCH_DEBOUNCE_MS: 300,
  CACHE_TTL_MS: 30000, // 30 seconds
  MAX_BULK_SELECTION: 100,
  EXPORT_FORMATS: ['csv', 'excel', 'pdf'],
  MAX_NOTES_LENGTH: 5000,
  MAX_TAGS: 20,
  MIN_LEAD_SCORE: 0,
  MAX_LEAD_SCORE: 100,
  AUTO_QUALIFY_SCORE: 60 // Leads with score >= 60 auto-qualify
};

export const CONTACT_FREQUENCY_TARGETS = {
  [LEAD_PRIORITY.HOT]: 1, // Contact daily
  [LEAD_PRIORITY.WARM]: 3, // Contact every 3 days
  [LEAD_PRIORITY.COLD]: 7  // Contact weekly
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get status configuration by status key
 * @param {string} status - Status key (e.g., 'new', 'contacted')
 * @returns {Object} Status configuration with color, bg, icon, label
 */
export const getStatusConfig = (status) => {
  return LEAD_STATUS_CONFIG[status?.toLowerCase()] || LEAD_STATUS_CONFIG.new;
};

/**
 * Get lead status configuration (alias for getStatusConfig)
 * @param {string} status - Status key
 * @returns {Object} Status configuration
 */
export const getLeadStatusConfig = getStatusConfig;

/**
 * Get score range info by score value
 * @param {number} score - Lead score (0-100)
 * @returns {Object} Score range with label and color
 */
export const getScoreRange = (score) => {
  return LEAD_SCORE_RANGES.find(range => score >= range.min && score <= range.max) || LEAD_SCORE_RANGES[0];
};

/**
 * Get priority color by priority key
 * @param {string} priority - Priority key (hot, warm, cold)
 * @returns {string} Color hex code
 */
export const getPriorityColor = (priority) => {
  return LEAD_PRIORITY_COLORS[priority?.toLowerCase()] || LEAD_PRIORITY_COLORS.warm;
};
