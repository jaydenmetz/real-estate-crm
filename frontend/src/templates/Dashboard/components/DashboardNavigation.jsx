/**
 * DashboardNavigation.jsx - Navigation bar matching ClientNavigation architecture
 *
 * Contains:
 * - Status tabs in separate Paper (desktop) with sophisticated styling
 * - Scope selector, Sort dropdown, View mode toggle, Archive icon (desktop right-aligned)
 * - Mobile: Tabs at top, controls in gray box below
 * - Archive tab with badge (mobile)
 * - Calendar view toggle option
 * - Custom view mode icons (4 vertical bars for grid, single rect for large)
 */

import React from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Typography,
  Badge,
  alpha,
} from '@mui/material';
import {
  Sort,
  CalendarToday,
  Delete as DeleteIcon,
} from '@mui/icons-material';

export const DashboardNavigation = ({
  config,
  selectedStatus,
  onStatusChange,
  selectedScope,
  onScopeChange,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortByChange,
  showCalendar,
  onShowCalendarChange,
  archivedCount = 0,
}) => {
  // Get sort options from config
  const sortOptions = config?.sortOptions || [];
  const scopeOptions = config?.scopeOptions || [];
  const statusTabs = config?.statusTabs || [];

  // Labels for sort and scope
  const sortLabels = sortOptions.reduce((acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  }, {});

  const scopeLabels = scopeOptions.reduce((acc, opt) => {
    acc[opt.value] = opt.label;
    return acc;
  }, {});

  return (
    <Box sx={{ mb: 4 }}>
      {/* Desktop Layout */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-start',
        }}
      >
        {/* Left: Tabs with gray background */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'divider',
            flex: '0 0 auto',
          }}
        >
          <Tabs
            value={selectedStatus}
            onChange={(e, newValue) => onStatusChange(newValue)}
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: '0.9375rem',
                fontWeight: 500,
                minHeight: 48,
                px: 3,
                color: 'text.secondary',
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: alpha('#1976d2', 0.04),
                },
              },
              '& .Mui-selected': {
                fontWeight: 600,
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            {statusTabs.filter(tab => tab.value !== 'archived').map(tab => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
          </Tabs>
        </Paper>

        {/* Spacer - CRITICAL for Clients layout */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right: Controls */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}>
          {/* Scope Dropdown */}
          {scopeOptions.length > 0 && (
            <FormControl size="small" variant="standard" sx={{ minWidth: 110 }}>
              <Select
                value={selectedScope}
                onChange={(e) => onScopeChange(e.target.value)}
                disableUnderline
                renderValue={(value) => (
                  <Typography variant="body2" sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.primary',
                  }}>
                    {scopeLabels[value] || value}
                  </Typography>
                )}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-select': {
                    paddingRight: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                {scopeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Sort Dropdown */}
          {sortOptions.length > 0 && (
            <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
              <Select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value)}
                disableUnderline
                startAdornment={
                  <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
                }
                renderValue={(value) => (
                  <Typography variant="body2" sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'text.primary',
                  }}>
                    {sortLabels[value] || value}
                  </Typography>
                )}
                sx={{
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  px: 1.5,
                  py: 0.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                  '& .MuiSelect-select': {
                    paddingRight: '32px !important',
                    display: 'flex',
                    alignItems: 'center',
                  },
                }}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* View Mode & Calendar Selector */}
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
                px: 1.5,
                py: 0.5,
                textTransform: 'none',
                fontWeight: 500,
                height: '32px',
              },
            }}
          >
            <ToggleButton value="small" title="Grid view">
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
              </Box>
            </ToggleButton>
            <ToggleButton value="large" title="Full width view">
              <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
            </ToggleButton>
            <ToggleButton value="calendar" title="Calendar view">
              <CalendarToday sx={{ fontSize: 16 }} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Archive/Trash Icon */}
          <IconButton
            size="small"
            onClick={() => onStatusChange('archived')}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: selectedStatus === 'archived' ? 'warning.main' : alpha('#000', 0.06),
              color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
              '&:hover': {
                backgroundColor: selectedStatus === 'archived' ? 'warning.dark' : alpha('#000', 0.1),
              },
              transition: 'all 0.2s',
            }}
          >
            <Badge badgeContent={archivedCount} color="error" max={99}>
              <DeleteIcon sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>
        </Box>
      </Box>

      {/* Mobile/Tablet Layout */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* Tab Bar - Mobile/Tablet */}
        <Paper
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderRadius: '8px 8px 0 0',
            borderBottom: '1px solid',
            borderColor: 'divider',
            mb: 0,
          }}
        >
          <Tabs
            value={selectedStatus}
            onChange={(e, newValue) => onStatusChange(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                fontWeight: 500,
                minHeight: { xs: 48, sm: 52 },
                px: { xs: 2, sm: 2.5 },
              },
              '& .Mui-selected': {
                fontWeight: 600,
                color: 'primary.main',
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
              },
            }}
          >
            {statusTabs.filter(tab => tab.value !== 'archived').map(tab => (
              <Tab key={tab.value} label={tab.label} value={tab.value} />
            ))}
            {/* Archive Badge for Mobile */}
            <Tab
              label={
                <Badge badgeContent={archivedCount} color="error" max={99}>
                  <span>Archived</span>
                </Badge>
              }
              value="archived"
            />
          </Tabs>
        </Paper>

        {/* Mobile/Tablet Filter Controls */}
        <Box
          sx={{
            backgroundColor: alpha('#f5f5f5', 0.4),
            borderRadius: '0 0 8px 8px',
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Sort and View Controls */}
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Scope Dropdown */}
            {scopeOptions.length > 0 && (
              <FormControl
                size="small"
                variant="outlined"
                sx={{
                  flex: '0 1 auto',
                  minWidth: 100,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                  },
                }}
              >
                <Select
                  value={selectedScope}
                  onChange={(e) => onScopeChange(e.target.value)}
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {scopeLabels[value] || value}
                      </Typography>
                    </Box>
                  )}
                >
                  {scopeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* Sort Dropdown */}
            {sortOptions.length > 0 && (
              <FormControl
                size="small"
                variant="outlined"
                sx={{
                  flex: '1 1 auto',
                  maxWidth: { xs: '60%', sm: '200px' },
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'white',
                    borderRadius: 2,
                  },
                }}
              >
                <Select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  startAdornment={<Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />}
                  renderValue={(value) => (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Sort: {sortLabels[value] || value}
                      </Typography>
                    </Box>
                  )}
                >
                  {sortOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            {/* View Mode & Calendar - Mobile */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
                    px: 2,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 500,
                    height: '32px',
                  },
                }}
              >
                <ToggleButton value="small" title="Grid view">
                  <Box sx={{ display: 'flex', gap: 0.4 }}>
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  </Box>
                </ToggleButton>
                <ToggleButton value="large" title="Full width view">
                  <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </ToggleButton>
                <ToggleButton value="calendar" title="Calendar view">
                  <CalendarToday sx={{ fontSize: 16 }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardNavigation;
