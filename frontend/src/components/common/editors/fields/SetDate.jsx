import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, TextField, Alert } from '@mui/material';
import { Check, Close, Event } from '@mui/icons-material';
import { format, isValid, isBefore, isAfter } from 'date-fns';
import { parseLocalDate } from '../../../../utils/safeDateUtils';
import { ModalContainer } from '../../modals/ModalContainer';
import { CustomCalendar } from '../shared/CustomCalendar';

/**
 * Generic Date Setter
 * Reusable component for editing any date value
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string} label - Field label (e.g., "Acceptance Date", "Listed Date")
 * @param {string|Date} value - Current date value (ISO string or Date object)
 * @param {string} color - Calendar color theme
 * @param {Date|string} minDate - Optional minimum selectable date (for end date validation)
 * @param {Date|string} maxDate - Optional maximum selectable date (for start date validation)
 * @param {function} onSaveSuccess - Optional callback after successful save (for auto-progression)
 * @param {boolean} inline - If true, hides action buttons (used in flow contexts like NewEscrowModal)
 */
export const SetDate = ({
  open,
  onClose,
  onSave,
  label,
  value,
  color = '#6366f1',
  minDate = null,
  maxDate = null,
  onSaveSuccess = null,
  inline = false,
}) => {
  const [editValue, setEditValue] = useState(null);
  const [saving, setSaving] = useState(false);

  // Initialize editValue when dialog opens - keep as Date object
  useEffect(() => {
    if (open && value) {
      try {
        // Parse as local date to avoid timezone shifts (for DATE columns)
        const date = typeof value === 'string' ? parseLocalDate(value) : new Date(value);

        if (isValid(date)) {
          setEditValue(date); // Store as Date object
        } else {
          setEditValue(null);
        }
      } catch (error) {
        setEditValue(null);
      }
    } else if (open) {
      setEditValue(null);
    }
  }, [open, value]);

  // Validation: Check if editValue violates min/max bounds
  const getValidationError = () => {
    if (!editValue || !isValid(editValue)) return null;

    if (minDate) {
      const min = typeof minDate === 'string' ? parseLocalDate(minDate) : minDate;
      if (isValid(min) && isBefore(editValue, min)) {
        return `Please select a date after ${format(min, 'MMM d, yyyy')}`;
      }
    }

    if (maxDate) {
      const max = typeof maxDate === 'string' ? parseLocalDate(maxDate) : maxDate;
      if (isValid(max) && isAfter(editValue, max)) {
        return `Please select a date before ${format(max, 'MMM d, yyyy')}`;
      }
    }

    return null;
  };

  const validationError = getValidationError();

  const handleSave = async () => {
    if (!editValue) {
      return;
    }

    setSaving(true);
    try {
      // Ensure editValue is a valid Date object
      let dateToSave = editValue;

      // If it's a string, parse it
      if (typeof editValue === 'string') {
        dateToSave = parseISO(editValue);
      }

      // Validate the date
      if (!isValid(dateToSave)) {
        console.error('Invalid date selected:', editValue);
        setSaving(false);
        return;
      }

      // Format as YYYY-MM-DD for PostgreSQL DATE columns (no time component)
      // Use UTC methods to avoid timezone shifts (e.g., selecting Nov 28 should save as 2025-11-28, not 2025-11-27)
      const year = dateToSave.getFullYear();
      const month = String(dateToSave.getMonth() + 1).padStart(2, '0');
      const day = String(dateToSave.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      console.log('Saving date:', { editValue, dateToSave, dateString });

      await onSave(dateString);

      // Call success callback for auto-progression (e.g., open end date editor)
      if (onSaveSuccess) {
        onSaveSuccess(dateToSave);
      }

      onClose();
    } catch (error) {
      console.error('Failed to save date:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCalendarSelect = (date) => {
    console.log('Calendar selected:', date, 'Type:', typeof date);
    setEditValue(date);
  };

  const handleManualInput = (e) => {
    // Allow manual typing in YYYY-MM-DD format, convert to Date object
    const dateString = e.target.value;
    console.log('📅 Manual input received:', dateString, 'Length:', dateString?.length);

    // HTML5 date input only emits complete YYYY-MM-DD values or empty string
    // If empty, clear the date
    if (!dateString) {
      console.log('❌ Empty date string, clearing editValue');
      setEditValue(null);
      return;
    }

    // If we have a complete date string (10 characters: YYYY-MM-DD)
    if (dateString.length === 10) {
      try {
        // Parse as local date to avoid timezone shifts
        const date = parseLocalDate(dateString);
        console.log('🔄 Parsed date:', date, 'Valid:', isValid(date));

        if (isValid(date)) {
          console.log('✅ Setting editValue to:', date);
          setEditValue(date);
        } else {
          console.warn('⚠️ Invalid date string:', dateString);
        }
      } catch (error) {
        console.error('❌ Error parsing date:', error);
      }
    } else {
      console.log('⏳ Partial input, waiting for complete date...');
    }
    // For partial inputs (typing in progress), HTML5 input handles display
    // We don't need to do anything - let the user finish typing
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const formatDisplayDate = (dateValue) => {
    if (!dateValue) return 'Not set';
    try {
      // Parse as local date to avoid timezone shifts
      const date = typeof dateValue === 'string' ? parseLocalDate(dateValue) : new Date(dateValue);

      if (!isValid(date)) return 'Not set';
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      return 'Not set';
    }
  };

  const content = (
    <Box
      onClick={(e) => e.stopPropagation()}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 500 }}>
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

        {/* Current Date Display - Only show if not inline OR if value exists */}
        {(!inline || value) && (
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

        {/* Manual Date Input (Optional) */}
        <TextField
          fullWidth
          defaultValue={typeof editValue === 'string' ? editValue : editValue ? format(editValue, 'yyyy-MM-dd') : ''}
          key={editValue ? format(editValue, 'yyyy-MM-dd') : 'empty'} // Force re-render when editValue changes externally (e.g., calendar click)
          onChange={handleManualInput}
          onKeyDown={handleKeyPress}
          type="date"
          disabled={saving}
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
        {editValue && isValid(editValue) && (
          <Typography
            variant="body2"
            sx={{
              mt: 1.5,
              color: 'rgba(255,255,255,0.7)',
              fontStyle: 'italic',
              fontSize: '0.95rem',
            }}
          >
            Preview: {format(editValue, 'MMMM d, yyyy')}
          </Typography>
        )}

        {/* Custom Calendar */}
        <CustomCalendar
          selectedDate={editValue}
          onSelectDate={handleCalendarSelect}
          color={color}
          minDate={minDate}
        />

        {/* Action Buttons - Only show in standalone mode (not inline) */}
        {!inline && (
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              disabled={saving}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'rgba(255,255,255,0.15)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.25)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <Close />
            </IconButton>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                handleSave();
              }}
              disabled={saving || !editValue}
              sx={{
                width: 48,
                height: 48,
                backgroundColor: 'white',
                color: color,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                },
                '&:disabled': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  color: 'rgba(0,0,0,0.2)',
                },
              }}
            >
              <Check />
            </IconButton>
          </Box>
        )}
      </Box>
    </Box>
  );

  // Inline mode: Return content directly without modal wrapper
  if (inline) {
    return content;
  }

  // Standalone mode: Wrap in ModalContainer
  return (
    <ModalContainer open={open} onClose={onClose} color={color}>
      {content}
    </ModalContainer>
  );
};
