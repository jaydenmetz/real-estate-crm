import React, { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  TextField,
  IconButton,
  InputAdornment,
  Zoom,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
} from '@mui/material';
import { Check, Close, Percent, AttachMoney } from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

/**
 * Badge Editor Popup
 * Enlarges a badge into an editable popup when clicked
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newValue) => void
 * @param {string} label - Field label (e.g., "Price", "Commission")
 * @param {number} value - Current value
 * @param {string} color - Badge color theme
 * @param {string} prefix - Currency prefix (default "$")
 * @param {boolean} isCommission - Enable percentage/flat toggle for commission
 * @param {number} purchasePrice - Purchase price for commission calculation
 */
export const BadgeEditor = ({
  open,
  onClose,
  onSave,
  label,
  value,
  color = '#10b981',
  prefix = '$',
  isCommission = false,
  purchasePrice = 0,
}) => {
  const [editValue, setEditValue] = useState('');
  const [commissionType, setCommissionType] = useState('flat'); // 'percentage' or 'flat'
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
      let valueToSave = parseFloat(editValue);

      // If commission and percentage type, calculate the dollar amount
      if (isCommission && commissionType === 'percentage' && purchasePrice) {
        valueToSave = (purchasePrice * parseFloat(editValue)) / 100;
      }

      await onSave(valueToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  // Calculate commission amount if percentage type
  const getCalculatedCommission = () => {
    if (!isCommission || commissionType !== 'percentage' || !editValue || !purchasePrice) {
      return null;
    }
    const percentage = parseFloat(editValue);
    if (isNaN(percentage)) return null;
    return (purchasePrice * percentage) / 100;
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
    return `${prefix}${num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
        {isCommission && (
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
        )}

        {/* Edit Input */}
        <TextField
          fullWidth
          autoFocus
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          type="number"
          placeholder="Enter new value"
          disabled={saving}
          InputProps={{
            startAdornment: isCommission && commissionType === 'percentage' ? null : (
              <InputAdornment position="start">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>
                  {prefix}
                </Typography>
              </InputAdornment>
            ),
            endAdornment: isCommission && commissionType === 'percentage' ? (
              <InputAdornment position="end">
                <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>
                  %
                </Typography>
              </InputAdornment>
            ) : null,
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'white',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              fontWeight: 700,
              fontSize: '1.5rem',
            },
            '& input[type=number]': {
              MozAppearance: 'textfield',
            },
            '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
              WebkitAppearance: 'none',
              margin: 0,
            },
          }}
        />

        {/* Calculated Commission Display */}
        {isCommission && commissionType === 'percentage' && getCalculatedCommission() !== null && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Calculated Commission Amount
            </Typography>
            <Typography variant="h5" sx={{ color: 'white', fontWeight: 900, mt: 0.5 }}>
              ${getCalculatedCommission().toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          </Box>
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
    </Dialog>
  );
};
