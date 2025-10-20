import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  FormControl,
  Select,
  MenuItem,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Badge,
  alpha,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Sort,
  CalendarToday,
  Delete as DeleteIcon,
  ViewModule,
  ViewList,
  TableChart,
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';

/**
 * EscrowNavigation - Navigation bar with tabs and controls for the Escrows Dashboard
 *
 * This component handles:
 * - Status tabs (Active, Closed, Cancelled, All, Archived)
 * - Scope selection (Brokerage, Team, User)
 * - Sort options
 * - View mode selection (Grid, List, Calendar)
 * - Archive/trash controls
 *
 * Extracted from EscrowsDashboard.jsx during Phase 4 refactoring
 * @since 1.0.5
 */
const EscrowNavigation = ({
  selectedStatus,
  setSelectedStatus,
  scope,
  setScope,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  showCalendar,
  setShowCalendar,
  archivedCount,
  searchQuery,
  setSearchQuery,
}) => {
  // Local state for search input (immediate feedback)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  // Debounced search - only update parent state after 300ms of no typing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [localSearchQuery, setSearchQuery]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    setSearchQuery('');
  }, [setSearchQuery]);

  return (
    <>
      {/* Navigation Bar with Tabs and Controls */}
      <Box sx={{ mb: 4 }}>
        {/* Tab Bar Container - Desktop */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-start',
            justifyContent: 'space-between',
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
              onChange={(e, newValue) => setSelectedStatus(newValue)}
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
              <Tab label="Active Escrows" value="active" />
              <Tab label="Closed Escrows" value="closed" />
              <Tab label="Cancelled Escrows" value="cancelled" />
              <Tab label="All Escrows" value="all" />
            </Tabs>
          </Paper>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right: Controls (no background) */}
          <Box sx={{
            display: 'flex',
            gap: 1.5,
            alignItems: 'center',
            flexWrap: 'wrap',
            flex: '0 0 auto',
            marginLeft: 'auto',
          }}>
            {/* Search Bar */}
            <TextField
              size="small"
              placeholder="Search escrows..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              variant="outlined"
              aria-label="Search escrows by address, buyer, seller, or escrow number"
              inputProps={{
                'aria-label': 'Search escrows',
                'role': 'searchbox',
              }}
              sx={{
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: localSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ padding: 0.5 }}
                    >
                      <ClearIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Scope Dropdown */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 110 }}>
              <Select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                disableUnderline
                aria-label="Select scope filter"
                inputProps={{
                  'aria-label': 'Scope filter',
                  'id': 'scope-select',
                }}
                renderValue={(value) => {
                  const labels = {
                    brokerage: 'Brokerage',
                    team: 'Team',
                    user: 'User',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
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
                <MenuItem value="brokerage">Brokerage</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Dropdown */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disableUnderline
                aria-label="Sort escrows by"
                inputProps={{
                  'aria-label': 'Sort by',
                  'id': 'sort-select',
                }}
                startAdornment={
                  <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
                }
                renderValue={(value) => {
                  const labels = {
                    closing_date: 'Closing Date',
                    created_at: 'Date Created',
                    sale_price: 'Sale Price',
                    property_address: 'Address',
                    escrow_status: 'Status',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
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
                <MenuItem value="closing_date">Closing Date</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="sale_price">Sale Price</MenuItem>
                <MenuItem value="property_address">Address</MenuItem>
                <MenuItem value="escrow_status">Status</MenuItem>
              </Select>
            </FormControl>

            {/* View Mode & Calendar Selector */}
            <ToggleButtonGroup
              value={showCalendar ? 'calendar' : viewMode}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  if (newValue === 'calendar') {
                    setShowCalendar(true);
                  } else {
                    setShowCalendar(false);
                    setViewMode(newValue);
                  }
                }
              }}
              size="small"
              aria-label="View mode selection"
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
              <ToggleButton
                value="table"
                title="Table view (dense, Excel-like)"
                aria-label="Table view"
              >
                {/* Wide horizontal rectangle (table row) - 17.2px wide, 6px tall */}
                <Box sx={{ width: 17.2, height: 6, bgcolor: 'currentColor', borderRadius: 0.5 }} aria-hidden="true" />
              </ToggleButton>
              <ToggleButton
                value="list"
                title="List view (horizontal rows)"
                aria-label="List view"
              >
                {/* 4 solid filled bars touching each other - same structure as grid but filled */}
                <Box sx={{ display: 'flex', gap: 0 }} aria-hidden="true">
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </Box>
              </ToggleButton>
              <ToggleButton
                value="grid"
                title="Grid view (cards) - Press V"
                aria-label="Grid view"
              >
                {/* 4 hollow outlines - represents grid cards */}
                <Box sx={{ display: 'flex', gap: 0.4 }} aria-hidden="true">
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                </Box>
              </ToggleButton>
              <ToggleButton
                value="calendar"
                title="Calendar view"
                aria-label="Calendar view"
              >
                <CalendarToday sx={{ fontSize: 16 }} aria-hidden="true" />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Archive/Trash Icon */}
            <IconButton
              size="small"
              onClick={() => setSelectedStatus('archived')}
              aria-label={`View archived escrows (${archivedCount})`}
              title="View archived escrows"
              sx={{
                width: 36,
                height: 36,
                backgroundColor: selectedStatus === 'archived' ? 'error.main' : alpha('#000', 0.06),
                color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: selectedStatus === 'archived' ? 'error.dark' : alpha('#000', 0.1),
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
      </Box>

      {/* Mobile/Tablet Layout - Responsive Design with All Features */}
      <Box sx={{ mb: 4, display: { xs: 'block', md: 'none' } }}>
        {/* Tab Bar - Mobile/Tablet */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          {/* Tabs (not full width) */}
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
              onChange={(e, newValue) => setSelectedStatus(newValue)}
              sx={{
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  fontWeight: 500,
                  minHeight: { xs: 48, sm: 52 },
                  px: { xs: 1.5, sm: 2.5 },
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
              {/* Show full labels at sm breakpoint, short labels at xs */}
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Active Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Active</Box>
                  </Box>
                }
                value="active"
              />
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Closed Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Closed</Box>
                  </Box>
                }
                value="closed"
              />
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>Cancelled Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>Cancelled</Box>
                  </Box>
                }
                value="cancelled"
              />
              <Tab
                label={
                  <Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>All Escrows</Box>
                    <Box sx={{ display: { xs: 'block', sm: 'none' } }}>All</Box>
                  </Box>
                }
                value="all"
              />
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

          {/* Right side controls */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flex: '0 0 auto', marginLeft: 'auto' }}>
            {/* Search Bar - Mobile/Tablet */}
            <TextField
              size="small"
              placeholder="Search..."
              value={localSearchQuery}
              onChange={(e) => setLocalSearchQuery(e.target.value)}
              variant="outlined"
              sx={{
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'transparent',
                  borderRadius: 1,
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: localSearchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{ padding: 0.5 }}
                    >
                      <ClearIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Scope Dropdown - Mobile */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 100 }}>
              <Select
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                disableUnderline
                renderValue={(value) => {
                  const labels = {
                    brokerage: 'Brokerage',
                    team: 'Team',
                    user: 'User',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
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
                <MenuItem value="brokerage">Brokerage</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Dropdown */}
            <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disableUnderline
                startAdornment={
                  <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
                }
                renderValue={(value) => {
                  const labels = {
                    closing_date: 'Date',
                    created_at: 'Created',
                    sale_price: 'Price',
                    property_address: 'Address',
                    escrow_status: 'Status',
                  };
                  return (
                    <Typography variant="body2" sx={{
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: 'text.primary',
                    }}>
                      {labels[value]}
                    </Typography>
                  );
                }}
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
                <MenuItem value="closing_date">Closing Date</MenuItem>
                <MenuItem value="created_at">Date Created</MenuItem>
                <MenuItem value="sale_price">Sale Price</MenuItem>
                <MenuItem value="property_address">Address</MenuItem>
                <MenuItem value="escrow_status">Status</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* View Mode & Archive Controls - Mobile/Tablet */}
        <Box
          sx={{
            backgroundColor: alpha('#f5f5f5', 0.4),
            borderRadius: '8px',
            p: 2,
            mt: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* View Mode, Calendar, Archive - Mobile */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {/* View Mode & Calendar Selector */}
            <ToggleButtonGroup
              value={showCalendar ? 'calendar' : viewMode}
              exclusive
              onChange={(e, newValue) => {
                if (newValue !== null) {
                  if (newValue === 'calendar') {
                    setShowCalendar(true);
                  } else {
                    setShowCalendar(false);
                    setViewMode(newValue);
                  }
                }
              }}
              size="small"
              aria-label="View mode and calendar selection"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontWeight: 500,
                  height: '32px', // Match height across all buttons
                },
              }}
            >
              <ToggleButton
                value="table"
                aria-label="Table view"
                title="Table view (dense, Excel-like)"
              >
                {/* Wide horizontal rectangle (table row) - 17.2px wide, 6px tall */}
                <Box sx={{ width: 17.2, height: 6, bgcolor: 'currentColor', borderRadius: 0.5 }} aria-hidden="true" />
              </ToggleButton>
              <ToggleButton
                value="list"
                aria-label="List view"
                title="List view (horizontal rows)"
              >
                {/* 4 solid filled bars touching each other - same structure as grid but filled */}
                <Box sx={{ display: 'flex', gap: 0 }} aria-hidden="true">
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  <Box sx={{ width: 4.3, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </Box>
              </ToggleButton>
              <ToggleButton
                value="grid"
                aria-label="Grid view"
                title="Grid view (cards) - Press V"
              >
                {/* 4 hollow outlines - represents grid cards */}
                <Box sx={{ display: 'flex', gap: 0.4 }} aria-hidden="true">
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                  <Box sx={{ width: 4, height: 10, border: '1px solid currentColor', borderRadius: 0.5, boxSizing: 'border-box' }} />
                </Box>
              </ToggleButton>
              <ToggleButton
                value="calendar"
                aria-label="Calendar view"
                title="Calendar view"
              >
                <CalendarToday sx={{ fontSize: 16 }} />
              </ToggleButton>
            </ToggleButtonGroup>

            {/* Archive/Trash Icon */}
            <IconButton
              size="small"
              onClick={() => setSelectedStatus('archived')}
              sx={{
                width: 40,
                height: 40,
                backgroundColor: selectedStatus === 'archived' ? 'error.main' : alpha('#000', 0.06),
                color: selectedStatus === 'archived' ? 'white' : 'text.secondary',
                '&:hover': {
                  backgroundColor: selectedStatus === 'archived' ? 'error.dark' : alpha('#000', 0.1),
                },
                transition: 'all 0.2s',
              }}
            >
              <Badge badgeContent={archivedCount} color="error" max={99}>
                <DeleteIcon />
              </Badge>
            </IconButton>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default EscrowNavigation;