import React from 'react';
import {
  Box,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  InputAdornment
} from '@mui/material';
import {
  ViewModule,
  ViewList,
  TableChart,
  CalendarToday,
  Search,
  FilterList
} from '@mui/icons-material';

const DashboardToolbar = ({
  viewMode = 'grid',
  onViewModeChange,
  searchTerm = '',
  onSearchChange,
  onFilterClick,
  actions = [],
  availableModes = ['grid', 'list', 'table'],
  searchPlaceholder = 'Search...',
  loading = false
}) => {
  const viewModeIcons = {
    grid: <ViewModule />,
    list: <ViewList />,
    table: <TableChart />,
    calendar: <CalendarToday />
  };

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      gap: 2,
      flexWrap: 'wrap'
    }}>
      {/* Left: View Mode Toggle */}
      <ToggleButtonGroup
        value={viewMode}
        exclusive
        onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
        size="small"
        disabled={loading}
      >
        {availableModes.map(mode => (
          <ToggleButton key={mode} value={mode} aria-label={`${mode} view`}>
            {viewModeIcons[mode]}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      {/* Center: Search */}
      <TextField
        placeholder={searchPlaceholder}
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        disabled={loading}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          )
        }}
        sx={{
          minWidth: 250,
          maxWidth: 400,
          flex: '1 1 auto'
        }}
      />

      {/* Right: Actions */}
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onFilterClick && (
          <Button
            startIcon={<FilterList />}
            onClick={onFilterClick}
            variant="outlined"
            size="small"
            disabled={loading}
          >
            Filters
          </Button>
        )}
        {actions.map((action, index) => (
          <Button
            key={action.label || index}
            onClick={action.onClick}
            startIcon={action.icon}
            variant={action.variant || 'contained'}
            color={action.color || 'primary'}
            size="small"
            disabled={action.disabled || loading}
            {...action.props}
          >
            {action.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
};

export default DashboardToolbar;
