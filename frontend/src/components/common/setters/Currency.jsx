import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';

/**
 * Currency Setter - Pure currency input component
 * Self-contained: Label + Current Value + Live Currency Input
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Currency label="Purchase Price" value={price} onChange={setPrice} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Currency label="Purchase Price" value={price} onChange={setPrice} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Purchase Price", "Listed Price")
 * @param {number|string} value - Current value (raw number)
 * @param {function} onChange - Change handler (newValue) => void (receives raw number string)
 * @param {string} color - Theme color
 * @param {string} prefix - Currency prefix (default: $)
 * @param {boolean} showCurrentValue - Show current value display (default: true, hide in creation flows)
 * @param {boolean} disabled - Disable input
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {string|number} maxWidth - Maximum width of input field (default: '300px')
 */
export const Currency = ({
  label,
  value,
  onChange,
  color = '#10b981',
  prefix = '$',
  showCurrentValue = true,
  disabled = false,
  placeholder = '0',
  autoFocus = true,
  maxWidth = '300px',
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(null);

  // Sync local value when prop value changes
  useEffect(() => {
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    } else {
      setLocalValue('');
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      const input = inputRef.current.querySelector('input');
      if (input) {
        setTimeout(() => {
          input.focus();
          const endPos = input.value.length;
          input.setSelectionRange(endPos, endPos);
        }, 50);
      }
    }
  }, [autoFocus]);

  // Restore cursor position after formatting
  useEffect(() => {
    if (cursorPosition !== null && inputRef.current) {
      const input = inputRef.current.querySelector('input');
      if (input) {
        input.setSelectionRange(cursorPosition, cursorPosition);
        setCursorPosition(null);
      }
    }
  }, [localValue, cursorPosition]);

  // Format display value with commas
  const formatDisplay = (val) => {
    if (!val || val === '') return '';
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
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

  // Handle input changes - allow inline editing with cursor positioning
  const handleChange = (e) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart;

    // Remove all non-digits
    let digitsOnly = rawValue.replace(/\D/g, '');

    // Enforce max value of 999,999,999
    const maxValue = 999999999;
    if (digitsOnly && parseInt(digitsOnly) > maxValue) {
      digitsOnly = maxValue.toString();
    }

    // Count how many commas were before cursor
    const textBeforeCursor = rawValue.substring(0, cursorPos);
    const commasBeforeCursor = (textBeforeCursor.match(/,/g) || []).length;

    // Format the new value
    const formatted = formatDisplay(digitsOnly);

    // Calculate new cursor position
    const digitPositionInOriginal = textBeforeCursor.replace(/\D/g, '').length;
    let newCursorPos = 0;
    let digitCount = 0;

    for (let i = 0; i < formatted.length; i++) {
      if (formatted[i] >= '0' && formatted[i] <= '9') {
        digitCount++;
        if (digitCount === digitPositionInOriginal) {
          newCursorPos = i + 1;
          break;
        }
      }
    }

    setLocalValue(digitsOnly);
    setCursorPosition(newCursorPos);
    onChange(digitsOnly);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    } else {
      setLocalValue('');
    }
  };

  const displayValue = formatDisplay(isFocused ? localValue : value);
  const adaptiveFontSize = '1.8rem';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
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

      {/* Current Value Display - Only show if enabled (hide in creation flows) */}
      {showCurrentValue && (
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
      )}

      {/* Currency Input */}
      <Box sx={{ position: 'relative', width: '100%', maxWidth }}>
        <TextField
          ref={inputRef}
          fullWidth
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder}
          inputProps={{
            inputMode: 'numeric',
            style: {
              fontSize: adaptiveFontSize,
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.5px',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              padding: '14px 8px 14px 16px',
              transition: 'font-size 0.2s ease',
              textAlign: 'right',
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              minHeight: '60px',
              '& fieldset': {
                borderColor: 'rgba(255,255,255,0.3)',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: disabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.05)',
                '& fieldset': {
                  borderColor: 'rgba(255,255,255,0.1)',
                },
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255,255,255,0.4)',
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <Typography
                sx={{
                  fontSize: adaptiveFontSize,
                  fontWeight: 900,
                  color: 'white',
                  mr: 0.5,
                  letterSpacing: '-0.5px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'font-size 0.2s ease',
                }}
              >
                {prefix}
              </Typography>
            ),
            endAdornment: (
              <Typography
                sx={{
                  fontSize: adaptiveFontSize,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.4)',
                  ml: 0,
                  letterSpacing: '-0.5px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  transition: 'font-size 0.2s ease',
                }}
              >
                .00
              </Typography>
            ),
          }}
        />
      </Box>
    </Box>
  );
};
