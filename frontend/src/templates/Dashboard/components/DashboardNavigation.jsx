/**
 * DashboardNavigation.jsx - Unified navigation bar for all screen sizes
 *
 * Layout (xs to xl):
 * - Left: Status tabs in Paper (scrollable on small screens)
 * - Right: All filter controls (Bulk Actions, Scope, Sort, View toggles, Archive icon)
 * - Wraps gracefully when space is limited
 * - Responsive sizing for all controls
 * - Custom view mode icons (4 vertical bars for grid, single rect for list, stacked bars for table)
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
  Archive as ArchiveIcon,
} from '@mui/icons-material';
import { BulkActionsButton } from './BulkActionsButton';

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
  showArchived = false,
  onShowArchivedChange,
  archivedCount = 0,
  // Bulk selection props
  selectedItems = [],
  totalCount = 0,
  onClearSelection,
  onSelectAll,
  onBulkArchive,
  onBulkDelete,
  onBulkRestore,
  bulkActions = [],
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
      {/* Unified Layout - All screen sizes (xs to xl) */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between', // Force space between tabs and filters
          gap: 2,
          mb: 2,
        }}
      >
        {/* Status Tabs - only takes space it needs */}
        <Box sx={{ flexShrink: 0 }}>
          <Paper
            elevation={0}
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: '8px',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Tabs
              value={selectedStatus}
              onChange={(e, newValue) => onStatusChange(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: { xs: 44, sm: 48 },
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: { xs: '0.8125rem', sm: '0.875rem', md: '0.9375rem' },
                  fontWeight: 500,
                  minHeight: { xs: 44, sm: 48 },
                  px: { xs: 2, sm: 2.5, md: 3 },
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
        </Box>

        {/* Filters - snap to centered 2-row layout when space runs out */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexShrink: 0, // Don't shrink - maintain full width until breakpoint
          flexWrap: { xs: 'wrap', lg: 'nowrap' }, // Wrap on xs-md, no wrap on lg+
          justifyContent: { xs: 'center', lg: 'flex-end' }, // Centered when wrapped, right-aligned when single row
          marginLeft: { xs: 0, lg: 'auto' }, // Center on xs-md, right-align on lg+
          width: { xs: '100%', lg: 'auto' }, // Full width for centering on xs-md, auto on lg+
        }}>
          {/* Bulk Actions - Row 1 on all wrapped layouts */}
          <Box sx={{ order: { xs: 1, lg: 0 } }}>
            <BulkActionsButton
              selectedCount={selectedItems.length}
              totalCount={totalCount}
              onClearSelection={onClearSelection}
              onSelectAll={onSelectAll}
              onArchive={onBulkArchive}
              onDelete={onBulkDelete}
              onRestore={onBulkRestore}
              isArchived={false}
              customActions={bulkActions}
            />
          </Box>

          {/* Scope - Row 1 on all wrapped layouts */}
          {scopeOptions.length > 0 && (
            <Box sx={{ order: { xs: 2, lg: 0 } }}>
              <Select
                value={selectedScope}
                onChange={(e) => onScopeChange(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: 120, sm: 140, md: 160 },
                  height: 32,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  },
                  '& .MuiSelect-select': {
                    py: 0.5,
                    px: { xs: 1, sm: 1.5 },
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                }}
              >
                {scopeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.fullLabel || option.label}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          )}

          {/* Sort - Row 2 on md, Row 1 on xs-sm */}
          {sortOptions.length > 0 && (
            <Box sx={{ order: { xs: 3, md: 4, lg: 0 } }}>
              <FormControl size="small" variant="standard" sx={{ minWidth: { xs: 110, sm: 120, md: 140 } }}>
                <Select
                  value={sortBy}
                  onChange={(e) => onSortByChange(e.target.value)}
                  disableUnderline
                  startAdornment={
                    <Sort sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: '1.125rem', color: 'text.secondary' }} />
                  }
                  renderValue={(value) => (
                    <Typography variant="body2" sx={{
                      fontSize: { xs: '0.8125rem', sm: '0.875rem' },
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {sortLabels[value] || value}
                    </Typography>
                  )}
                  sx={{
                    backgroundColor: 'transparent',
                    borderRadius: 1,
                    px: { xs: 1, sm: 1.5 },
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
            </Box>
          )}

          {/* View toggles - Row 2 on all wrapped layouts */}
          <Box sx={{ order: { xs: 4, md: 5, lg: 0 } }}>
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
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  height: '32px',
                  minWidth: { xs: '32px', sm: 'auto' },
                },
              }}
            >
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
            <ToggleButton value="list" title="Full width view">
              <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
            </ToggleButton>
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
          </Box>

          {/* Archive - Row 2 on all wrapped layouts */}
          <Box sx={{ order: { xs: 5, md: 6, lg: 0 } }}>
            <IconButton
              size="small"
              onClick={() => onShowArchivedChange(!showArchived)}
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                backgroundColor: showArchived ? alpha('#000', 0.8) : alpha('#000', 0.06),
                color: showArchived ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: showArchived ? alpha('#000', 0.9) : alpha('#000', 0.1),
                },
                transition: 'all 0.2s',
              }}
            >
              <Badge badgeContent={archivedCount} color="error" max={99}>
                <ArchiveIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardNavigation;
