import React from 'react';
import { TextField } from '@mui/material';

/**
 * Reusable Date Input Component
 * Provides consistent styling for date picker inputs
 *
 * @param {string} value - Date value in YYYY-MM-DD format
 * @param {function} onChange - Change handler (receives string)
 * @param {function} onKeyDown - Keyboard event handler
 * @param {boolean} disabled - Disabled state
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const DateInput = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  autoFocus = true,
}) => {
  return (
    <TextField
      fullWidth
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      type="date"
      disabled={disabled}
      inputProps={{
        max: '2099-12-31',
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderRadius: 2,
          fontSize: '1.25rem',
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
          fontSize: '1.25rem',
          padding: '16px',
        },
        '& input[type="date"]::-webkit-calendar-picker-indicator': {
          filter: 'invert(1)',
          fontSize: '1.5rem',
          cursor: 'pointer',
        },
      }}
    />
  );
};
