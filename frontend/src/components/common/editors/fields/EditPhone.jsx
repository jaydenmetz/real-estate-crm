import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { PhoneInput } from '../shared/PhoneInput';
import { validatePhone, formatPhoneDisplay, parsePhoneForStorage } from '../../../../utils/validators';

/**
 * Generic Phone Number Editor
 * Reusable component for editing any phone number field
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives raw digits
 * @param {string} label - Field label (e.g., "Phone Number", "Cell Phone")
 * @param {string} value - Current phone number (raw digits or formatted)
 * @param {string} color - Theme color
 */
export const EditPhone = ({
  open,
  onClose,
  onSave,
  label = 'Phone Number',
  value,
  color = '#6366f1',
}) => {
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize editValue when dialog opens
  useEffect(() => {
    if (open) {
      // Strip formatting from incoming value
      const cleaned = parsePhoneForStorage(value || '');
      setEditValue(cleaned);
      setError(null);
    }
  }, [open, value]);

  const handleSave = async () => {
    // Validate
    const validation = validatePhone(editValue);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Save raw digits only
      const valueToSave = parsePhoneForStorage(editValue);
      await onSave(valueToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save phone:', error);
      setError('Failed to save phone number');
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

  const handleChange = (rawValue) => {
    setEditValue(rawValue);
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
          }}
        >
          {formatPhoneDisplay(value) || 'No phone number'}
        </Typography>

        {/* Phone Input */}
        <Box sx={{ mb: 3 }}>
          <PhoneInput
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
