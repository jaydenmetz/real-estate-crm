import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Phone as PhoneIcon } from '@mui/icons-material';
import { formatPhoneDisplay, validatePhone } from '../../../utils/validators';

/**
 * Phone Setter - Pure phone input component
 * Self-contained: Label + Current Value + Phone Input with auto-formatting
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Phone label="Phone Number" value={phone} onChange={setPhone} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Phone label="Phone Number" value={phone} onChange={setPhone} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Phone Number", "Mobile Phone")
 * @param {string} value - Current phone number (raw digits)
 * @param {function} onChange - Change handler (rawDigits) => void
 * @param {string} color - Theme color
 * @param {boolean} showCurrentValue - Show current value display (default: true)
 * @param {boolean} disabled - Disable input
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const Phone = ({
  label = 'Phone Number',
  value,
  onChange,
  color = '#10b981',
  showCurrentValue = true,
  disabled = false,
  placeholder = '(555) 123-4567',
  autoFocus = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [error, setError] = useState(null);

  // Initialize and sync with prop value
  useEffect(() => {
    setDisplayValue(formatPhoneDisplay(value || ''));
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;

    // Strip all non-numeric characters
    const cleaned = input.replace(/\D/g, '');

    // Limit to 11 digits (with country code)
    const limited = cleaned.slice(0, 11);

    // Format for display
    const formatted = formatPhoneDisplay(limited);

    setDisplayValue(formatted);
    onChange(limited); // Send raw digits to parent

    // Clear error when user starts typing
    if (error) setError(null);

    // Validate if input has content
    if (limited) {
      const validation = validatePhone(limited);
      if (!validation.valid) {
        setError(validation.error);
      }
    }
  };

  return (
    <Box>
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

      {/* Current Value Display - Only show if enabled */}
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
          {formatPhoneDisplay(value) || 'Not set'}
        </Typography>
      )}

      {/* Phone Input */}
      <TextField
        value={displayValue}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        autoFocus={autoFocus}
        error={Boolean(error)}
        helperText={error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon sx={{ color: 'white', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
        sx={{
          width: '100%',
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
    </Box>
  );
};
