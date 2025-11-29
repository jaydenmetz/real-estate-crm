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
 * @param {number} maxWidth - Maximum width in pixels (default: 400)
 * @param {boolean} hideBackdrop - If true, renders without backdrop (for nested modals)
 * @param {node} children - Modal content
 */
export const ModalDialog = ({ open, onClose, color = '#6366f1', maxWidth = 400, hideBackdrop = false, children }) => {
  const handleClose = (event, reason) => {
    // Stop propagation to prevent navigation when clicking backdrop or close button
    if (event) {
      event.stopPropagation();
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      TransitionComponent={Zoom}
      TransitionProps={{
        timeout: 300,
      }}
      onClick={(e) => e.stopPropagation()}
      hideBackdrop={hideBackdrop}
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: `linear-gradient(135deg, ${alpha(color, 0.95)} 0%, ${alpha(color, 0.85)} 100%)`,
          backdropFilter: 'blur(20px)',
          border: `2px solid ${alpha(color, 0.3)}`,
          boxShadow: `0 20px 60px ${alpha(color, 0.4)}`,
          minWidth: 400,
          maxWidth: maxWidth,
          width: '100%',
          p: 3,
        },
      }}
      slotProps={{
        backdrop: {
          onClick: (e) => e.stopPropagation(),
        },
      }}
    >
      {children}
    </Dialog>
  );
};
