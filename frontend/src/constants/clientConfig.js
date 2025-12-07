import { alpha } from '@mui/material';

/**
 * Client status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Note: 'bg' is used for chip background, 'cardBg' for subtle card gradients
 *
 * Statuses use lowercase_snake_case keys (database-driven):
 * - active (green) - Default status for new clients [category: active]
 * - closed (blue) - Successfully completed/closed relationship [category: won]
 * - expired (gray) - Agreement expired [category: lost]
 * - cancelled (red) - Client cancelled [category: lost]
 */
export const CLIENT_STATUS_CONFIG = {
  'active': {
    color: '#10b981',
    bg: '#10b981',
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'person',
    label: 'Active',
    category: 'active'
  },
  'closed': {
    color: '#3b82f6',
    bg: '#3b82f6',
    cardBg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'check_circle',
    label: 'Closed',
    category: 'won'
  },
  'expired': {
    color: '#6b7280',
    bg: '#6b7280',
    cardBg: 'linear-gradient(135deg, rgba(107,114,128,0.08) 0%, rgba(75,85,99,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6b7280', 0.2)}`,
    icon: 'schedule',
    label: 'Expired',
    category: 'lost'
  },
  'cancelled': {
    color: '#ef4444',
    bg: '#ef4444',
    cardBg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'cancel',
    label: 'Cancelled',
    category: 'lost'
  }
};

/**
 * Status color mapping for MUI chip variants
 * Maps status keys to MUI color names
 */
export const CLIENT_STATUS_COLORS = {
  'active': 'success',
  'closed': 'info',
  'expired': 'default',
  'cancelled': 'error'
};

/**
 * Status labels for display
 */
export const CLIENT_STATUS_LABELS = {
  'active': 'Active',
  'closed': 'Closed',
  'expired': 'Expired',
  'cancelled': 'Cancelled'
};

/**
 * All valid client statuses (lowercase keys)
 */
export const CLIENT_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

/**
 * Get status config with fallback to active
 * Case-insensitive lookup - normalizes to lowercase
 * @param {string} status - Client status
 * @returns {object} Status configuration
 */
export const getClientStatusConfig = (status) => {
  if (!status) return CLIENT_STATUS_CONFIG.active;

  // Normalize status to lowercase for consistent lookup
  const normalized = status.toLowerCase();

  return CLIENT_STATUS_CONFIG[normalized] || CLIENT_STATUS_CONFIG.active;
};
