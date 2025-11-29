import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { EmailInput } from '../shared/EmailInput';
import { validateEmail, parseEmailForStorage } from '../../../../utils/validators';

/**
 * Generic Email Setter
 * Reusable component for editing any email address field
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives lowercase email
 * @param {string} label - Field label (e.g., "Email Address", "Work Email")
 * @param {string} value - Current email address
 * @param {string} color - Theme color
 */
export const SetEmail = ({
  open,
  onClose,
  onSave,
  label = 'Email Address',
  value,
  color = '#8b5cf6',
}) => {
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize editValue when dialog opens
  useEffect(() => {
    if (open) {
      setEditValue(value || '');
      setError(null);
    }
  }, [open, value]);

  const handleSave = async () => {
    // Validate
    const validation = validateEmail(editValue);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Save lowercase, trimmed email
      const valueToSave = parseEmailForStorage(editValue);
      await onSave(valueToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save email:', error);
      setError('Failed to save email address');
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

  const handleChange = (newValue) => {
    setEditValue(newValue);
    // Clear error when user starts typing
    if (error) setError(null);
  };

  return (
    <ModalDialog open={open} onClose={onClose} color={color}>
      <Box onClick={(e) => e.stopPropagation()}>
        {/* Label */}
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            mb: 1,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {label}
        </Typography>

        {/* Current Value Display */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: 'white',
            mb: 3,
            letterSpacing: '-0.5px',
            wordBreak: 'break-all',
          }}
        >
          {value || 'No email address'}
        </Typography>

        {/* Email Input */}
        <Box sx={{ mb: 3 }}>
          <EmailInput
            value={editValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            disabled={saving}
            autoFocus={true}
            error={error}
          />
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            disabled={saving}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'rgba(255,255,255,0.2)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.1)',
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
            disabled={saving || !editValue}
            sx={{
              width: 48,
              height: 48,
              backgroundColor: 'white',
              color: color,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.9)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.3)',
                color: 'rgba(255,255,255,0.5)',
              },
            }}
          >
            <Check />
          </IconButton>
        </Box>
      </Box>
    </ModalDialog>
  );
};
