import { alpha } from '@mui/material';

/**
 * Escrow status configurations
 * Created once and reused - prevents object creation on every render
 * Reduces garbage collection pressure and improves performance
 */
export const ESCROW_STATUS_CONFIG = {
  'Active': {
    color: '#10b981',
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#10b981', 0.2)}`,
    icon: 'trending_up',
    label: 'Active'
  },
  'Pending Acceptance': {
    color: '#f59e0b',
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(217,119,6,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#f59e0b', 0.2)}`,
    icon: 'schedule',
    label: 'Pending'
  },
  'Closed': {
    color: '#6366f1',
    bg: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#6366f1', 0.2)}`,
    icon: 'check_circle',
    label: 'Closed'
  },
  'Cancelled': {
    color: '#ef4444',
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(220,38,38,0.12) 100%)',
    getBorder: (theme) => `2px solid ${alpha('#ef4444', 0.2)}`,
    icon: 'cancel',
    label: 'Cancelled'
  }
};

/**
 * Get status config with fallback to Active
 * @param {string} status - Escrow status
 * @returns {object} Status configuration
 */
export const getStatusConfig = (status) => {
  return ESCROW_STATUS_CONFIG[status] || ESCROW_STATUS_CONFIG.Active;
};
