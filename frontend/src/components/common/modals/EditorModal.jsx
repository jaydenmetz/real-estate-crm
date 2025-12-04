import React, { useState } from 'react';
import { Box, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ModalContainer } from './ModalContainer';

/**
 * EditorModal - Generic modal wrapper with X/checkmark action buttons
 * Used for editing existing database values from dashboards
 *
 * Usage:
 * <EditorModal open={open} onClose={onClose} onSave={handleSave} color="#10b981">
 *   <DateSetter value={date} onChange={setDate} />
 * </EditorModal>
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler () => void
 * @param {ReactNode} children - Setter component (Date, Currency, Address, etc.)
 * @param {string} color - Theme color for modal
 * @param {number} maxWidth - Optional max width for modal (default: 520)
 * @param {number|string} contentMaxWidth - Max width for inner content (default: 300, can be 'full' for no limit)
 */
export const EditorModal = ({
  open,
  onClose,
  onSave,
  children,
  color = '#10b981',
  maxWidth = 520,
  contentMaxWidth = 300, // Compact content centered in wider modal
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

  // Determine content max width (support 'full' for no limit)
  const innerMaxWidth = contentMaxWidth === 'full' ? '100%' : contentMaxWidth;

  return (
    <ModalContainer open={open} onClose={onClose} color={color} maxWidth={maxWidth}>
      <Box
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyPress}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
        }}
      >
        {/* Content wrapper - centered with configurable max width */}
        <Box sx={{ width: '100%', maxWidth: innerMaxWidth }}>
          {/* Render setter component */}
          {children}
        </Box>

        {/* Action Buttons - X and Checkmark - always full width for alignment */}
        <Box sx={{
          display: 'flex',
          gap: 2,
          mt: 3,
          justifyContent: 'flex-end',
          width: '100%',
          maxWidth: innerMaxWidth,
        }}>
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
    </ModalContainer>
  );
};
