import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Check, Close, Event } from '@mui/icons-material';
import { format, parseISO, isValid } from 'date-fns';
import { ModalDialog } from '../shared/ModalDialog';
import { DateInput } from '../shared/DateInput';

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
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize editValue when dialog opens
  useEffect(() => {
    if (open && value) {
      try {
        const date = typeof value === 'string' ? parseISO(value) : new Date(value);
        if (isValid(date)) {
          // Format for input: YYYY-MM-DD
          setEditValue(format(date, 'yyyy-MM-dd'));
        } else {
          setEditValue('');
        }
      } catch (error) {
        setEditValue('');
      }
    } else if (open) {
      setEditValue('');
    }
  }, [open, value]);

  const handleSave = async () => {
    if (!editValue) {
      return;
    }

    setSaving(true);
    try {
      // Convert to ISO string for backend
      const date = parseISO(editValue);
      if (!isValid(date)) {
        console.error('Invalid date selected');
        return;
      }

      await onSave(date.toISOString());
      onClose();
    } catch (error) {
      console.error('Failed to save date:', error);
    } finally {
      setSaving(false);
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
      const date = typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);
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

        {/* Date Picker Input */}
        <DateInput
          value={editValue}
          onChange={setEditValue}
          onKeyDown={handleKeyPress}
          disabled={saving}
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
