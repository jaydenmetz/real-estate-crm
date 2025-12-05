import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Check, Close, Percent, AttachMoney } from '@mui/icons-material';
import { ModalContainer as ModalDialog } from '../../../common/modals/ModalContainer';
import { CurrencyInput } from '../../../common/inputs/shared/CurrencyInput';
import { PercentageInput } from '../../../common/inputs/shared/PercentageInput';

/**
 * Commission Editor for Clients
 * Allows toggling between percentage and flat dollar amount
 * Matches the escrow EditCommission pattern
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (updates) => void - receives { commission, commission_percentage, commission_type }
 * @param {string} label - Field label (default: "Commission")
 * @param {number} value - Current commission dollar amount
 * @param {number} commissionPercentage - Current commission percentage
 * @param {string} commissionType - Initial commission type ('percentage' or 'flat')
 * @param {number} budget - Client budget for percentage calculation
 * @param {string} color - Theme color
 * @param {boolean} inline - If true, renders without ModalDialog wrapper
 */
export const EditClientCommission = ({
  open,
  onClose,
  onSave,
  label = 'Commission',
  value,
  commissionPercentage,
  commissionType: initialCommissionType = 'percentage',
  budget = 0,
  color = '#06b6d4',
  inline = false,
}) => {
  const [editValue, setEditValue] = useState('');
  const [commissionType, setCommissionType] = useState(initialCommissionType);
  const [saving, setSaving] = useState(false);

  // Initialize values when dialog opens
  useEffect(() => {
    if (open || inline) {
      // Set commission type from prop
      setCommissionType(initialCommissionType);

      // Load the appropriate value based on commission type
      if (initialCommissionType === 'percentage') {
        const percentValue = commissionPercentage !== null && commissionPercentage !== undefined
          ? commissionPercentage.toString()
          : '';
        setEditValue(percentValue);
      } else {
        setEditValue(value !== null && value !== undefined ? value.toString() : '');
      }
    }
  }, [open, inline, initialCommissionType, value, commissionPercentage]);

  const handleSave = async () => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      return;
    }

    const newValue = parseFloat(editValue);

    // Check if value actually changed
    const hasChanged = commissionType === 'percentage'
      ? newValue !== commissionPercentage
      : newValue !== value;

    const hasTypeChanged = commissionType !== initialCommissionType;

    // If nothing changed, just close
    if (!hasChanged && !hasTypeChanged) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const updates = {
        commission_type: commissionType,
      };

      if (commissionType === 'percentage') {
        updates.commission_percentage = newValue;
        updates.commission = budget ? (budget * newValue) / 100 : 0;
      } else {
        updates.commission = newValue;
        updates.commission_percentage = null;
      }

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Failed to save commission:', error);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save handler for inline mode
  const handleInlineChange = (newEditValue) => {
    setEditValue(newEditValue);

    if (inline && onSave && newEditValue && !isNaN(parseFloat(newEditValue))) {
      const newValue = parseFloat(newEditValue);
      const updates = {
        commission_type: commissionType,
      };

      if (commissionType === 'percentage') {
        updates.commission_percentage = newValue;
        updates.commission = budget ? (budget * newValue) / 100 : 0;
      } else {
        updates.commission = newValue;
        updates.commission_percentage = null;
      }

      onSave(updates);
    }
  };

  // Handle commission type toggle
  const handleCommissionTypeChange = (e, newType) => {
    e.stopPropagation();
    if (newType !== null) {
      setCommissionType(newType);

      let newEditValue = '';
      if (newType === 'percentage') {
        newEditValue = commissionPercentage !== null && commissionPercentage !== undefined
          ? commissionPercentage.toString()
          : '';
      } else {
        newEditValue = value !== null && value !== undefined ? value.toString() : '';
      }
      setEditValue(newEditValue);

      // In inline mode, auto-save the type change
      if (inline && onSave && newEditValue && !isNaN(parseFloat(newEditValue))) {
        const newValue = parseFloat(newEditValue);
        const updates = {
          commission_type: newType,
        };

        if (newType === 'percentage') {
          updates.commission_percentage = newValue;
          updates.commission = budget ? (budget * newValue) / 100 : 0;
        } else {
          updates.commission = newValue;
          updates.commission_percentage = null;
        }

        onSave(updates);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Calculate display value based on commission type
  const getDisplayValue = () => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      if (!value) return '$0.00';
      const num = parseFloat(value);
      if (isNaN(num)) return '$0.00';
      const formatted = `$${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      if (commissionType === 'flat' && budget && budget > 0) {
        const percentage = (num / budget) * 100;
        const formattedPercent = parseFloat(percentage.toFixed(2));
        return `${formatted} (${formattedPercent}%)`;
      }

      return formatted;
    }

    let displayAmount = 0;
    if (commissionType === 'percentage') {
      if (!budget || budget === 0) {
        return `${parseFloat(editValue)}% (set budget first)`;
      }
      displayAmount = (parseFloat(editValue) / 100) * budget;
    } else if (commissionType === 'flat') {
      displayAmount = parseFloat(editValue);
    }

    if (isNaN(displayAmount)) return '$0.00';
    const formatted = `$${displayAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    if (commissionType === 'flat' && budget && budget > 0) {
      const percentage = (displayAmount / budget) * 100;
      const formattedPercent = parseFloat(percentage.toFixed(2));
      return `${formatted} (${formattedPercent}%)`;
    }

    return formatted;
  };

  const content = (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 300 }}>
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
          {getDisplayValue()}
        </Typography>

        {/* Commission Type Toggle */}
        <Box sx={{ mb: 3 }}>
          <ToggleButtonGroup
            value={commissionType}
            exclusive
            onChange={handleCommissionTypeChange}
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
              Flat
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Edit Input */}
        {commissionType === 'percentage' ? (
          <PercentageInput
            value={editValue}
            onChange={handleInlineChange}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="3"
          />
        ) : (
          <CurrencyInput
            value={editValue}
            onChange={handleInlineChange}
            onKeyDown={handleKeyPress}
            disabled={saving}
            placeholder="2000"
          />
        )}

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
    </Box>
  );

  // Inline mode: Return content directly without modal wrapper
  if (inline) {
    return content;
  }

  // Standalone mode: Wrap in ModalDialog with wider modal, compact content
  return (
    <ModalDialog open={open} onClose={onClose} color={color} maxWidth={520}>
      {content}
    </ModalDialog>
  );
};
