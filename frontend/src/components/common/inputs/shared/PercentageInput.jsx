import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';

/**
 * Beautiful Percentage Input Component
 * Live-formats percentage as you type with decimal support
 *
 * Features:
 * - Editable formatted value with cursor positioning
 * - Supports unlimited decimal precision (2.5%, 2.875%, 2.12345678901%)
 * - Normalizes trailing zeros (2.50% → 2.5%, 2.87500% → 2.875%)
 * - % shown on right in lighter color
 * - Clean, minimal design matching CurrencyInput theme
 *
 * @param {string|number} value - Raw number value (e.g., "2.5" for 2.5%)
 * @param {function} onChange - Change handler (receives raw number string)
 * @param {function} onKeyDown - Keyboard event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const PercentageInput = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  placeholder = '3',
  autoFocus = true,
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState('');
  const [cursorPosition, setCursorPosition] = useState(null);

  // Sync local value when prop value changes (including on mount)
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
        // Wait for value to be rendered first
        setTimeout(() => {
          input.focus();
          // Place cursor at end of formatted value
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

  // Format display value - keep as entered, no comma formatting
  const formatDisplay = (val) => {
    if (!val || val === '') return '';

    // Remove any non-numeric characters except decimal point
    const cleaned = val.replace(/[^\d.]/g, '');

    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }

    return cleaned;
  };

  // Normalize value for saving (remove trailing zeros after decimal)
  const normalizeValue = (val) => {
    if (!val || val === '') return '';
    const num = parseFloat(val);
    if (isNaN(num)) return '';
    return num.toString(); // This automatically removes trailing zeros
  };

  // Handle input changes - allow inline editing with cursor positioning
  const handleChange = (e) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart;

    // Remove all non-numeric characters except decimal point
    let cleaned = rawValue.replace(/[^\d.]/g, '');

    // Prevent multiple decimal points
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('');
    }

    // Limit to 100%
    const numValue = parseFloat(cleaned);
    if (!isNaN(numValue) && numValue > 100) {
      cleaned = '100';
    }

    // No limit on decimal places - allow unlimited precision
    // Users can enter 2.875% or even 2.12345678901% if needed

    // Calculate cursor position
    // For percentage, we don't add commas, so cursor tracking is simpler
    let newCursorPos = cursorPos;

    // Adjust for removed characters
    const removedChars = rawValue.length - cleaned.length;
    newCursorPos = Math.max(0, cursorPos - removedChars);

    setLocalValue(cleaned);
    setCursorPosition(newCursorPos);
    onChange(cleaned);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // Ensure local value is synced when focusing
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Normalize on blur (remove trailing zeros)
    if (localValue) {
      const normalized = normalizeValue(localValue);
      setLocalValue(normalized);
      onChange(normalized);
    }
  };

  const displayValue = formatDisplay(isFocused ? localValue : value);

  // Fixed font size - no scaling
  const adaptiveFontSize = '1.8rem';

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        ref={inputRef}
        fullWidth
        value={displayValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        inputProps={{
          inputMode: 'decimal',
          style: {
            fontSize: adaptiveFontSize,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.5px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '14px 8px 14px 16px',
            transition: 'font-size 0.2s ease',
            textAlign: 'right', // Right-justify the input text
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
          endAdornment: (
            <Typography
              sx={{
                fontSize: adaptiveFontSize,
                fontWeight: 900,
                color: 'white',
                ml: 0,
                letterSpacing: '-0.5px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'font-size 0.2s ease',
              }}
            >
              %
            </Typography>
          ),
        }}
      />
    </Box>
  );
};
