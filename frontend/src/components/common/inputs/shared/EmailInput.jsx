import React, { useState, useEffect } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Email } from '@mui/icons-material';

/**
 * Validated Email Input Component
 * Validates email format in real-time
 *
 * @param {string} value - Current email value
 * @param {function} onChange - Change handler (receives email value)
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {function} onKeyDown - Keyboard event handler
 * @param {string} error - Error message to display
 */
export const EmailInput = ({
  value,
  onChange,
  disabled = false,
  placeholder = 'user@example.com',
  autoFocus = false,
  onKeyDown,
  error = null,
}) => {
  const [displayValue, setDisplayValue] = useState('');

  // Initialize and sync with prop value
  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);
    onChange(input);
  };

  return (
    <TextField
      type="email"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={onKeyDown}
      disabled={disabled}
      placeholder={placeholder}
      autoFocus={autoFocus}
      error={Boolean(error)}
      helperText={error}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Email sx={{ color: 'white', fontSize: 20 }} />
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
          '&::placeholder': {
            color: 'rgba(255,255,255,0.5)',
            opacity: 1,
          },
        },
        '& .MuiFormHelperText-root': {
          color: '#f44336',
          fontSize: '0.75rem',
          marginTop: '4px',
          marginLeft: '14px',
        },
      }}
    />
  );
};
