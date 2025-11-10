import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, TextField } from '@mui/material';
import { Check, Close, Event } from '@mui/icons-material';
import { format, isValid } from 'date-fns';
import { parseLocalDate } from '../../../../utils/safeDateUtils';
import { ModalDialog } from '../shared/ModalDialog';
import { CustomCalendar } from '../shared/CustomCalendar';

/**
 * Generic Date Editor
 * Reusable component for editing any date value
 *
 * @param {boolean} open - Dialog open state
 * @param {function} onClose - Close handler
 * @param {function} onSave - Save handler (newDateValue) => void
 * @param {string} label - Field label (e.g., "Acceptance Date", "Listed Date")
 * @param {string|Date} value - Current date value (ISO string or Date object)
 * @param {string} color - Calendar color theme
 */
export const EditDate = ({
  open,
  onClose,
  onSave,
  label,
  value,
  color = '#6366f1',
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
    console.log('Manual input:', dateString);
    if (dateString) {
      try {
        // Parse as local date to avoid timezone shifts
        const date = parseLocalDate(dateString);
        if (isValid(date)) {
          console.log('Parsed manual date:', date);
          setEditValue(date);
        }
      } catch (error) {
        console.error('Invalid date input:', error);
      }
    }
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

  return (
    <ModalDialog open={open} onClose={onClose} color={color}>
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

        {/* Current Date Display */}
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

        {/* Manual Date Input (Optional) */}
        <TextField
          fullWidth
          value={typeof editValue === 'string' ? editValue : editValue ? format(editValue, 'yyyy-MM-dd') : ''}
          onChange={handleManualInput}
          onKeyDown={handleKeyPress}
          type="date"
          disabled={saving}
          inputProps={{
            max: '2099-12-31',
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

        {/* Custom Calendar */}
        <CustomCalendar
          selectedDate={editValue}
          onSelectDate={handleCalendarSelect}
          color={color}
        />

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'flex-end' }}>
          <IconButton
            onClick={onClose}
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
            onClick={handleSave}
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
      </Box>
    </ModalDialog>
  );
};
