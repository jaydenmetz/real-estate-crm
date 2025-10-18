/**
 * LeadNavigation.jsx - Navigation bar with tabs, view controls, and filters
 *
 * Contains:
 * - Status tabs (New, Contacted, Qualified, Converted, Lost, Archived)
 * - Scope selector (Brokerage, Team, User)
 * - Sort dropdown
 * - View mode toggle (Small grid, Large cards)
 * - Calendar button
 * - Archive/trash button
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

const LeadNavigation = ({
  selectedStatus,
  setSelectedStatus,
  viewMode,
  setViewMode,
  sortBy,
  setSortBy,
  scope,
  setScope,
  setCalendarDialogOpen,
  archivedCount,
}) => {
  return (
    <Box sx={{ mb: 4 }}>
      {/* Desktop Layout */}
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
            <Tab label="New Leads" value="new" />
            <Tab label="Contacted" value="contacted" />
            <Tab label="Qualified" value="qualified" />
            <Tab label="Converted" value="converted" />
            <Tab label="Lost" value="lost" />
            <Tab label="All Leads" value="all" />
          </Tabs>
        </Paper>

        {/* Spacer */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right: Controls */}
        <Box sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexWrap: 'wrap',
          flex: '0 0 auto',
          marginLeft: 'auto',
        }}>
          {/* Scope Dropdown */}
          <FormControl size="small" variant="standard" sx={{ minWidth: 110 }}>
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
          <FormControl size="small" variant="standard" sx={{ minWidth: 140 }}>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              disableUnderline
              startAdornment={
                <Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />
              }
              renderValue={(value) => {
                const labels = {
                  created_at: 'Created Date',
                  lead_score: 'Lead Score',
                  first_name: 'Name',
                  email: 'Email',
                  status: 'Status',
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
              <MenuItem value="created_at">Created Date</MenuItem>
              <MenuItem value="lead_score">Lead Score</MenuItem>
              <MenuItem value="first_name">Name</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="status">Status</MenuItem>
            </Select>
          </FormControl>

          {/* View Mode & Calendar Selector */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newValue) => {
              if (newValue !== null) {
                setViewMode(newValue);
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
            <ToggleButton value="small" title="Grid view (V)">
              <Box sx={{ display: 'flex', gap: 0.4 }}>
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
              </Box>
            </ToggleButton>
            <ToggleButton value="large" title="Full width view (V)">
              <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Calendar Button */}
          <IconButton
            size="small"
            onClick={() => setCalendarDialogOpen(true)}
            sx={{
              width: 36,
              height: 36,
              backgroundColor: alpha('#000', 0.06),
              '&:hover': {
                backgroundColor: alpha('#000', 0.1),
              },
            }}
          >
            <CalendarToday sx={{ fontSize: 16 }} />
          </IconButton>

          {/* Archive/Trash Icon */}
          <IconButton
            size="small"
            onClick={() => setSelectedStatus('archived')}
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
            onChange={(e, newValue) => setSelectedStatus(newValue)}
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
            <Tab label="New" value="new" />
            <Tab label="Contacted" value="contacted" />
            <Tab label="Qualified" value="qualified" />
            <Tab label="Converted" value="converted" />
            <Tab label="Lost" value="lost" />
            <Tab label="All" value="all" />
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
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                renderValue={(value) => {
                  const labels = {
                    brokerage: 'Brokerage',
                    team: 'Team',
                    user: 'User',
                  };
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        {labels[value]}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="brokerage">Brokerage</MenuItem>
                <MenuItem value="team">Team</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Select>
            </FormControl>

            {/* Sort Dropdown */}
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
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<Sort sx={{ mr: 1, fontSize: '1.125rem', color: 'text.secondary' }} />}
                renderValue={(value) => {
                  const labels = {
                    created_at: 'Created Date',
                    lead_score: 'Lead Score',
                    first_name: 'Name',
                    email: 'Email',
                    status: 'Status',
                  };
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Sort: {labels[value]}
                      </Typography>
                    </Box>
                  );
                }}
              >
                <MenuItem value="created_at">Created Date</MenuItem>
                <MenuItem value="lead_score">Lead Score</MenuItem>
                <MenuItem value="first_name">Name</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>

            {/* View Mode & Calendar - Mobile */}
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newValue) => {
                  if (newValue !== null) {
                    setViewMode(newValue);
                  }
                }}
                size="small"
                aria-label="View mode selection"
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
                <ToggleButton
                  value="small"
                  aria-label="Grid view"
                  title="Grid view (V)"
                >
                  <Box sx={{ display: 'flex', gap: 0.4 }}>
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                    <Box sx={{ width: 4, height: 10, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                  </Box>
                </ToggleButton>
                <ToggleButton
                  value="large"
                  aria-label="Full width view"
                  title="Full width view (V)"
                >
                  <Box sx={{ width: 24, height: 12, bgcolor: 'currentColor', borderRadius: 0.5 }} />
                </ToggleButton>
              </ToggleButtonGroup>

              {/* Calendar Button */}
              <IconButton
                size="small"
                onClick={() => setCalendarDialogOpen(true)}
                sx={{
                  width: 36,
                  height: 36,
                  backgroundColor: 'white',
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': {
                    backgroundColor: alpha('#000', 0.04),
                  },
                }}
              >
                <CalendarToday sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LeadNavigation;
