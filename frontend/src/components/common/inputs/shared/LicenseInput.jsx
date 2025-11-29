import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Badge } from '@mui/icons-material';

/**
 * Formatted License Input Component
 * Validates and formats CalDRE license numbers (8 digits)
 *
 * @param {string} value - Current license number value
 * @param {function} onChange - Change handler (receives raw 8 digits)
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {function} onKeyDown - Keyboard event handler
 * @param {string} error - Error message to display
 */
export const LicenseInput = ({
  value,
  onChange,
  disabled = false,
  placeholder = '01234567',
  autoFocus = false,
  onKeyDown,
  error = null,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Initialize and sync with prop value
  useEffect(() => {
    // Strip non-numeric characters from incoming value
    const cleaned = (value || '').replace(/[^0-9]/g, '');
    setDisplayValue(cleaned);
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;

    // Strip all non-numeric characters
    const cleaned = input.replace(/[^0-9]/g, '');

    // Limit to 8 digits
    const limited = cleaned.slice(0, 8);

    setDisplayValue(limited);
    onChange(limited); // Send raw digits to parent
  };

  return (
    <TextField
      value={displayValue}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      error={Boolean(error)}
      helperText={error || 'Enter 8-digit license number'}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Badge sx={{ color: 'white', fontSize: 20 }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          minHeight: '60px',
          '& fieldset': {
            borderColor: error ? '#f44336' : 'rgba(255,255,255,0.3)',
            borderWidth: 2,
          },
          '&:hover fieldset': {
            borderColor: disabled ? 'rgba(255,255,255,0.1)' : error ? '#f44336' : 'rgba(255,255,255,0.5)',
          },
          '&.Mui-focused fieldset': {
            borderColor: error ? '#f44336' : 'white',
          },
          '&.Mui-disabled': {
            backgroundColor: 'rgba(255,255,255,0.05)',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.1)',
            },
          },
          '&.Mui-error fieldset': {
            borderColor: '#f44336',
          },
        },
        '& .MuiInputBase-input': {
          color: 'white',
          fontSize: '1.1rem',
          fontWeight: 600,
          padding: '12px 16px',
          letterSpacing: '0.5px',
          '&::placeholder': {
            color: 'rgba(255,255,255,0.5)',
            opacity: 1,
          },
        },
        '& .MuiFormHelperText-root': {
          color: error ? '#f44336' : 'rgba(255,255,255,0.7)',
          fontSize: '0.75rem',
          marginTop: '4px',
          marginLeft: '14px',
        },
      }}
    />
  );
};
