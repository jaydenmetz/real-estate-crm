import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ModalContainer } from '../modals/ModalContainer';

/**
 * Generic Editor Wrapper
 * Wraps any setter component with X/checkmark action buttons and modal dialog
 *
 * Usage:
 * <Editor open={open} onClose={onClose} onSave={handleSave} color="#10b981">
 *   <DateSetter value={date} onChange={setDate} />
 * </Editor>
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler () => void
 * @param {ReactNode} children - Setter component (DateSetter, CurrencySetter, etc.)
 * @param {string} color - Theme color for modal
 * @param {number} maxWidth - Optional max width for modal (default: 520)
 */
export const Editor = ({
  open,
  onClose,
  onSave,
  children,
  color = '#10b981',
  maxWidth = 520,
}) => {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <ModalContainer open={open} onClose={onClose} color={color} maxWidth={maxWidth}>
      <Box
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyPress}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 500 }}>
          {/* Render setter component */}
          {children}

          {/* Action Buttons - X and Checkmark */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              disabled={saving}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <Close />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={saving}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'white',
                color: color,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              <Check />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </ModalContainer>
  );
};
