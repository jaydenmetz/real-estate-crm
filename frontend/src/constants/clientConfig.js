import { alpha } from '@mui/material';

/**
 * Client status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Note: 'bg' is used for chip background, 'cardBg' for subtle card gradients
 */
export const CLIENT_STATUS_CONFIG = {
  'active': {
    color: '#10b981',
    bg: '#10b981', // Solid green for chip
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'person',
    label: 'Active'
  },
  'lead': {
    color: '#3b82f6',
    bg: '#3b82f6', // Solid blue for chip
    cardBg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'person_add',
    label: 'Lead'
  },
  'inactive': {
    color: '#9ca3af',
    bg: '#9ca3af', // Solid gray for chip
    cardBg: 'linear-gradient(135deg, rgba(156,163,175,0.08) 0%, rgba(107,114,128,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#9ca3af', 0.2)}`,
    icon: 'person_off',
    label: 'Inactive'
  },
  'past_client': {
    color: '#8b5cf6',
    bg: '#8b5cf6', // Solid purple for chip
    cardBg: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(124,58,237,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#8b5cf6', 0.2)}`,
    icon: 'history',
    label: 'Past Client'
  },
  'archived': {
    color: '#6b7280',
    bg: '#6b7280', // Solid dark gray for chip
    cardBg: 'linear-gradient(135deg, rgba(107,114,128,0.08) 0%, rgba(75,85,99,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6b7280', 0.2)}`,
    icon: 'archive',
    label: 'Archived'
  }
};

/**
 * Status color mapping for MUI chip variants
 * Maps status keys to MUI color names
 */
export const CLIENT_STATUS_COLORS = {
  'active': 'success',
  'lead': 'info',
  'inactive': 'default',
  'past_client': 'default',
  'archived': 'default'
};

/**
 * Status labels for display
 */
export const CLIENT_STATUS_LABELS = {
  'active': 'Active',
  'lead': 'Lead',
  'inactive': 'Inactive',
  'past_client': 'Past Client',
  'archived': 'Archived'
};

/**
 * All valid client statuses
 */
export const CLIENT_STATUS = {
  ACTIVE: 'active',
  LEAD: 'lead',
  INACTIVE: 'inactive',
  PAST_CLIENT: 'past_client',
  ARCHIVED: 'archived'
};

/**
 * Get status config with fallback to active
 * @param {string} status - Client status
 * @returns {object} Status configuration
 */
export const getClientStatusConfig = (status) => {
  if (!status) return CLIENT_STATUS_CONFIG.active;
  const normalized = status.toLowerCase();
  return CLIENT_STATUS_CONFIG[normalized] || CLIENT_STATUS_CONFIG.active;
};
