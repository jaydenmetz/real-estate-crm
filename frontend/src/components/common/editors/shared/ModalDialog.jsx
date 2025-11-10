import React from 'react';
import { Dialog, Zoom } from '@mui/material';
import { alpha } from '@mui/material/styles';

/**
 * Reusable Modal Dialog Wrapper
 * Provides consistent styling across all editor modals
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {string} color - Theme color for gradient background
 * @param {node} children - Modal content
 */
export const ModalDialog = ({ open, onClose, color = '#6366f1', children }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Zoom}
      TransitionProps={{
        timeout: 300,
      }}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(color, 0.95)} 0%, ${alpha(color, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(color, 0.3)}`,
          boxShadow: `0 20px 60px ${alpha(color, 0.4)}`,
          minWidth: 400,
          p: 3,
        },
      }}
    >
      {children}
    </Dialog>
  );
};
