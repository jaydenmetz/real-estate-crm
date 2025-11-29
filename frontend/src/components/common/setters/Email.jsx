import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, InputAdornment } from '@mui/material';
import { Email as EmailIcon } from '@mui/icons-material';
import { validateEmail } from '../../../utils/validators';

/**
 * Email Setter - Pure email input component
 * Self-contained: Label + Current Value + Email Input with validation
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Email label="Email Address" value={email} onChange={setEmail} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Email label="Email Address" value={email} onChange={setEmail} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Email Address", "Work Email")
 * @param {string} value - Current email address
 * @param {function} onChange - Change handler (newEmail) => void
 * @param {string} color - Theme color
 * @param {boolean} showCurrentValue - Show current value display (default: true)
 * @param {boolean} disabled - Disable input
 * @param {string} placeholder - Placeholder text
 * @param {boolean} autoFocus - Auto focus on mount
 */
export const Email = ({
  label = 'Email Address',
  value,
  onChange,
  color = '#8b5cf6',
  showCurrentValue = true,
  disabled = false,
  placeholder = 'user@example.com',
  autoFocus = false,
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const [error, setError] = useState(null);

  // Initialize and sync with prop value
  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const input = e.target.value;
    setDisplayValue(input);
    onChange(input);

    // Clear error when user starts typing
    if (error) setError(null);

    // Validate if input has content
    if (input) {
      const validation = validateEmail(input);
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
            wordBreak: 'break-all',
          }}
        >
          {value || 'Not set'}
        </Typography>
      )}

      {/* Email Input */}
      <TextField
        type="email"
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
              <EmailIcon sx={{ color: 'white', fontSize: 20 }} />
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
