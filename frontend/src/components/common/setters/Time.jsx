import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField } from '@mui/material';
import { AccessTime } from '@mui/icons-material';

/**
 * Time Setter - Pure time input component
 * Self-contained: Label + Current Value + Time Input
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Time label="Time" value={time} onChange={setTime} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Time label="Time" value={time} onChange={setTime} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Start Time", "End Time")
 * @param {string} value - Current value in HH:mm format
 * @param {function} onChange - Change handler (newValue) => void
 * @param {string} color - Theme color
 * @param {boolean} showCurrentValue - Show current value display (default: true, hide in creation flows)
 * @param {boolean} disabled - Disable input
 * @param {string|number} maxWidth - Maximum width of input field (default: '300px')
 */
export const Time = ({
  label,
  value,
  onChange,
  color = '#10b981',
  showCurrentValue = true,
  disabled = false,
  maxWidth = '300px',
}) => {
  const [localValue, setLocalValue] = useState(value || '');

  // Sync local value when prop value changes
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Format time for display (convert 24h to 12h)
  const formatTimeDisplay = (time) => {
    if (!time) return 'Not set';
    // If it's already formatted (has AM/PM), return as-is
    if (time.includes('AM') || time.includes('PM')) return time;

    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Input Container - centered with max width */}
      <Box sx={{ width: '100%', maxWidth }}>
        {/* Label - left aligned within the input container */}
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
        {showCurrentValue && value && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <AccessTime sx={{ color: 'white', fontSize: 24 }} />
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: 'white',
              }}
            >
              {formatTimeDisplay(value)}
            </Typography>
          </Box>
        )}

        {/* Time Input */}
        <TextField
          fullWidth
          type="time"
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          inputProps={{
            style: {
              fontSize: '1.4rem',
              fontWeight: 600,
              color: 'white',
              padding: '14px 16px',
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              minHeight: '56px',
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
              '&::-webkit-calendar-picker-indicator': {
                filter: 'invert(1)',
                cursor: 'pointer',
              },
            },
          }}
        />
      </Box>
    </Box>
  );
};
