import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';

/**
 * Beautiful Currency Input Component
 * Live-formats currency as you type with styled commas and decimals
 *
 * Features:
 * - Editable formatted value with cursor positioning
 * - Commas auto-inserted, .00 shown in lighter gray
 * - Handles any amount from $15,000.00 to $1,150,000.00+
 * - Auto-formats with proper thousand separators
 * - Clean, minimal design matching calendar theme
 *
 * @param {string|number} value - Raw number value (e.g., "650000")
 * @param {function} onChange - Change handler (receives raw number string)
 * @param {function} onKeyDown - Keyboard event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {string} prefix - Currency prefix (default: $)
 */
export const CurrencyInput = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  placeholder = 'Enter amount',
  autoFocus = true,
  prefix = '$',
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

  // Format display value with commas
  const formatDisplay = (val) => {
    if (!val || val === '') return '';
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  // Handle input changes - allow inline editing with cursor positioning
  const handleChange = (e) => {
    const input = e.target;
    const rawValue = input.value;
    const cursorPos = input.selectionStart;

    // Remove all non-digits
    const digitsOnly = rawValue.replace(/\D/g, '');

    // Count how many commas were before cursor
    const textBeforeCursor = rawValue.substring(0, cursorPos);
    const commasBeforeCursor = (textBeforeCursor.match(/,/g) || []).length;

    // Format the new value
    const formatted = formatDisplay(digitsOnly);

    // Calculate new cursor position
    // Count commas in formatted text up to equivalent digit position
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
    // Ensure local value is synced when focusing
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Reset to prop value on blur
    if (value !== undefined && value !== null) {
      setLocalValue(value.toString());
    } else {
      setLocalValue('');
    }
  };

  const displayValue = formatDisplay(isFocused ? localValue : value);

  // Dynamic font sizing based on number of digits
  // Up to 6 digits (999,999): 1.8rem
  // 7+ digits (1,000,000+): Scale down proportionally
  const getAdaptiveFontSize = () => {
    const digitCount = (isFocused ? localValue : value)?.toString().length || 0;

    if (digitCount <= 6) {
      return '1.8rem'; // Full size for up to 999,999
    } else if (digitCount === 7) {
      return '1.6rem'; // 1,000,000 - 9,999,999
    } else if (digitCount === 8) {
      return '1.4rem'; // 10,000,000 - 99,999,999
    } else {
      return '1.2rem'; // 100,000,000+ (999,999,999 max)
    }
  };

  const adaptiveFontSize = getAdaptiveFontSize();

  return (
    <Box sx={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
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
          inputMode: 'numeric',
          style: {
            fontSize: adaptiveFontSize,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.5px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            padding: '14px 16px',
            transition: 'font-size 0.2s ease',
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
          endAdornment: displayValue ? (
            <Typography
              sx={{
                fontSize: adaptiveFontSize,
                fontWeight: 600,
                color: 'rgba(255,255,255,0.4)',
                ml: 0.25,
                letterSpacing: '-0.5px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                transition: 'font-size 0.2s ease',
              }}
            >
              .00
            </Typography>
          ) : null,
        }}
      />
    </Box>
  );
};
