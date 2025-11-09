import React from 'react';
import {
  Paper,
  Tabs,
  Tab,
  Badge,
  alpha,
} from '@mui/material';

/**
 * EscrowTabs - Status tabs for escrow dashboard
 *
 * Displays: Active, Closed, Cancelled, All Escrows
 * Mobile also shows Archived tab with badge
 *
 * @param {Array} statusTabs - Tab configuration from config
 * @param {string} selectedStatus - Currently selected status
 * @param {Function} onStatusChange - Handler for status change
 * @param {number} archivedCount - Count for archived badge (mobile only)
 */
const EscrowTabs = ({
  statusTabs = [],
  selectedStatus,
  onStatusChange,
  archivedCount = 0,
}) => {
  return (
    <>
      {/* Desktop Tabs */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'none', md: 'block' },
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

      {/* Mobile/Tablet Tabs */}
      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
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
    </>
  );
};

export default EscrowTabs;
