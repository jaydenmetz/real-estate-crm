import React from 'react';
import { TextField, InputAdornment, Typography } from '@mui/material';

/**
 * Reusable Currency Input Component
 * Provides consistent styling for dollar amount inputs
 *
 * @param {string|number} value - Input value
 * @param {function} onChange - Change handler (receives string)
 * @param {function} onKeyDown - Keyboard event handler
 * @param {boolean} disabled - Disabled state
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 * @param {string} prefix - Currency prefix (default: $)
 * @param {string} endAdornment - Optional end adornment (e.g., "%" for percentages)
 */
export const CurrencyInput = ({
  value,
  onChange,
  onKeyDown,
  disabled = false,
  placeholder = 'Enter amount',
  autoFocus = true,
  prefix = '$',
  endAdornment = null,
}) => {
  return (
    <TextField
      fullWidth
      autoFocus={autoFocus}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      type="number"
      placeholder={placeholder}
      disabled={disabled}
      InputProps={{
        startAdornment: endAdornment ? null : (
          <InputAdornment position="start">
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>
              {prefix}
            </Typography>
          </InputAdornment>
        ),
        endAdornment: endAdornment ? (
          <InputAdornment position="end">
            <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '1.5rem' }}>
              {endAdornment}
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
  );
};
