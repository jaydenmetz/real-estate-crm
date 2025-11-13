/**
 * EscrowNavigation - Custom navigation for escrows dashboard
 *
 * Combines tabs and filters into organized, modular components
 *
 * Structure:
 * - tabs/EscrowTabs.jsx - Active, Closed, Cancelled, All tabs
 * - filters/ScopeFilter.jsx - Team/User dropdown
 * - filters/SortFilter.jsx - Sort dropdown
 * - filters/ViewModeToggle.jsx - Card/List/Table buttons
 * - filters/ArchiveButton.jsx - Trash icon
 */

import React from 'react';
import { Box, alpha } from '@mui/material';
import EscrowTabs from './tabs/EscrowTabs';
import ScopeFilter from './filters/ScopeFilter';
import SortFilter from './filters/SortFilter';
import ViewModeToggle from './filters/ViewModeToggle';
import ArchiveButton from './filters/ArchiveButton';

const EscrowNavigation = ({
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
  // Get config options
  const sortOptions = config?.sortOptions || [];
  const scopeOptions = config?.scopeOptions || [];
  const statusTabs = config?.statusTabs || [];

  return (
    <Box sx={{ mb: 4 }}>
      {/* Desktop/Tablet Layout - Flexible single row with wrap */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between', // Force space between tabs and filters
          gap: 2,
          mb: 2,
        }}
      >
        {/* Status Tabs - only takes space it needs */}
        <Box sx={{ flexShrink: 0 }}>
          <EscrowTabs
            statusTabs={statusTabs}
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
            archivedCount={archivedCount}
          />
        </Box>

        {/* Filters - stay right-justified, allow horizontal scroll if needed */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexShrink: 0,
          overflowX: 'auto',
          maxWidth: '100%',
        }}>
          <ScopeFilter
            scopeOptions={scopeOptions}
            selectedScope={selectedScope}
            onScopeChange={onScopeChange}
          />

          <SortFilter
            sortOptions={sortOptions}
            sortBy={sortBy}
            onSortByChange={onSortByChange}
          />

          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            showCalendar={showCalendar}
            onShowCalendarChange={onShowCalendarChange}
          />

          <ArchiveButton
            selectedStatus={selectedStatus}
            onStatusChange={onStatusChange}
            archivedCount={archivedCount}
          />
        </Box>
      </Box>

      {/* Mobile/Tablet Layout */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {/* Tabs at top (includes archived tab on mobile) */}
        <EscrowTabs
          statusTabs={statusTabs}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          archivedCount={archivedCount}
        />

        {/* Filter controls below tabs */}
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
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <ScopeFilter
              scopeOptions={scopeOptions}
              selectedScope={selectedScope}
              onScopeChange={onScopeChange}
            />

            <SortFilter
              sortOptions={sortOptions}
              sortBy={sortBy}
              onSortByChange={onSortByChange}
            />

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              showCalendar={showCalendar}
              onShowCalendarChange={onShowCalendarChange}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default EscrowNavigation;
