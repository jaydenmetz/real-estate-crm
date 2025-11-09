import React from 'react';
import {
  ToggleButtonGroup,
  ToggleButton,
  Box,
} from '@mui/material';

/**
 * ViewModeToggle - Grid/List/Table view mode toggle
 *
 * Custom icons for each view mode
 *
 * @param {string} viewMode - Currently selected view mode
 * @param {Function} onViewModeChange - Handler for view mode change
 * @param {boolean} showCalendar - Is calendar view active
 * @param {Function} onShowCalendarChange - Handler for calendar toggle
 */
const ViewModeToggle = ({
  viewMode,
  onViewModeChange,
  showCalendar,
  onShowCalendarChange,
}) => {
  return (
    <ToggleButtonGroup
      value={showCalendar ? 'calendar' : viewMode}
      exclusive
      onChange={(e, newValue) => {
        if (newValue !== null) {
          if (newValue === 'calendar') {
            onShowCalendarChange(true);
          } else {
            onShowCalendarChange(false);
            onViewModeChange(newValue);
          }
        }
      }}
      size="small"
      sx={{
        '& .MuiToggleButton-root': {
          px: { xs: 2, md: 1.5 },
          py: 0.5,
          textTransform: 'none',
          fontWeight: 500,
          height: '32px',
        },
      }}
    >
      {/* Grid/Card View */}
      <ToggleButton value="card" title="Card view">
        <Box sx={{ display: 'flex', width: 24, height: 12, alignItems: 'center' }}>
          <Box sx={{ width: 5, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
          <Box sx={{ width: '1.33px' }} />
          <Box sx={{ width: 5, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
          <Box sx={{ width: '1.34px' }} />
          <Box sx={{ width: 5, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
          <Box sx={{ width: '1.33px' }} />
          <Box sx={{ width: 5, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
        </Box>
      </ToggleButton>

      {/* List/Full Width View */}
      <ToggleButton value="list" title="Full width view">
        <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
      </ToggleButton>

      {/* Table View */}
      <ToggleButton value="table" title="Table view">
        <Box sx={{ display: 'flex', flexDirection: 'column', width: 24, height: 12 }}>
          <Box sx={{ height: '0.33px' }} />
          <Box sx={{ width: 24, height: 5.5, bgcolor: 'currentColor', borderRadius: 0.5 }} />
          <Box sx={{ height: '1.34px' }} />
          <Box sx={{ width: 24, height: 5.5, bgcolor: 'currentColor', borderRadius: 0.5 }} />
          <Box sx={{ height: '0.33px' }} />
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default ViewModeToggle;
