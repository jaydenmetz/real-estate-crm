import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Grid } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  isValid
} from 'date-fns';
import { parseLocalDate } from '../../../../utils/safeDateUtils';

/**
 * Custom Calendar Component
 * Displays a styled calendar grid that matches the modal theme
 *
 * @param {Date|string} selectedDate - Currently selected date
 * @param {function} onSelectDate - Callback when date is clicked (Date) => void
 * @param {string} color - Theme color for the calendar
 * @param {Date|string} minDate - Optional minimum selectable date (dates before this are disabled)
 */
export const CustomCalendar = ({ selectedDate, onSelectDate, color = '#6366f1', minDate = null }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      // Parse as local date to avoid timezone shifts (for DATE columns)
      const date = typeof selectedDate === 'string' ? parseLocalDate(selectedDate) : selectedDate;
      return date || new Date();
    }
    return new Date();
  });

  // Auto-navigate to selected date's month when selectedDate changes (e.g., manual typing in date input)
  useEffect(() => {
    if (selectedDate) {
      const date = typeof selectedDate === 'string' ? parseLocalDate(selectedDate) : selectedDate;
      if (date && isValid(date)) {
        console.log('📅 CustomCalendar: Jumping to month:', format(date, 'MMMM yyyy'));
        setCurrentMonth(date);
      }
    }
  }, [selectedDate]);

  const renderHeader = () => {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <IconButton
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <ChevronLeft />
        </IconButton>
        <Typography
          sx={{
            color: 'white',
            fontWeight: 700,
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
          }}
        >
          {format(currentMonth, 'MMMM yyyy')}
        </Typography>
        <IconButton
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          sx={{
            color: 'white',
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>
    );
  };

  const renderDaysOfWeek = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <Grid container spacing={0.5} sx={{ mb: 1 }}>
        {days.map((day, index) => (
          <Grid item xs={12 / 7} key={index}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 1,
              }}
            >
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                }}
              >
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    // Parse selected date as local date to avoid timezone issues
    const selectedDateObj = selectedDate
      ? (typeof selectedDate === 'string' ? parseLocalDate(selectedDate) : selectedDate)
      : null;

    // Parse minDate as local date if provided
    const minDateObj = minDate
      ? (typeof minDate === 'string' ? parseLocalDate(minDate) : minDate)
      : null;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const isSelected = selectedDateObj && isSameDay(day, selectedDateObj);
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isTodayDate = isToday(day);

        // Check if date is before minDate (disabled)
        const isBeforeMin = minDateObj && currentDay < minDateObj;
        const isDisabled = isBeforeMin;

        days.push(
          <Grid item xs={12 / 7} key={day.toString()}>
            <Box
              onClick={() => !isDisabled && onSelectDate(currentDay)}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                py: 1.5,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                position: 'relative',
                borderRadius: 1,
                transition: 'all 0.2s',
                opacity: isDisabled ? 0.4 : 1,
                '&:hover': {
                  backgroundColor: isDisabled ? 'transparent' : 'rgba(255,255,255,0.15)',
                },
              }}
            >
              <Typography
                sx={{
                  color: isSelected
                    ? 'white'
                    : isDisabled
                    ? 'rgba(255,255,255,0.25)' // Same as non-current month dates
                    : isCurrentMonth
                    ? 'rgba(255,255,255,0.9)'
                    : 'rgba(255,255,255,0.3)',
                  fontWeight: isSelected || isTodayDate ? 900 : 600,
                  fontSize: '0.95rem',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                {format(currentDay, 'd')}
              </Typography>

              {/* Selected date background */}
              {isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    backgroundColor: 'white',
                    opacity: 0.25,
                    zIndex: 0,
                  }}
                />
              )}

              {/* Today's date circle outline */}
              {isTodayDate && !isSelected && (
                <Box
                  sx={{
                    position: 'absolute',
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.5)',
                    zIndex: 0,
                  }}
                />
              )}
            </Box>
          </Grid>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <Grid container spacing={0.5} key={day.toString()}>
          {days}
        </Grid>
      );
      days = [];
    }

    return <Box>{rows}</Box>;
  };

  return (
    <Box sx={{ mt: 2 }}>
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
    </Box>
  );
};
