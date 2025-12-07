import { alpha } from '@mui/material';

/**
 * Escrow status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Note: 'bg' is used for chip background, 'cardBg' for subtle card gradients
 *
 * Statuses use lowercase_snake_case keys (database-driven):
 * - active (green) - Default status for new escrows [category: active]
 * - closed (blue) - Successfully closed escrow [category: won]
 * - cancelled (red) - Escrow cancelled [category: lost]
 */
export const ESCROW_STATUS_CONFIG = {
  'active': {
    color: '#10b981',
    bg: '#10b981',
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'trending_up',
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
 * All valid escrow statuses (lowercase keys)
 */
export const ESCROW_STATUS = {
  ACTIVE: 'active',
  CLOSED: 'closed',
  CANCELLED: 'cancelled'
};

/**
 * Get status config with fallback to active
 * Case-insensitive lookup - normalizes to lowercase
 * @param {string} status - Escrow status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  if (!status) return ESCROW_STATUS_CONFIG.active;

  // Normalize status to lowercase for consistent lookup
  const normalized = status.toLowerCase();

  return ESCROW_STATUS_CONFIG[normalized] || ESCROW_STATUS_CONFIG.active;
};
