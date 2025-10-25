import React from 'react';
import { Box, CircularProgress, Skeleton, Grid } from '@mui/material';
import DashboardEmptyState from '../../../components/common/dashboard/DashboardEmptyState';

const DashboardContent = ({
  children,
  loading = false,
  empty = false,
  emptyMessage = 'No data found',
  emptyAction = null,
  viewMode = 'grid',
  skeletonCount = 6
}) => {
  // Loading state
  if (loading) {
    return (
      <Box sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[...Array(skeletonCount)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="text" sx={{ mt: 1 }} />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // Empty state
  if (empty) {
    return (
      <DashboardEmptyState
        title={emptyMessage}
        subtitle={emptyAction?.subtitle || 'Get started by creating your first item'}
        actionLabel={emptyAction?.label}
        onAction={emptyAction?.onClick}
        icon={emptyAction?.icon}
        showAction={!!emptyAction?.onClick}
      />
    );
  }

  // Content with view mode
  return (
    <Box
      sx={{
        '& .dashboard-grid': {
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: viewMode === 'grid' ? 'repeat(2, 1fr)' : '1fr',
            md: viewMode === 'grid' ? 'repeat(3, 1fr)' : '1fr'
          },
          gap: 3
        },
        '& .dashboard-list': {
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        },
        '& .dashboard-table': {
          width: '100%'
        }
      }}
    >
      {children}
    </Box>
  );
};

export default DashboardContent;
