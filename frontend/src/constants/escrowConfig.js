import { alpha } from '@mui/material';

/**
 * Escrow status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 *
 * Note: 'bg' is used for chip background, 'cardBg' for subtle card gradients
 */
export const ESCROW_STATUS_CONFIG = {
  'Active': {
    color: '#10b981',
    bg: '#10b981', // Solid green for chip
    cardBg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'trending_up',
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
 * Get status config with fallback to Active
 * Case-insensitive lookup to handle both 'active' and 'Active'
 * @param {string} status - Escrow status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  if (!status) return ESCROW_STATUS_CONFIG.Active;

  // Normalize status to match config keys
  // Examples: 'active' → 'Active', 'cancelled' → 'Cancelled', 'pending acceptance' → 'Pending Acceptance'
  const normalized = status
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  return ESCROW_STATUS_CONFIG[normalized] || ESCROW_STATUS_CONFIG.Active;
};
