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

import React, { useEffect, useRef } from 'react';
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
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { BulkActionsButton } from './BulkActionsButton';
import { StatusTabWithDropdown } from './StatusTabWithDropdown';

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
  sortOrder = 'asc',
  onSortOrderChange,
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

  // Track the previous tab to detect tab switches
  const prevTabRef = useRef(null);

  // Auto-upgrade selectedStatus to include status keys ONLY on:
  // 1. Initial load (no colon in status)
  // 2. Tab switch (different tab than before)
  // This allows users to deselect checkboxes within a tab without auto-reselecting
  useEffect(() => {
    // Parse current tab from selectedStatus
    const currentTab = selectedStatus?.includes(':')
      ? selectedStatus.split(':')[0]
      : selectedStatus;

    // Check if this is a tab switch (different from previous)
    const isTabSwitch = prevTabRef.current !== null && prevTabRef.current !== currentTab;

    // Update the previous tab ref
    prevTabRef.current = currentTab;

    // Only auto-upgrade if:
    // 1. No colon (initial load or fresh tab name like "Active")
    // 2. OR it's a tab switch (reset to defaults when switching tabs)
    const shouldAutoUpgrade = selectedStatus && !selectedStatus.includes(':');

    if (shouldAutoUpgrade) {
      // Find the matching tab with statuses
      const matchingTab = statusTabs.find(tab =>
        tab.value === currentTab &&
        tab.statuses &&
        tab.statuses.length > 0
      );

      if (matchingTab) {
        // Handle both formats:
        // 1. Static config: statuses = ['active', 'pending'] (array of strings)
        // 2. Database-driven: statuses = [{status_key: 'Active', ...}] (array of objects)
        const allStatusKeysInTab = matchingTab.statuses.map(s =>
          typeof s === 'string' ? s : s.status_key
        );
        if (allStatusKeysInTab.length > 0) {
          // Upgrade "Active" to "Active:Active" (or "Active:status1,status2,..." for multi-status tabs)
          onStatusChange(`${currentTab}:${allStatusKeysInTab.join(',')}`);
        }
      }
    }
  }, [selectedStatus, statusTabs, onStatusChange]);

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
              {statusTabs.filter(tab => tab.value !== 'archived').map((tab, index, allTabs) => {
                // Check if tab has dropdown configuration (from new status system)
                const hasDropdown = tab.statuses && tab.statuses.length > 0;

                // Get entity name (could be config.entity.namePlural or config.entity)
                const entityName = config?.entity?.namePlural || config?.entity;

                // Debug logging
                console.log('Tab Debug:', {
                  tabLabel: tab.label,
                  tabValue: tab.value,
                  hasStatuses: !!tab.statuses,
                  statusesLength: tab.statuses?.length,
                  hasDropdown,
                  entityName,
                  willUseDropdown: hasDropdown && entityName
                });

                if (hasDropdown && entityName) {
                  // Parse selectedStatus - format: "Active" or "Active:status1,status2"
                  const [sourceTab, statusList] = selectedStatus.includes(':')
                    ? selectedStatus.split(':')
                    : [selectedStatus, null];

                  // Determine which tab should be selected
                  const isTabSelected = sourceTab === tab.value;

                  // Get all status keys available in this tab/category
                  // Handle both formats: array of strings or array of objects with status_key
                  const allStatusKeysInTab = (tab.statuses || []).map(s =>
                    typeof s === 'string' ? s : s.status_key
                  );

                  // Parse selected statuses for this tab
                  // If no statusList provided (just "Active"), default to ALL statuses in that tab
                  // If statusList is empty string (from "Active:"), return empty array
                  const selectedStatuses = isTabSelected
                    ? (statusList === null || statusList === undefined
                        ? allStatusKeysInTab  // No colon at all -> default to all
                        : statusList === ''
                          ? []  // Empty after colon ("Active:") -> explicit empty selection
                          : statusList.split(',').filter(s => s))  // Filter out empty strings
                    : [];

                  // For MUI Tabs value matching
                  const tabValue = isTabSelected ? selectedStatus : tab.value;

                  // Use StatusTabWithDropdown for status-configured tabs
                  return (
                    <StatusTabWithDropdown
                      key={tab.id || tab.value}
                      category={tab}
                      entity={entityName}
                      isSelected={isTabSelected}
                      selectedStatuses={selectedStatuses}
                      onCategoryClick={(categoryId) => {
                        // Switch to category - just pass the tab value (no status keys)
                        // The useEffect will auto-upgrade to include all statuses as defaults
                        // This ensures consistent behavior and resets selections on tab switch
                        onStatusChange(tab.value);
                      }}
                      onStatusToggle={(statusKey) => {
                        // Toggle a status in the multi-select
                        console.log('DashboardNavigation.onStatusToggle called with:', statusKey);
                        console.log('selectedStatuses from render:', selectedStatuses);
                        console.log('selectedStatus prop:', selectedStatus);
                        const currentStatuses = selectedStatuses.slice();
                        const index = currentStatuses.indexOf(statusKey);

                        if (index >= 0) {
                          // Remove status
                          currentStatuses.splice(index, 1);
                        } else {
                          // Add status
                          currentStatuses.push(statusKey);
                        }

                        // Update selection
                        // Use colon format even when empty to distinguish from tab switch
                        // 'Active:' = user explicitly deselected all (show empty state)
                        // 'Active' = tab switch, should auto-upgrade to defaults
                        const newStatus = `${tab.value}:${currentStatuses.join(',')}`;
                        console.log('Calling onStatusChange with:', newStatus);
                        onStatusChange(newStatus)
                      }}
                      value={tabValue}
                    />
                  );
                }

                // Regular tab (backward compatible)
                return <Tab key={tab.value} label={tab.label} value={tab.value} />;
              })}
            </Tabs>
          </Paper>
        </Box>

        {/* Filters - snap to centered 2-row layout when space runs out */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexShrink: 0, // Don't shrink - maintain full width until breakpoint
          flexWrap: { xs: 'wrap', sm: 'nowrap' }, // Wrap below 700px, no wrap at 700px+
          justifyContent: { xs: 'center', sm: 'flex-end' }, // Centered when wrapped, right-aligned when single row
          marginLeft: { xs: 0, sm: 'auto' }, // Center below 700px, right-align at 700px+
          width: { xs: '100%', sm: 'auto' }, // Full width for centering below 700px, auto at 700px+
          '@media (max-width: 699px)': {
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginLeft: 0,
            width: '100%',
          },
        }}>
          {/* Bulk Actions - Row 1 on wrapped, no order on single row */}
          <Box sx={{ order: { xs: 1, sm: 0 } }}>
            <BulkActionsButton
              selectedCount={selectedItems.length}
              totalCount={totalCount}
              onClearSelection={onClearSelection}
              onSelectAll={onSelectAll}
              onArchive={onBulkArchive}
              onDelete={onBulkDelete}
              onRestore={onBulkRestore}
              isArchived={showArchived}
              customActions={bulkActions}
            />
          </Box>

          {/* Scope - Row 1 on wrapped, no order on single row */}
          {scopeOptions.length > 0 && (
            <Box sx={{ order: { xs: 2, sm: 0 } }}>
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

          {/* Sort - Row 1 on wrapped, no order on single row */}
          {sortOptions.length > 0 && (
            <Box sx={{ order: { xs: 3, sm: 0 } }}>
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

          {/* Sort Order Toggle - Ascending/Descending */}
          {sortOptions.length > 0 && onSortOrderChange && (
            <Box sx={{ order: { xs: 3, sm: 0 } }}>
              <IconButton
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                size="small"
                sx={{
                  border: '1px solid',
                  borderColor: sortOrder === 'asc' ? 'primary.main' : 'divider',
                  backgroundColor: sortOrder === 'asc' ? alpha('#1976d2', 0.08) : 'transparent',
                  borderRadius: 1,
                  width: 36,
                  height: 36,
                  '&:hover': {
                    backgroundColor: sortOrder === 'asc' ? alpha('#1976d2', 0.12) : alpha('#000', 0.04),
                    borderColor: 'primary.main',
                  },
                }}
                title={sortOrder === 'asc' ? 'Ascending (A→Z) - Click for Descending' : 'Descending (Z→A) - Click for Ascending'}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUpward sx={{ fontSize: '1.125rem', color: 'primary.main' }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: '1.125rem', color: 'text.secondary' }} />
                )}
              </IconButton>
            </Box>
          )}

          {/* View toggles - Row 2 on wrapped, no order on single row */}
          <Box sx={{ order: { xs: 4, sm: 0 } }}>
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

          {/* Archive - Row 2 on wrapped, no order on single row */}
          <Box sx={{ order: { xs: 5, sm: 0 } }}>
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
