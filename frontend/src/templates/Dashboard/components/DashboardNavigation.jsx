import React from 'react';
import { Box, Paper, Stack, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { GridView, ViewList, Sort } from '@mui/icons-material';

/**
 * DashboardNavigation - Config-driven navigation with tabs, filters, and view modes
 */
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
  sortOrder,
  onSortOrderChange,
  customFilters,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
        spacing={2}
        sx={{ p: 2 }}
      >
        {/* Status Tabs */}
        {config.statusTabs && config.statusTabs.length > 0 && (
          <Tabs
            value={selectedStatus}
            onChange={(e, newValue) => onStatusChange(newValue)}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
            }}
          >
            {config.statusTabs.map(tab => (
              <Tab
                key={tab.value}
                label={tab.label}
                value={tab.value}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  minWidth: 'auto',
                  px: 3,
                }}
              />
            ))}
          </Tabs>
        )}

        {/* Right Side Controls */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Scope Filter */}
          {config.scopeOptions && config.scopeOptions.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Scope</InputLabel>
              <Select
                value={selectedScope}
                label="Scope"
                onChange={(e) => onScopeChange(e.target.value)}
              >
                {config.scopeOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* Sort Options */}
          {config.sortOptions && config.sortOptions.length > 0 && (
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => onSortByChange(e.target.value)}
              >
                {config.sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          {/* View Mode Toggle */}
          {config.viewModes && config.viewModes.length > 0 && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && onViewModeChange(newMode)}
              size="small"
            >
              {config.viewModes.map(mode => {
                const Icon = mode.value === 'grid' ? GridView : ViewList;
                return (
                  <ToggleButton key={mode.value} value={mode.value}>
                    <Icon fontSize="small" />
                  </ToggleButton>
                );
              })}
            </ToggleButtonGroup>
          )}

          {/* Custom Filters */}
          {customFilters}
        </Stack>
      </Stack>
    </Paper>
  );
};
