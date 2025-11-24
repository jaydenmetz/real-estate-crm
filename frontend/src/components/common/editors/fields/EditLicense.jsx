import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { LicenseInput } from '../shared/LicenseInput';
import { validateLicense, formatLicenseDisplay, parseLicenseForStorage } from '../../../../utils/validators';

/**
 * Generic License Number Editor
 * Reusable component for editing CalDRE license numbers
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void - receives 8-digit number
 * @param {string} label - Field label (e.g., "License Number", "CalDRE License")
 * @param {string} value - Current license number (8 digits)
 * @param {string} color - Theme color
 * @param {string} state - License state (default: 'CA')
 */
export const EditLicense = ({
  open,
  onClose,
  onSave,
  label = 'CalDRE License Number',
  value,
  color = '#f59e0b',
  state = 'CA',
}) => {
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Initialize editValue when dialog opens
  useEffect(() => {
    if (open) {
      // Strip formatting from incoming value
      const cleaned = parseLicenseForStorage(value || '');
      setEditValue(cleaned);
      setError(null);
    }
  }, [open, value]);

  const handleSave = async () => {
    // Validate
    const validation = validateLicense(editValue);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      // Save 8 digits only
      const valueToSave = parseLicenseForStorage(editValue);
      await onSave(valueToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save license:', error);
      setError('Failed to save license number');
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
          {state} {label}
        </Typography>

        {/* Current Value Display */}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 900,
            color: 'white',
            mb: 3,
            letterSpacing: '1px',
          }}
        >
          {formatLicenseDisplay(value) || 'No license number'}
        </Typography>

        {/* License Input */}
        <Box sx={{ mb: 3 }}>
          <LicenseInput
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
            disabled={saving || !editValue || editValue.length !== 8}
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
