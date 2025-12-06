import { alpha } from '@mui/material';

/**
 * Client status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Note: 'bg' is used for chip background, 'cardBg' for subtle card gradients
 *
 * Statuses match database schema:
 * - Active (green) - Default status for new clients
 * - Closed (blue) - Successfully completed/closed relationship
 * - Expired (gray) - Agreement expired
 * - Cancelled (red) - Client cancelled
 */
export const CLIENT_STATUS_CONFIG = {
  'Active': {
    color: '#10b981',
    bg: '#10b981', // Solid green for chip
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'person',
    label: 'Active'
  },
  'Closed': {
    color: '#3b82f6',
    bg: '#3b82f6', // Solid blue for chip
    cardBg: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(37,99,235,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#3b82f6', 0.2)}`,
    icon: 'check_circle',
    label: 'Closed'
  },
  'Expired': {
    color: '#6b7280',
    bg: '#6b7280', // Solid gray for chip
    cardBg: 'linear-gradient(135deg, rgba(107,114,128,0.08) 0%, rgba(75,85,99,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6b7280', 0.2)}`,
    icon: 'schedule',
    label: 'Expired'
  },
  'Cancelled': {
    color: '#ef4444',
    bg: '#ef4444', // Solid red for chip
    cardBg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'cancel',
    label: 'Cancelled'
  }
};

/**
 * Status color mapping for MUI chip variants
 * Maps status keys to MUI color names
 */
export const CLIENT_STATUS_COLORS = {
  'Active': 'success',
  'Closed': 'info',
  'Expired': 'default',
  'Cancelled': 'error'
};

/**
 * Status labels for display
 */
export const CLIENT_STATUS_LABELS = {
  'Active': 'Active',
  'Closed': 'Closed',
  'Expired': 'Expired',
  'Cancelled': 'Cancelled'
};

/**
 * All valid client statuses
 */
export const CLIENT_STATUS = {
  ACTIVE: 'Active',
  CLOSED: 'Closed',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
};

/**
 * Get status config with fallback to Active
 * Case-insensitive lookup to handle various inputs
 * @param {string} status - Client status
 * @returns {object} Status configuration
 */
export const getClientStatusConfig = (status) => {
  if (!status) return CLIENT_STATUS_CONFIG.Active;

  // Normalize status to match config keys (capitalize first letter)
  const normalized = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return CLIENT_STATUS_CONFIG[normalized] || CLIENT_STATUS_CONFIG.Active;
};
