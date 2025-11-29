import React from 'react';
import { Box, Typography, TextField, Alert } from '@mui/material';
import { Event } from '@mui/icons-material';
import { format, isValid, isBefore, isAfter } from 'date-fns';
import { parseLocalDate } from '../../../utils/safeDateUtils';
import { CustomCalendar } from '../inputs/shared/CustomCalendar';

/**
 * Date Setter - Pure date input component
 * Self-contained: Label + Current Value + Calendar + Input
 *
 * Usage in EditorModal (editing existing value):
 * <EditorModal>
 *   <Date label="Acceptance Date" value={date} onChange={setDate} />
 * </EditorModal>
 *
 * Usage in ModalStepPage (creation flow):
 * <ModalStepPage>
 *   <Date label="Acceptance Date" value={date} onChange={setDate} showCurrentValue={false} />
 * </ModalStepPage>
 *
 * @param {string} label - Field label (e.g., "Acceptance Date", "Listed Date")
 * @param {string|Date} value - Current date value (ISO string or Date object)
 * @param {function} onChange - Change handler (newDate) => void (receives Date object)
 * @param {string} color - Calendar color theme
 * @param {Date|string} minDate - Optional minimum selectable date
 * @param {Date|string} maxDate - Optional maximum selectable date
 * @param {boolean} showCurrentValue - Show current value display (default: true, hide in creation flows)
 * @param {boolean} disabled - Disable input
 */
export const Date = ({
  label,
  value,
  onChange,
  color = '#6366f1',
  minDate = null,
  maxDate = null,
  showCurrentValue = true,
  disabled = false,
}) => {
  // Parse value to Date object for internal use
  const dateValue = value ? (typeof value === 'string' ? parseLocalDate(value) : new Date(value)) : null;
  const isValidDate = dateValue && isValid(dateValue);

  // Validation: Check if dateValue violates min/max bounds
  const getValidationError = () => {
    if (!isValidDate) return null;

    if (minDate) {
      const min = typeof minDate === 'string' ? parseLocalDate(minDate) : minDate;
      if (isValid(min) && isBefore(dateValue, min)) {
        return `Please select a date after ${format(min, 'MMM d, yyyy')}`;
      }
    }

    if (maxDate) {
      const max = typeof maxDate === 'string' ? parseLocalDate(maxDate) : maxDate;
      if (isValid(max) && isAfter(dateValue, max)) {
        return `Please select a date before ${format(max, 'MMM d, yyyy')}`;
      }
    }

    return null;
  };

  const validationError = getValidationError();

  const handleCalendarSelect = (date) => {
    onChange(date);
  };

  const handleManualInput = (e) => {
    const dateString = e.target.value;

    if (!dateString) {
      onChange(null);
      return;
    }

    if (dateString.length === 10) {
      try {
        const date = parseLocalDate(dateString);
        if (isValid(date)) {
          onChange(date);
        }
      } catch (error) {
        console.error('Error parsing date:', error);
      }
    }
  };

  const formatDisplayDate = (dateVal) => {
    if (!dateVal) return 'Not set';
    try {
      const date = typeof dateVal === 'string' ? parseLocalDate(dateVal) : new Date(dateVal);
      if (!isValid(date)) return 'Not set';
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return 'Not set';
    }
  };

  return (
    <Box>
      {/* Label */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Event sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 20 }} />
        <Typography
          variant="caption"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.9)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          {label}
        </Typography>
      </Box>

      {/* Current Date Display - Only show if enabled (hide in creation flows) */}
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
          {formatDisplayDate(value)}
        </Typography>
      )}

      {/* Validation Alert */}
      {validationError && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            backgroundColor: 'rgba(255, 152, 0, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 152, 0, 0.3)',
            '& .MuiAlert-icon': {
              color: 'rgba(255, 152, 0, 0.9)',
            },
          }}
        >
          {validationError}
        </Alert>
      )}

      {/* Manual Date Input */}
      <TextField
        fullWidth
        defaultValue={isValidDate ? format(dateValue, 'yyyy-MM-dd') : ''}
        key={isValidDate ? format(dateValue, 'yyyy-MM-dd') : 'empty'}
        onChange={handleManualInput}
        type="date"
        disabled={disabled}
        inputProps={{
          max: maxDate ? format(typeof maxDate === 'string' ? parseLocalDate(maxDate) : maxDate, 'yyyy-MM-dd') : '2099-12-31',
          min: minDate ? format(typeof minDate === 'string' ? parseLocalDate(minDate) : minDate, 'yyyy-MM-dd') : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            borderRadius: 2,
            fontSize: '1.1rem',
            fontWeight: 600,
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
            fontWeight: 600,
            fontSize: '1.1rem',
            padding: '12px',
          },
          '& input[type="date"]::-webkit-calendar-picker-indicator': {
            filter: 'invert(1)',
            fontSize: '1.2rem',
            cursor: 'pointer',
          },
        }}
      />

      {/* Live Preview */}
      {isValidDate && (
        <Typography
          variant="body2"
          sx={{
            mt: 1.5,
            color: 'rgba(255,255,255,0.7)',
            fontStyle: 'italic',
            fontSize: '0.95rem',
          }}
        >
          Preview: {format(dateValue, 'MMMM d, yyyy')}
        </Typography>
      )}

      {/* Custom Calendar */}
      <CustomCalendar
        selectedDate={dateValue}
        onSelectDate={handleCalendarSelect}
        color={color}
        minDate={minDate}
      />
    </Box>
  );
};
