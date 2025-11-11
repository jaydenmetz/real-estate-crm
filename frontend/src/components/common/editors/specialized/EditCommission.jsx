import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Check, Close, Percent, AttachMoney } from '@mui/icons-material';
import { ModalDialog } from '../shared/ModalDialog';
import { CurrencyInput } from '../shared/CurrencyInput';
import { PercentageInput } from '../shared/PercentageInput';

/**
 * Specialized Commission Editor
 * Allows toggling between percentage and flat dollar amount
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} label - Field label (default: "Commission")
 * @param {number} value - Current commission value (dollar amount)
 * @param {number} purchasePrice - Purchase price for percentage calculation
 * @param {string} color - Theme color
 */
export const EditCommission = ({
  open,
  onClose,
  onSave,
  label = 'Commission',
  value,
  purchasePrice = 0,
  color = '#10b981',
}) => {
  const [editValue, setEditValue] = useState('');
  const [commissionType, setCommissionType] = useState('flat'); // 'percentage' or 'flat'
  const [saving, setSaving] = useState(false);

  // Initialize editValue when dialog opens
  useEffect(() => {
    if (open) {
      // Only pre-populate if in flat mode
      if (commissionType === 'flat') {
        setEditValue(value?.toString() || '');
      } else {
        // Clear field when in percentage mode
        setEditValue('');
      }
    }
  }, [open, value, commissionType]);

  const handleSave = async () => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      return;
    }

    setSaving(true);
    try {
      let valueToSave = parseFloat(editValue);

      // If percentage type, calculate the dollar amount
      if (commissionType === 'percentage' && purchasePrice) {
        valueToSave = (purchasePrice * parseFloat(editValue)) / 100;
      }

      await onSave(valueToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save commission:', error);
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
    if (!val) return '$0.00';
    const num = parseFloat(val);
    if (isNaN(num)) return '$0.00';
    return `$${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <ModalDialog open={open} onClose={onClose} color={color}>
      <Box>
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

        {/* Commission Type Toggle */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={commissionType}
            exclusive
            onChange={(e, newType) => {
              if (newType !== null) {
                setCommissionType(newType);
                setEditValue(''); // Clear value when switching types
              }
            }}
            fullWidth
            sx={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              '& .MuiToggleButton-root': {
                color: 'rgba(255,255,255,0.7)',
                borderColor: 'rgba(255,255,255,0.3)',
                fontWeight: 600,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.35)',
                  },
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                },
              },
            }}
          >
            <ToggleButton value="percentage">
              <Percent sx={{ mr: 1, fontSize: 18 }} />
              Percentage
            </ToggleButton>
            <ToggleButton value="flat">
              <AttachMoney sx={{ mr: 1, fontSize: 18 }} />
              Flat Amount
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Edit Input */}
        {commissionType === 'percentage' ? (
          <PercentageInput
            value={editValue}
            onChange={setEditValue}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="Enter percentage"
          />
        ) : (
          <CurrencyInput
            value={editValue}
            onChange={setEditValue}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="Enter dollar amount"
          />
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <IconButton
            onClick={onClose}
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
            onClick={handleSave}
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
      </Box>
    </ModalDialog>
  );
};
