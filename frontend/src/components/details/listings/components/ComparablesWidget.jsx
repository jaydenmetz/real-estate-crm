import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { CompareArrows } from '@mui/icons-material';

/**
 * ComparablesWidget - Displays comparable properties and market analysis
 *
 * Props:
 * - entity: The full listing object
 * - data: Backend widget data (when Detail API implemented)
 * - computed: Computed fields from backend
 * - onClick: Function to open modal/expanded view
 */
const ComparablesWidget = ({ entity, data, computed, loading, onClick }) => {
  const listing = entity;

  if (loading) {
    return (
      <Paper sx={{ p: 3, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  const avgComparablePrice = listing?.avg_comparable_price || 0;
  const priceDiff = listing?.listing_price && avgComparablePrice
    ? listing.listing_price - avgComparablePrice
    : 0;
  const priceDiffPercent = avgComparablePrice
    ? ((priceDiff / avgComparablePrice) * 100).toFixed(1)
    : 0;

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
        <CompareArrows sx={{ color: 'secondary.main' }} />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Comparables
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            Average Comparable Price
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {avgComparablePrice ? `$${avgComparablePrice.toLocaleString()}` : 'N/A'}
          </Typography>
        </Box>

        {avgComparablePrice > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Price Difference
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: priceDiff >= 0 ? 'success.main' : 'error.main'
              }}
            >
              {priceDiff >= 0 ? '+' : ''}{priceDiffPercent}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {priceDiff >= 0 ? '+' : ''}${Math.abs(priceDiff).toLocaleString()}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary">
          Based on similar properties in the area
        </Typography>
      </Box>

      {onClick && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Click for detailed comparable analysis
        </Typography>
      )}
    </Paper>
  );
};

export default ComparablesWidget;
