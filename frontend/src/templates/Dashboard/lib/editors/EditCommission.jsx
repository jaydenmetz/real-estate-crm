import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { Check, Close, Percent, AttachMoney } from '@mui/icons-material';
import { ModalDialog } from '../../../../components/common/editors/shared/ModalDialog';
import { CurrencyInput } from '../../../../components/common/editors/shared/CurrencyInput';
import { PercentageInput } from '../../../../components/common/editors/shared/PercentageInput';

/**
 * Specialized Commission Editor
 * Allows toggling between percentage and flat dollar amount
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (updates) => void - receives { my_commission, commission_percentage, commission_type }
 * @param {string} label - Field label (default: "Commission")
 * @param {number} value - Current commission dollar amount (my_commission)
 * @param {number} commissionPercentage - Current commission percentage
 * @param {string} commissionType - Initial commission type ('percentage' or 'flat')
 * @param {number} purchasePrice - Purchase price for percentage calculation
 * @param {string} color - Theme color
 * @param {boolean} inline - If true, renders without ModalDialog wrapper
 */
export const EditCommission = ({
  open,
  onClose,
  onSave,
  label = 'Commission',
  value,
  commissionPercentage,
  commissionType: initialCommissionType = 'percentage',
  purchasePrice = 0,
  color = '#10b981',
  inline = false,
}) => {
  const [editValue, setEditValue] = useState('');
  const [commissionType, setCommissionType] = useState(initialCommissionType);
  const [saving, setSaving] = useState(false);

  // Initialize values when dialog opens
  useEffect(() => {
    if (open) {
      // Set commission type from prop
      setCommissionType(initialCommissionType);

      // Load the appropriate value based on commission type
      // IMPORTANT: Check for null/undefined explicitly, not falsy (0 is valid!)
      if (initialCommissionType === 'percentage') {
        // Database stores as percentage (e.g., 2.5 = 2.5%, 0.75 = 0.75%)
        // Display it directly without conversion
        const percentValue = commissionPercentage !== null && commissionPercentage !== undefined
          ? commissionPercentage.toString()
          : '';
        setEditValue(percentValue);
      } else {
        setEditValue(value !== null && value !== undefined ? value.toString() : '');
      }
    }
  }, [open, initialCommissionType, value, commissionPercentage, purchasePrice]);

  const handleSave = async () => {
    if (!editValue || isNaN(parseFloat(editValue))) {
      return;
    }

    const newValue = parseFloat(editValue);

    // Check if value actually changed - don't save if unchanged
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
        // Save percentage as-is (2.25 stays as 2.25, representing 2.25%)
        // Calculate dollar amount by dividing by 100 (2.25% of price)
        updates.commission_percentage = newValue;
        updates.my_commission = purchasePrice ? (purchasePrice * newValue) / 100 : 0;
      } else {
        // Save flat dollar amount and clear percentage
        updates.my_commission = newValue;
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

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  // Calculate display value based on commission type and current input
  const getDisplayValue = () => {
    // If no editValue, show the original value (or $0.00)
    if (!editValue || isNaN(parseFloat(editValue))) {
      if (!value) return '$0.00';
      const num = parseFloat(value);
      if (isNaN(num)) return '$0.00';
      const formatted = `$${num.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

      // For flat rate, show percentage helper
      if (commissionType === 'flat' && purchasePrice && purchasePrice > 0) {
        const percentage = (num / purchasePrice) * 100;
        // Remove trailing zeros: 3.00 → 3, 2.50 → 2.5, 2.83 → 2.83
        const formattedPercent = parseFloat(percentage.toFixed(2));
        return `${formatted} (${formattedPercent}%)`;
      }

      return formatted;
    }

    // Calculate based on commission type
    let displayAmount = 0;
    if (commissionType === 'percentage') {
      // If no purchase price, show percentage with note
      if (!purchasePrice || purchasePrice === 0) {
        return `${parseFloat(editValue)}% (set price first)`;
      }
      // Convert percentage to decimal (3 → 0.03) and multiply by purchase price
      displayAmount = (parseFloat(editValue) / 100) * purchasePrice;
    } else if (commissionType === 'flat') {
      // Direct dollar amount
      displayAmount = parseFloat(editValue);
    }

    if (isNaN(displayAmount)) return '$0.00';
    const formatted = `$${displayAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

    // For flat rate, show percentage helper
    if (commissionType === 'flat' && purchasePrice && purchasePrice > 0) {
      const percentage = (displayAmount / purchasePrice) * 100;
      // Remove trailing zeros: 3.00 → 3, 2.50 → 2.5, 2.83 → 2.83
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
      <Box sx={{ width: '100%', maxWidth: 500 }}>
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

      {/* Current Value Display - Shows calculated commission amount */}
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
          onChange={(e, newType) => {
            e.stopPropagation(); // Prevent navigation when switching tabs
            if (newType !== null) {
              setCommissionType(newType);
              // Load the database value for the new tab (or empty if none exists)
              if (newType === 'percentage') {
                // Database stores as percentage (e.g., 2.5 = 2.5%, 0.75 = 0.75%)
                // Display it directly without conversion
                const percentValue = commissionPercentage !== null && commissionPercentage !== undefined
                  ? commissionPercentage.toString()
                  : '';
                setEditValue(percentValue);
              } else {
                setEditValue(value !== null && value !== undefined ? value.toString() : '');
              }
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
          placeholder="3"
        />
      ) : (
        <CurrencyInput
          value={editValue}
          onChange={setEditValue}
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

  // Standalone mode: Wrap in ModalDialog
  return (
    <ModalDialog open={open} onClose={onClose} color={color}>
      {content}
    </ModalDialog>
  );
};
