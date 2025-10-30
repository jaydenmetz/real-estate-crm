import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Visibility } from '@mui/icons-material';

/**
 * ActivityWidget - Displays listing activity (views, showings, inquiries)
 *
 * Props:
 * - entity: The full listing object
 * - data: Backend widget data (when Detail API implemented)
 * - computed: Computed fields from backend
 * - onClick: Function to open modal/expanded view
 */
const ActivityWidget = ({ entity, data, computed, loading, onClick }) => {
  const listing = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const views = listing?.views || 0;
  const showings = listing?.showings || 0;
  const inquiries = listing?.inquiries || 0;
  const daysOnMarket = listing?.days_on_market || 0;

  return (
    <Paper
      sx={{
        p: 3,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { boxShadow: 6 } : {},
        transition: 'box-shadow 0.2s'
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Visibility sx={{ color: 'info.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Activity
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Views
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {views}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Showings
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {showings}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Inquiries
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {inquiries}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary">
            Days on Market
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {daysOnMarket}
          </Typography>
        </Box>
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for detailed activity log
        </Typography>
      )}
    </Paper>
  );
};

export default ActivityWidget;
