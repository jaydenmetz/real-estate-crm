import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';

/**
 * Beautiful Currency Input Component
 * Live-formats currency as you type with styled commas and decimals
 *
 * Features:
 * - Commas and .00 appear in lighter gray as you type
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

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Format display value with commas
  const formatDisplay = (val) => {
    if (!val || val === '') return '';
    const num = parseFloat(val.replace(/,/g, ''));
    if (isNaN(num)) return '';
    return num.toLocaleString('en-US');
  };

  // Handle input changes - only allow numbers
  const handleChange = (e) => {
    const raw = e.target.value;
    // Remove all non-digits
    const digitsOnly = raw.replace(/\D/g, '');
    onChange(digitsOnly);
  };

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const displayValue = formatDisplay(value);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Hidden input for actual data entry */}
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={value || ''}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          cursor: 'text',
          zIndex: 1,
        }}
      />

      {/* Styled display */}
      <Box
        sx={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          border: '2px solid',
          borderColor: isFocused
            ? 'white'
            : disabled
            ? 'rgba(255,255,255,0.1)'
            : 'rgba(255,255,255,0.3)',
          padding: '14px 16px',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          cursor: disabled ? 'not-allowed' : 'text',
          transition: 'all 0.2s',
          '&:hover': disabled
            ? {}
            : {
                borderColor: isFocused ? 'white' : 'rgba(255,255,255,0.5)',
              },
        }}
        onClick={() => inputRef.current?.focus()}
      >
        <Typography
          sx={{
            fontSize: '1.8rem',
            fontWeight: 900,
            color: 'white',
            letterSpacing: '-0.5px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          {/* Dollar sign */}
          <Box component="span" sx={{ color: 'white', mr: 0.5 }}>
            {prefix}
          </Box>

          {/* Main number with commas */}
          {displayValue || (
            <Box
              component="span"
              sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontSize: '1.4rem' }}
            >
              {placeholder.replace(prefix, '').trim()}
            </Box>
          )}

          {/* Commas are already in displayValue in white */}

          {/* Decimal separator and cents in lighter gray */}
          {displayValue && (
            <Box component="span" sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
              .00
            </Box>
          )}
        </Typography>
      </Box>
    </Box>
  );
};
