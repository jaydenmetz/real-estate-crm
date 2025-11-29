import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Check, Close } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { CurrencyInput } from '../shared/CurrencyInput';

/**
 * Generic Currency Setter
 * Reusable component for editing any currency value
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} label - Field label (e.g., "Purchase Price", "Listed Price")
 * @param {number} value - Current value
 * @param {string} color - Theme color
 * @param {string} prefix - Currency prefix (default: $)
 * @param {boolean} inline - If true, returns content without ModalDialog wrapper
 */
export const SetCurrency = ({
  open,
  onClose,
  onSave,
  label,
  value,
  color = '#10b981',
  prefix = '$',
  inline = false,
}) => {
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize editValue when dialog opens
  useEffect(() => {
    if (open) {
      setEditValue(value?.toString() || '');
    }
  }, [open, value]);

  const handleSave = async () => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      return;
    }

    setSaving(true);
    try {
      const valueToSave = parseFloat(editValue);
      await onSave(valueToSave);
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

  const formatDisplayValue = (val) => {
    if (!val) return `${prefix}0.00`;
    const num = parseFloat(val);
    if (isNaN(num)) return `${prefix}0.00`;
    return `${prefix}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const content = (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        width: '100%',
      }}
    >
      {/* Horizontal centering: Spacer - Component - Spacer */}
      <Box sx={{ flex: 1 }} /> {/* Left spacer */}
      <Box sx={{ flex: 0, minWidth: 0 }}>
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
          letterSpacing: '-1px',
        }}
      >
        {formatDisplayValue(value)}
      </Typography>

      {/* Edit Input */}
      <CurrencyInput
        value={editValue}
        onChange={setEditValue}
        onKeyDown={handleKeyPress}
        disabled={saving}
        prefix={prefix}
        placeholder="Enter new value"
      />

      {/* Action Buttons - Only show in standalone mode */}
      {!inline && (
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
            disabled={saving || !editValue || isNaN(parseFloat(editValue))}
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
      )}
      </Box>
      <Box sx={{ flex: 1 }} /> {/* Right spacer */}
    </Box>
  );

  // Inline mode: Return content directly without modal wrapper
  if (inline) {
    return content;
  }

  // Standalone mode: Wrap in ModalDialog
  return (
    <ModalDialog open={open} onClose={onClose} color={color}>
      {content}
    </ModalDialog>
  );
};
